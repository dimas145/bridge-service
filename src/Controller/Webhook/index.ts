import { Request, Response } from 'express'
import { Repositories } from '@gitbeaker/node'
import { Queue } from '../../Queue'
import { Constant } from '../../constant'
import { Webhook as WebhookType } from '../../Type/Webhook'
import { User } from '../../Model/User'
import { Repository } from '../../Model/Repositories'
import { getFile } from '../../Utils/file'

export async function Webhook(req: Request, res: Response) {
    res.send('received') // just to give 200 to gitlab

    if (req.headers['x-gitlab-event'] !== Constant.MERGE_REQUEST_HOOK || req.headers['x-gitlab-token'] !== process.env.GITLAB_WEBHOOK_SECRET_TOKEN) {
        return
    }

    const { courseId, activityId } = req.params

    const webhookBody: WebhookType.WebhookBody = req.body

    const repoService = new Repositories({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    /**
    * Send to queue:
    * - tar.gz data
    * - student user data
    * - tescases
    */

    // how to map project Id / gitlab user data / gitlab user name to moodle user data

    const projectId = webhookBody.object_attributes.source.id

    const targzSourceCode: any = await repoService.showArchive(projectId, { fileType: 'tar.gz' })
    const targzBase64 = Buffer.from(targzSourceCode).toString('base64')
    const student = await User.findOne({ gitlabProfileId: webhookBody.object_attributes.author_id })
    console.log('student',student)
    // console.log(webhookBody)
    if(!student){
        return // no need to process user that hasn't register
    }

    const repository = await Repository.findOne({ courseId: Number(courseId), activityId: Number(activityId) })

    if (!repository || !repository.metricFile?.filename){
        return // no metric file or repo
    }

    let data = {
        'sourceCodeBase64': targzBase64,
        projectId,
        'userId': student.userId,
        courseId,
        activityId,
    }

    if (repository.metricFile.mimetype == 'application/json'){
        const rawContent = await getFile(repository.metricFile.filename)
        data = {
            ...data,
            ...JSON.parse(rawContent.toString())
        }
    } else {
        data = {
            ...data,
            ...repository.metricFile
        }
    }

    Queue.sendMessage(Constant.GRADING_QUEUE, JSON.stringify({ data }))
}
