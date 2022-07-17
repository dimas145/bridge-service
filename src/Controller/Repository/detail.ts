import { Request, Response } from 'express'
import { Repository } from '../../Model/Repository'
import { Logger } from 'tslog'

const log: Logger = new Logger()

export async function detail(req: Request, res: Response) {
    log.info('Repository detail')
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
        log.error(error)
        return res.status(400).send({
            success: false,
            message: error
        })
    }
}
