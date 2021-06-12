import { Request, Response } from 'express'
import { Repositories } from '@gitbeaker/node'
import { Queue } from '../../Queue'
import { Constant } from '../../constant'
import { Webhook as WebhookType } from '../../Type/Webhook'
import { Student } from '../../Model/Student'
import { Repository } from '../../Model/Repository'
import { getFile } from '../../Utils/file'
import { GitLab } from '../../Type/Gitlab'
import { MetricFile } from '../../Model/MetricFile'
import { SubmissionHistory } from '../../Model/SubmissionHistory'
import archiver from 'archiver'
import fs from 'fs'
import { v4 } from 'uuid'

export async function Webhook(req: Request, res: Response) {
    res.send('received') // just to give 200 to gitlab

    if (req.headers['x-gitlab-event'] !== Constant.MERGE_REQUEST_HOOK || req.headers['x-gitlab-token'] !== process.env.GITLAB_WEBHOOK_SECRET_TOKEN) {
        return
    }

    const { courseId, activityId } = req.params

    const webhookBody: WebhookType.WebhookBody = req.body

    /**
    * Send to queue:
    * - tar.gz data
    * - student user data
    * - tescases
    */

    const projectId = webhookBody.object_attributes.source.id
    // let targzSourceCode: any
    // try {
    //     targzSourceCode = await repoService.showArchive(projectId, { fileType: 'tar.gz' })
    // } catch (e) {
    //     console.log('error get student source code', projectId)
    //     console.log(e)
    //     return
    // }
    const targzBase64 = await generateArchive(projectId as string)
    const student = await Student.findOne({ gitlabProfileId: webhookBody.object_attributes.author_id })

    if (!student) {
        return // no need to process user that hasn't register
    }

    const repository = await Repository.findOne({ courseId: Number(courseId), activityId: Number(activityId) })
    if (!repository) {
        return // no metric file or repo
    }

    const metricFile = await MetricFile.findOne({ repository })

    if (!metricFile) {
        return // no metric file or repo
    }

    if (new Date() > repository.dueDate) { // ignore late submission
        return
    }

    if (repository.gradingMethod == 'first') {
        const [_, count] = await SubmissionHistory.findAndCount({ repository, student })
        if (count > 0) { // not accepting any submission
            return
        }
    }

    let data = {
        'sourceCodeBase64': targzBase64,
        projectId,
        'userId': student.userId,
        courseId,
        activityId,
    }

    if (metricFile.mimetype == 'application/json') {
        const rawContent = await getFile(metricFile.filename)
        data = {
            ...data,
            ...JSON.parse(rawContent.toString())
        }
    } else {
        data = {
            ...data,
            ...metricFile
        }
    }

    await Queue.sendMessage(Constant.GRADING_QUEUE, JSON.stringify({ data }))
    // return res.send('received')
}

export async function generateArchive(projectId: string) {
    const repoService = new Repositories({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    const archive = archiver('tar', { gzip: true })
    const fileTree = await repoService.tree(projectId) as GitLab.RepositoryTree[]

    for (const tree of fileTree) {
        const rawContent = (await repoService.showBlobRaw(projectId, tree.id)) as unknown as Buffer
        archive.append(rawContent, { name: `${projectId}/${tree.path}` })
    }
    await archive.finalize()
    const fileLocation = __dirname + `/${v4()}.tar.gz`
    return new Promise<string>((resolve, reject) =>{
        const output = fs.createWriteStream(fileLocation)
        archive.pipe(output)
        output.on('finish',() => {
            const contents = fs.readFileSync(fileLocation, { encoding: 'base64' })
            fs.unlinkSync(fileLocation)
            resolve(contents)
        })
        output.on('error', () => reject('can\'t generate tar.gz file'))
    })
}

export async function testArchive(req: Request, res: Response) {
    const { projectId } = req.query
    console.log(await generateArchive(projectId as string))
    return res.send('mantul')
}