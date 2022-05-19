import { Request, Response } from 'express'
import { MetricFile } from '../../Model/MetricFile'
import { Repository } from '../../Model/Repository'
import { saveFile } from '../../Utils/file'

export async function saveMetric(req: Request, res: Response) {
    console.log(`hit ${new Date()} - save metric file`)

    const { courseId, activityId } = req.params

    const { contentHash, extension, rawContent } = req.body

    if (!contentHash || !extension || !rawContent) {
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
    }

    const filename = await saveFile(rawContent, extension)
    const model = await MetricFile.create({
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