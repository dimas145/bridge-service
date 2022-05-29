import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import axios from 'axios'

export async function simulateAll(req: Request, res: Response) {
    console.log('Simulating...')

    const { courseId, activityId, graderUrl, rawContentSolution } = req.body

    // mock create repo
    const instance: number = 1
    const dueDate: Date = new Date()
    dueDate.setDate(dueDate.getDate() + 1) // add 1 day

    const repository = await Repository.findOne({ courseId: Number(courseId), activityId: Number(activityId) })
    if (repository) {
        // update
        await Repository.update({ courseId: Number(courseId), activityId: Number(activityId) }, {
            gradingPriority: 'last',
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
        axios.post(graderUrl, {
            id: 1,  // TODO refactor SubmissionHistory
            references: references.map((ref) => ref.content),
            solution: rawContentSolution,
        })
    })

    return res.send('sent')
}
