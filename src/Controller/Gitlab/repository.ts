import { Request, Response } from 'express'
import { Projects, ProjectHooks } from '@gitbeaker/node'
import { Repository } from '../../Model/Repository'
import { Autograder } from '../../Model/Autograder'
import { Logger } from 'tslog'

const log: Logger = new Logger()

export async function createRepository(req: Request, res: Response) {
    log.info('Create GitLab repository')

    const { name, courseId, assignmentId, gradingPriority, gradingMethod, timeLimit, dueDate, autograders } = req.body

    const repositoryId = { courseId: Number(courseId), assignmentId: Number(assignmentId) }
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
        const graders: Autograder[] = []
        for (let i = 0; i < autograders.length; i++) {
            let grader: Autograder
            try {
                grader = await Autograder.findOneOrFail({ displayedName: autograders[i] })
            } catch (error) {
                log.error(error)
                return res.status(400).send({
                    success: false,
                    message: `autograder ${autograders[i]} doesn't exist`
                })
            }
            graders.push(grader)
        }

        const project = await projectService.create({
            name: `${name}-${courseId}-${assignmentId}`,
            visibility: 'public',
            merge_requests_access_level: 'enabled',
            issues_access_level: 'enabled',
            initialize_with_readme: true
        })

        await projectHookService.add(
            Number(project.id),
            process.env.SERVICE_BRIDGE_URL + '/webhook/' + courseId + '/' + assignmentId,
            {
                push_events: false,
                merge_requests_events: true,
                token: process.env.GITLAB_WEBHOOK_SECRET_TOKEN,
            }
        )

        const model = Repository.create({
            assignmentId,
            courseId,
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
            log.error(error)
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
