import { Request, Response } from 'express'
import { Projects, ProjectHooks } from '@gitbeaker/node'
import { Repository } from '../../Model/Repository'
import { Autograder } from '../../Model/Autograder'

export async function createRepository(req: Request, res: Response) {
    console.log(`hit ${new Date()} - create repository`)

    const { name, courseId, activityId, instance, gradingPriority, gradingMethod, timeLimit, dueDate, autograders } = req.body

    const repositoryId = { courseId: Number(courseId), activityId: Number(activityId) }
    const repository = await Repository.findOne(repositoryId)
    if (repository) {
        // update
        await Repository.update(repositoryId, {
            gradingPriority,
            gradingMethod,
            timeLimit,
            dueDate: new Date(dueDate * 1000)
        })
        return res.status(400).send({ success: false, error: 'already exist' })
    }

    const projectService = new Projects({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    const projectHookService = new ProjectHooks({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    try {
        const project = await projectService.create({
            name: `${name}-${courseId}-${activityId}`,
            visibility: 'public',
            merge_requests_access_level: 'enabled',
            issues_access_level: 'enabled',
            initialize_with_readme: false
        })

        await projectHookService.add(
            Number(project.id),
            process.env.SERVICE_BRIDGE_URL + '/webhook/' + courseId + '/' + activityId,
            {
                merge_requests_events: true,
                token: process.env.GITLAB_WEBHOOK_SECRET_TOKEN,
            }
        )

        const graders = autograders.map(async (grader: string) => await Autograder.findOne({ name: grader }))

        const model = Repository.create({
            activityId,
            courseId,
            instance,
            gitlabUrl: project.web_url as string,
            gradingPriority,
            gradingMethod,
            timeLimit,
            dueDate: new Date(dueDate * 1000),
            graders
        })

        try {
            await model.save()
        } catch (error) {
            console.log(error)
            return res.send('already exist')
        }

        return res.send({
            success: true,
            gitlabUrl: project.web_url
        })
    } catch (error) {
        return res.status(400).send({
            success: false,
            error: error.message
        })
    }
}
