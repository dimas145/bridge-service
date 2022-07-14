import { Request, Response } from 'express'
import { Repository } from '../../Model/Repository'

export async function detail(req: Request, res: Response) {
    const { courseId, assignmentId } = req.query

    if (!courseId || !assignmentId) {
        return res.status(400).send('Bad request')
    }

    try {
        const repository = await Repository.findOneOrFail({
            relations: ['graders'],
            where: { courseId, assignmentId }
        })

        return res.send({
            success: true,
            repository,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            success: false,
            message: error
        })
    }
}
