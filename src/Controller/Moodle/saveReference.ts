import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import { saveFile } from '../../Utils/file'

export async function saveReference(req: Request, res: Response) {
    console.log(`hit ${new Date()} - save code reference file`)

    const { courseId, activityId } = req.params

    const { contentHash, extension, rawContent } = req.body

    if (!contentHash || !extension || !rawContent) {
        return res.status(400).send('Bad request')
    }

    const repository = await Repository.findOne({
        courseId: Number(courseId),
        activityId: Number(activityId)
    })

    if (!repository) {
        return res.status(404).send('repository not found')
    }

    const reference = await CodeReference.findOne({
        contentHash
    })

    if (reference) {
        if (reference.contentHash === contentHash) {
            return res.send({
                success: true,
                message: 'already created'
            })
        }
    }

    const filename = await saveFile(rawContent, extension)
    const model = CodeReference.create({
        contentHash,
        extension,
        filename,
        repository
    })
    await model.save()

    return res.send({
        success: true
    })
}