import { Request, Response } from 'express'
import { DockerStatus } from '../../Type/Docker'
import { Autograder } from '../../Model/Autograder'
import Docker from 'dockerode'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

export async function Start(req: Request, res: Response) {
    const { name } = req.body

    if (!name) {
        return res.status(400).send('Bad request')
    }

    const grader = await Autograder.findOne({ name: name })

    if (!grader) {
        return res.status(400).send({
            success: false,
            message: `autograder ${name} not found`
        })
    }

    if (grader.status == DockerStatus.RUNNING) {
        return res.status(400).send({
            success: false,
            message: 'autograder already running'
        })
    } else if (grader.status == DockerStatus.INITIALIZING) {
        return res.status(400).send({
            success: false,
            message: 'autograder is initializing'
        })
    } else {    // DockerStatus.STOPPED
        await docker.getContainer(grader.containerId as string).restart()
        return res.send({
            success: true
        })
    }
}
