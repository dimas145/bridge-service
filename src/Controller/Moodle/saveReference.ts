import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import { Logger } from 'tslog'

const log: Logger = new Logger()

export async function saveReference(req: Request, res: Response) {
    log.info('Save code reference')

    const { courseId, assignmentId, contentHash, extension, filename, rawContent } = req.body

    if (!contentHash || !extension || !filename || !rawContent) {
        return res.status(400).send('Bad request')
    }

    const repository = await Repository.findOne({
        courseId: Number(courseId),
        assignmentId: Number(assignmentId)
    })

    if (!repository) {
        return res.status(404).send('repository not found')
    }

    const model = CodeReference.create({
        contentHash,
        extension,
        filename,
        content: rawContent,
        repository
    })
    await model.save()

    return res.send({
        success: true
    })
}
