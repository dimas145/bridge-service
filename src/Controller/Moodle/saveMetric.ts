import { Request, Response } from 'express'
import { Repository } from '../../Model/Repositories'
import { deleteFile, saveFile } from '../../Utils/file'
// import { saveFile } from '../../Utils/file'

export async function saveMetric(req: Request, res: Response) {
    console.log(`hit ${new Date()} - save metric file`)

    const { courseId, activityId } = req.params

    const { contentHash, mimetype, rawContent } = req.body

    if (!contentHash || !mimetype || !rawContent) {
        return res.status(400).send('Bad request')
    }

    const repository = await Repository.findOne({ courseId: Number(courseId), activityId: Number(activityId) })

    if (!repository) {
        return res.status(404).send('repository not found')
    }

    if (repository.metricFile?.contentHash) {
        if (repository.metricFile?.contentHash === contentHash) {
            return res.send({
                success: true,
                message: 'already created'
            })
        }
        deleteFile(repository.metricFile.filename)
    }

    const filename = await saveFile(rawContent, mimetype)

    await Repository.findOneAndUpdate({ courseId: Number(courseId), activityId: Number(activityId) }, {
        metricFile: {
            contentHash,
            mimetype,
            filename
        }
    })

    return res.send({
        success: true
    })
}