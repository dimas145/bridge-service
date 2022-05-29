import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import axios from 'axios'

export async function simulateAll(req: Request, res: Response) {
    console.log('Simulating...')

    /**
     * How to use:
     * 1. Run using docker compose
     * 2. Pull grader image using {url}/docker/pull, will build container and run automatically // currently only support for port 5000
     * 3. Save code reference using {url}/moodle/saveReference/{courseId}/{activityId}
     * 4. Call this API and make sure using the same courseId and activityId
     *
     *
     * NOTE: need to manually stop container
     */

    const { courseId, activityId, rawContentSolution } = req.body

    // mock create repo
    const instance: number = 1
    const dueDate: Date = new Date()
    dueDate.setDate(dueDate.getDate() + 1) // add 1 day

    const repositoryId = { courseId: Number(courseId), activityId: Number(activityId) }
    const repository = await Repository.findOne(repositoryId)
    if (repository) {
        // update
        await Repository.update(repositoryId, {
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
    const graderUrl: string = 'http://localhost:5000/grade'
    CodeReference.find({ repository }).then((references) => {
        axios.post(graderUrl, {
            references: references.map((ref) => ref.content),
            solution: rawContentSolution,
        })
    })

    return res.send('sent')
}
