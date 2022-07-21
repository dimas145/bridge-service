import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import { Submission } from '../../Model/Submission'
import { SubmissionDetail } from '../../Model/SubmissionDetail'
import { Logger } from 'tslog'

const log: Logger = new Logger()

export async function detail(req: Request, res: Response) {
    log.info('Submission detail')
    const { userId, courseId, assignmentId } = req.query

    if (!userId || !courseId || !assignmentId) {
        return res.status(400).send('Bad request')
    }

    try {
        const repository = await Repository.findOneOrFail({
            relations: ['graders'],
            where: { courseId, assignmentId }
        })

        const result = []
        for (let i = 0; i < repository.graders.length; i++) {
            const grader = repository.graders[i]
            const submission = await Submission.findOneOrFail({
                repositoryCourseId: Number(courseId),
                repositoryAssignmentId: Number(assignmentId),
                studentUserId: Number(userId),
                autograderImageName: grader.imageName,
            })
            const details = await SubmissionDetail.find({
                repositoryCourseId: Number(courseId),
                repositoryAssignmentId: Number(assignmentId),
                studentUserId: Number(userId),
                autograderImageName: grader.imageName,
            })

            const feedbacks = []
            for (let j = 0; j < details.length; j++) {
                const reference = await CodeReference.findOneOrFail({
                    id: details[j].codeReferenceId
                })

                feedbacks.push({
                    referenceName: reference.filename,
                    feedback: details[j].detail
                })
            }

            result.push({
                graderName: grader.displayedName,
                grade: submission.grade,
                feedbacks
            })
        }

        return res.send({
            success: true,
            result,
        })
    } catch (error) {
        log.error(error)
        return res.status(400).send({
            success: false,
            message: error
        })
    }
}
