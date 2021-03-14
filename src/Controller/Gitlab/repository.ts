import { Request, Response } from 'express'
import { Projects, ProjectHooks } from '@gitbeaker/node'

const ASSIGNMENT_NAME = 'programming'

export async function createRepository(req: Request, res: Response){

    const { courseId, activityId } = req.params

    const projectService = new Projects({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    const projectHookService = new ProjectHooks({
        host: process.env.GITLAB_HOST,
        token: process.env.GITLAB_PRIVATE_TOKEN
    })

    const project = await projectService.create({
        name: ASSIGNMENT_NAME+'-'+courseId+'-'+activityId,
        visibility: 'public',
        merge_requests_access_level: 'enabled',
        issues_access_level: 'enabled',
        initialize_with_readme: true
    })

    const projectHook = await projectHookService.add(
        Number(project.id),
        process.env.SERVICE_BRIDGE_URL + '/webhook/'+ courseId+'/'+activityId, {
            merge_requests_events: true,
            token: process.env.GITLAB_WEBHOOK_SECRET_TOKEN,
        })

    console.log(projectHook)
    res.send({ projectHook })

}