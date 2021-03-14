import { Request, Response } from 'express'
import { Repositories } from '@gitbeaker/node'
import { Queue } from '../../Queue'
import { Constant } from '../../constant'
import { Webhook as WebhookType } from '../../Type/Webhook'

export async function Webhook(req: Request, res: Response) {
    res.send('received') // just to give 200 to gitlab

    if (req.headers['x-gitlab-event'] !== Constant.MERGE_REQUEST_HOOK || req.headers['x-gitlab-token'] !== process.env.GITLAB_WEBHOOK_SECRET_TOKEN) {
        return
    }

    const { assignmentId } = req.params

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
    const data = {
        'sourceCodeBase64': targzBase64,
        projectId,
        assignmentId,
        'entry': 'main.py',
        'testcases': [
            {
                'input': '1',
                'output': 'True'
            },
            {
                'input': '2',
                'output': 'False'
            }
        ]
    }
    Queue.sendMessage(Constant.GRADING_QUEUE, JSON.stringify({ data }))
}
