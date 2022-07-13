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

    const grader = await Autograder.findOne({ name })

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
        const finalPort = String(grader.port) + '/tcp'
        docker.createContainer({
            Image: grader.repoTag,
            ExposedPorts: {
                [finalPort]: {}
            },
            HostConfig: {
                Binds: ['/var/run/docker.sock:/var/run/docker.sock'], // TODO, quick fix for development
                NetworkMode: 'bridge_service',
            },
            NetworkingConfig: {
                EndpointsConfig: {
                    'bridge_service': {
                        Aliases: [grader.name]
                    }
                }
            }
        }).then(function (container) {
            console.log(`Running ${grader.repoTag} docker container with container id: ${container.id}`)
            container.start(() => {
                grader.containerId = container.id
                grader.status = DockerStatus.RUNNING
                grader.save().then(() => {
                    console.log(`Run ${grader.repoTag} docker container success`)
                }, (error) => {
                    console.log(error)
                })
            })
        }).catch(function (err) {
            console.error(`Error running ${grader.repoTag} docker container`)
            console.error(err)
        })

        return res.send({
            success: true
        })
    }
}
