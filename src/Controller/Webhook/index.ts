import { Request, Response } from 'express'
import { Repositories } from '@gitbeaker/node'


const MERGE_REQUEST_HOOK = 'Merge Request Hook'

export async function Webhook(req: Request, res: Response) {
    if (req.headers['x-gitlab-event'] !== MERGE_REQUEST_HOOK || req.headers['x-gitlab-token'] !== process.env.GITLAB_WEBHOOK_SECRET_TOKEN) {
        return
    }

    const repoService = new Repositories({
        host: 'https://gitlab.com',
        token: process.env.GITLAB_PRIVATE_TOKEN

    })

    const projectId: string = req.body.object_attributes?.source?.id

    const zipSourceCode: any = await repoService.showArchive(projectId, { fileType: 'zip' })

    console.log('zipSourceCode', Buffer.from(zipSourceCode).toString('base64'))
    res.send('wadap')

}
