import { Request, Response } from 'express'
import { MetricFile } from '../../Model/MetricFile'
import { Repository } from '../../Model/Repository'
import { deleteFile, saveFile } from '../../Utils/file'

export async function saveMetric(req: Request, res: Response) {
    console.log(`hit ${new Date()} - save metric file`)

    const { courseId, activityId } = req.params

    const { contentHash, mimetype, rawContent } = req.body

    if (!contentHash || !mimetype || !rawContent) {
        return res.status(400).send('Bad request')
    }

    const repository = await Repository.findOne({
        courseId: Number(courseId),
        activityId: Number(activityId)
    })

    const metricFile = await MetricFile.findOne({
        repository
    })

    if (!repository) {
        return res.status(404).send('repository not found')
    }

    if (metricFile) {
        if (metricFile.contentHash === contentHash) {
            return res.send({
                success: true,
                message: 'already created'
            })
        }
        deleteFile(metricFile.filename)
        const filename = await saveFile(rawContent, mimetype)
        await MetricFile.update({ repository },{
            contentHash,
            mimetype,
            filename
        })
    } else {
        const filename = await saveFile(rawContent, mimetype)
        const model = await MetricFile.create({
            contentHash,
            mimetype,
            filename,
            repository
        })
        await model.save()
    }

    return res.send({
        success: true
    })
}