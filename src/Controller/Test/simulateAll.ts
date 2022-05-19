import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import axios from 'axios'

export async function simulateAll(req: Request, res: Response) {
    console.log('Simulating...')

    const { courseId, activityId, contentHashRef, extensionRef, rawContentRef, graderUrl, contentHashSrc, extensionSrc, rawContentSrc } = req.body

    // mock create repo
    const instance: number = 1
    const dueDate: Date = new Date()
    dueDate.setDate(dueDate.getDate() + 1) // add 1 day

    const repository = await Repository.findOne({ courseId: Number(courseId), activityId: Number(activityId) })
    if (repository) {
        // update
        await Repository.update({ id: repository.id }, {
            id: repository.id,
            dueDate: dueDate
        })
        console.log('Repo already exist, updating')
    } else {
        const model = Repository.create({
            activityId,
            courseId,
            instance,
            gitlabUrl: 'dummy',
            dueDate: dueDate
        })

        try {
            await model.save()
        } catch (error) {
            console.error(error)
        }
    }

    // mock gitlab webhook (assume already call save reference)
    CodeReference.find({ repository }).then((references) => {
        console.log('references')
        console.log(references)
        // await axios.post(graderUrl, { // TODO
        //     id: 1,
        //     name: 'Test',
        //     references: references,
        //     contentHash: contentHashSrc,
        //     extension: extensionSrc,
        //     rawContent: rawContentSrc,
        // })
    })

    return res.send('sent')
}
