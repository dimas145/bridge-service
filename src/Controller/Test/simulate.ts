import { Request, Response } from 'express'
import { CodeReference } from '../../Model/CodeReference'
import { Repository } from '../../Model/Repository'
import axios from 'axios'
import { Autograder } from 'src/Model/Autograder'

export async function simulateWebhook(req: Request, res: Response) {
    console.log('Simulating...')

    /**
     * How to use:
     * 1. Run using docker compose
     * 2. Pull grader image using POST request to {url}/docker/pull, will build container and run automatically, make sure the container run properly (docker ps)
     * 3. Call mockCreateRepo using POST request to {url}/test/mockCreateRepo
     * 4. Save code reference using POST request to {url}/moodle/saveReference
     * 5. Call this API using POST request to {url}/test/simulateWebhook
     */

    const { courseId, activityId, graderName, rawContentSolution } = req.body

    const repositoryId = { courseId: Number(courseId), activityId: Number(activityId) }
    const repository = await Repository.findOne(repositoryId)
    const grader = await Autograder.findOne({ name: graderName })

    if (!repository) {
        return res.send({
            success: false,
            message: 'repository doesn\'t exist, create first using /test/mockCreateRepo API'
        })
    }

    if (!grader) {
        return res.send({
            success: false,
            message: 'autograder doesn\'t exist, pull first using /docker/pull API'
        })
    }

    // mock gitlab webhook (assume already call save reference)
    const references = await CodeReference.find({ repository })
    if (references.length == 0) {
        return res.send({
            success: false,
            message: 'code references doesnt exist in db'
        })
    } else {
        const graderUrl = `http://${graderName}:${grader.port}/grade`
        axios.post(graderUrl, {
            references: references.map((ref) => ref.content),
            solution: rawContentSolution,
        }).then((response) => {
            console.log(response.data)
        }, (error) => {
            console.log(error)

            return res.send({
                success: false,
                message: error
            })
        })
    }

    return res.send({
        success: true,
    })
}

export async function mockCreateRepo(req: Request, res: Response) {
    const { courseId, activityId } = req.body

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

            return res.send({
                success: false,
                message: error
            })
        }
    }

    return res.send({
        success: true,
    })
}

export async function mockWebhook(req: Request, res: Response) {
    const { courseId, activityId } = req.body

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

            return res.send({
                success: false,
                message: error,
            })
        }
    }

    return res.send({
        success: true,
    })
}