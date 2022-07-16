import { Request, Response } from 'express'
import { Gitlab } from '@gitbeaker/node'
import { Constant } from '../../constant'
import { Webhook as WebhookType } from '../../Type/Webhook'
import { Student } from '../../Model/Student'
import { Repository } from '../../Model/Repository'
import { CodeReference } from '../../Model/CodeReference'
import { SubmissionHistory } from '../../Model/SubmissionHistory'
import { SubmissionHistoryDetail } from '../../Model/SubmissionHistoryDetail'
import { DockerStatus } from '../../Type/Docker'
import { GradingMethod, GradingPriority } from '../../Type/Grading'
import axios from 'axios'

export async function Webhook(req: Request, res: Response) {
    res.send('received') // just to give 200 to gitlab

    if (req.headers['x-gitlab-event'] !== Constant.MERGE_REQUEST_HOOK || req.headers['x-gitlab-token'] !== process.env.GITLAB_WEBHOOK_SECRET_TOKEN) {
        return
    }

    const { courseId, assignmentId } = req.params

    const webhookBody: WebhookType.WebhookBody = req.body

    const gitlabService = new Gitlab({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    const student = await Student.findOne({ gitlabProfileId: webhookBody.object_attributes.author_id })

    if (!student) {
        return // no need to process user that hasn't register
    }

    const repositoryId = { courseId: Number(courseId), assignmentId: Number(assignmentId) }
    const repository = await Repository.findOne({
        relations: ['graders'],
        where: repositoryId
    })
    if (!repository) { // no repo
        return
    }

    const references = await CodeReference.find({ repository })

    if (references.length == 0) { // no reference files
        return
    }

    if (new Date() > repository.dueDate) { // ignore late submission
        return
    }

    if (repository.gradingPriority == GradingPriority.FIRST) {
        const [_, count] = await SubmissionHistory.findAndCount({ repository, student })
        if (count > 0) { // not accepting any submission
            return
        }
    }

    /**
    * Send to grader:
    * - references code in base64
    * - referencesFileNames
    * - solution code in base64
    * - solutionFileName
    * - timeLimit
    * - gradingMethod
    */

    const projectId = webhookBody.object_attributes.source.id
    let solutionFileName: string
    let solution: string
    try {
        const mrChanges: any = await gitlabService.MergeRequests.changes(projectId, webhookBody.object_attributes.iid)
        const file: any = await gitlabService.RepositoryFiles.show(
            projectId,
            mrChanges.changes[0].new_path,  // assume only 1 file is changed
            mrChanges.diff_refs.head_sha
        )

        solution = file.content
        solutionFileName = file.file_name
    } catch (e) {
        console.error('error get student source code', projectId)
        console.error(e)
        return
    }

    const data = {
        references: references.map((ref) => ref.content),
        referencesFileNames: references.map((ref) => `${ref.filename}.${ref.extension}`),
        solution,
        solutionFileName,
        timeLimit: repository.timeLimit,
        gradingMethod: repository.gradingMethod
    }

    let finalGrade = repository.gradingMethod == GradingMethod.MINIMUM ? 100 : 0
    let count = 0
    for (let i = 0; i < repository.graders.length; i++) {
        const grader = repository.graders[i]

        if (grader.status === DockerStatus.RUNNING) {
            const submissionHistory = SubmissionHistory.create({
                repository,
                student,
                autograder: grader
            })

            const submissionHistoryDetail = SubmissionHistoryDetail.create({
                repository,
                student,
                autograder: grader
            })

            try {
                const response = await axios.post(grader.url + Constant.GRADER_GRADING_ENDPOINT, data)

                if (!response.data.error) {
                    const responseData = response.data.data
                    submissionHistory.grade = responseData.grade
                    submissionHistory.save()

                    const feedbacks = responseData.feedback
                    for (let j = 0; j < feedbacks.length; j++) {
                        submissionHistoryDetail.codeReferenceId = references[j].id
                        submissionHistoryDetail.detail = feedbacks[j]

                        submissionHistoryDetail.save()
                    }
                } else {
                    throw new Error(response.data.message)
                }
            } catch (error) {
                console.error(error)
                submissionHistory.grade = 0
                await submissionHistory.save()
            }

            if (repository.gradingMethod == GradingMethod.AVERAGE) {
                finalGrade += submissionHistory.grade
                count += 1
            } else if (repository.gradingMethod == GradingMethod.MAXIMUM && submissionHistory.grade > finalGrade ||
                repository.gradingMethod == GradingMethod.MINIMUM && submissionHistory.grade < finalGrade) {
                finalGrade = submissionHistory.grade
            }
        }
    }

    if (repository.gradingMethod == GradingMethod.AVERAGE && finalGrade > 0 && count > 0) {
        finalGrade /= count
    }
    try {
        await axios.get(process.env.MOODLE_HOST + '/webservice/rest/server.php', {
            params: {
                'moodlewsrestformat': 'json',
                'wstoken': process.env.MOODLE_TOKEN,
                'wsfunction': Constant.WS_FUNCTION_UPDATE_GRADE,
                'assignmentid': assignmentId,
                'userid': student.userId,
                'grade': finalGrade,
                'attemptnumber': -1,
                'addattempt': 1,
                'workflowstate': Constant.WORKFLOWSTATE,
                'applytoall': 0,
            }
        })
        console.log('success')
    } catch (error) {
        console.log('error', error)
    }
}
