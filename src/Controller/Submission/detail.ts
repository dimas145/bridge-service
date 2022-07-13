import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import { SubmissionHistoryDetail } from '../../Model/SubmissionHistoryDetail'

export async function detail(req: Request, res: Response) {
    const { userId, courseId, assignmentId } = req.query

    if (!userId || !courseId || !assignmentId) {
        return res.status(400).send('Bad request')
    }

    try {
        const repository = await Repository.findOneOrFail({
            relations: ['graders'],
            where: { courseId, assignmentId }
        })

        const submission = []
        for (let i = 0; i < repository.graders.length; i++) {
            const grader = repository.graders[i]
            const details = await SubmissionHistoryDetail.find({
                repositoryCourseId: Number(courseId),
                repositoryAssignmentId: Number(assignmentId),
                studentUserId: Number(userId),
                autograderName: grader.name,
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

            submission.push({
                graderName: grader.name,
                feedbacks
            })
        }

        return res.send({
            success: true,
            submission,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            success: false,
            message: error
        })
    }
}
