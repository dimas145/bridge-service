import { Request, Response } from 'express'
import { Repository } from '../../Model/Repositories'

export async function saveMetric(req: Request, res: Response) {
    console.log(`hit ${new Date()} - save metric file`)

    const { courseId, activityId } = req.params

    const { contentHash, mimetype, rawContent } = req.body

    if (!contentHash || !mimetype || !rawContent) {
        return res.status(400).send('Bad request')
    }

    await Repository.findOneAndUpdate({ courseId: Number(courseId), activityId: Number(activityId) }, {
        metricFile: {
            contentHash,
            mimetype,
            rawContent
        }
    })

    return res.send({
        success: true
    })
}