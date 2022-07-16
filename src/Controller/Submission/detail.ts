import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import { Submission } from '../../Model/Submission'
import { SubmissionDetail } from '../../Model/SubmissionDetail'

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

        const result = []
        for (let i = 0; i < repository.graders.length; i++) {
            const grader = repository.graders[i]
            const submission = await Submission.findOneOrFail({
                repositoryCourseId: Number(courseId),
                repositoryAssignmentId: Number(assignmentId),
                studentUserId: Number(userId),
                autograderImageName: grader.name,
            })
            const details = await SubmissionDetail.find({
                repositoryCourseId: Number(courseId),
                repositoryAssignmentId: Number(assignmentId),
                studentUserId: Number(userId),
                autograderImageName: grader.name,
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
        console.log(error)
        return res.status(400).send({
            success: false,
            message: error
        })
    }
}
