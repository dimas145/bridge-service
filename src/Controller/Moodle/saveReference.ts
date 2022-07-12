import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'

export async function saveReference(req: Request, res: Response) {
    console.log(`hit ${new Date()} - save code reference file`)

    const { courseId, activityId, contentHash, extension, filename, rawContent } = req.body

    if (!contentHash || !extension || !filename || !rawContent) {
        return res.status(400).send('Bad request')
    }

    const repository = await Repository.findOne({
        courseId: Number(courseId),
        activityId: Number(activityId)
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
