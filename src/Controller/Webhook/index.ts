import { Request, Response } from 'express'
import { Gitlab } from '@gitbeaker/node'
import { Constant } from '../../constant'
import { Webhook as WebhookType } from '../../Type/Webhook'
import { Student } from '../../Model/Student'
import { Repository } from '../../Model/Repository'
import { CodeReference } from '../../Model/CodeReference'
import { Submission } from '../../Model/Submission'
import { SubmissionDetail } from '../../Model/SubmissionDetail'
import { DockerStatus } from '../../Type/Docker'
import { GradingMethod, GradingPriority } from '../../Type/Grading'
import { Logger } from 'tslog'
import axios from 'axios'

const log: Logger = new Logger()

export async function Webhook(req: Request, res: Response) {
    log.info('Webhook recieved')
    res.send('received') // just to give 200 to gitlab

    if (req.headers['x-gitlab-event'] !== Constant.MERGE_REQUEST_HOOK || req.headers['x-gitlab-token'] !== process.env.GITLAB_WEBHOOK_SECRET_TOKEN) {
        return
    }

    const { courseId, assignmentId } = req.params

    const webhookBody: WebhookType.WebhookBody = req.body

    const projectId = webhookBody.project.id
    const webhookIid = webhookBody.object_attributes.iid
    const gitlabService = new Gitlab({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    if (webhookBody.object_attributes.state != 'opened') {
        return
    }
    const mrChanges: any = await gitlabService.MergeRequests.changes(projectId, webhookIid)
    const file: any = await gitlabService.RepositoryFiles.show(
        projectId,
        mrChanges.changes[0].new_path,  // assume only 1 file is changed
        mrChanges.diff_refs.head_sha
    )
    gitlabService.MergeRequests.remove(projectId, webhookIid)

    const student = await Student.findOne({ gitlabProfileId: webhookBody.object_attributes.author_id })

    if (!student) {
        log.info('Unknown student')
        return // no need to process user that hasn't register
    }

    const repositoryId = { courseId: Number(courseId), assignmentId: Number(assignmentId) }
    const repository = await Repository.findOne({
        relations: ['graders'],
        where: repositoryId
    })
    if (!repository) { // no repo
        log.info('Unknown repository')
        return
    }

    const references = await CodeReference.find({ repository })

    if (references.length == 0) {
        log.info('Reference files missing')
        return
    }

    if (new Date() > repository.dueDate) {
        log.info('Late submission')
        return
    }

    if (repository.gradingPriority == GradingPriority.FIRST) {
        const [_, count] = await Submission.findAndCount({ repository, student })
        if (count > 0) { // not accepting any submission
            log.info('Only accepts first submission')
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

    let solutionFileName: string
    let solution: string
    try {
        solution = file.content
        solutionFileName = file.file_name
    } catch (e) {
        log.error('error get student source code', projectId)
        log.error(e)
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
            const submission = Submission.create({
                repository,
                student,
                autograder: grader
            })

            const submissionDetail = SubmissionDetail.create({
                repository,
                student,
                autograder: grader
            })

            try {
                const response = await axios.post(grader.url + Constant.GRADER_GRADING_ENDPOINT, data)

                if (!response.data.error) {
                    const responseData = response.data.data
                    submission.grade = responseData.grade
                    await submission.save()

                    const feedbacks = responseData.feedback
                    for (let j = 0; j < Math.min(references.length, feedbacks.length); j++) {
                        submissionDetail.codeReferenceId = references[j].id
                        submissionDetail.detail = feedbacks[j]

                        await submissionDetail.save()
                    }
                } else {
                    throw new Error(response.data.message)
                }
            } catch (error) {
                log.error(error)
                submission.grade = 0
                await submission.save()
            }

            if (repository.gradingMethod == GradingMethod.AVERAGE) {
                finalGrade += submission.grade
                count += 1
            } else if (repository.gradingMethod == GradingMethod.MAXIMUM && submission.grade > finalGrade ||
                repository.gradingMethod == GradingMethod.MINIMUM && submission.grade < finalGrade) {
                finalGrade = submission.grade
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
        log.info('success')
    } catch (error) {
        log.error('error', error)
    }
}
