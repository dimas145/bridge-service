import { Request, Response } from 'express'
import { IncomingMessage } from 'http'
import Docker from 'dockerode'
import { Autograder } from '../../Model/Autograder'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

export async function DockerPull(req: Request, res: Response) {
    const { user, repositoryName, graderPort, tag, description } = req.body

    if (!user || !repositoryName || !graderPort) {
        return res.status(400).send('Bad request')
    }

    let useTag = ''
    if (!tag || tag == '') {
        useTag = 'latest'
    } else {
        useTag = tag
    }
    const repoTag = user + '/' + repositoryName + ':' + useTag

    const [_, count] = await Autograder.findAndCount()
    const port = Number(process.env.GRADER_STARTING_PORT) + count // assign port ascending from grader starting port

    console.log(`Pulling ${repoTag} docker image...`)
    docker.pull(repoTag, (err: any, stream: IncomingMessage) => {
        if (err) console.error(err)
        docker.modem.followProgress(stream, onFinished)

        function onFinished(err: any, _: any) {
            if (err)
                console.error(err)
            console.log(`Pull ${repoTag} docker image done`)

            const finalPort = String(graderPort) + '/tcp'
            docker.createContainer({
                Image: repoTag,
                ExposedPorts: {
                    [finalPort]: {}
                },
                HostConfig: {
                    PortBindings: {
                        [finalPort]: [{ HostPort: String(port) }]
                    },
                    Binds: ['/var/run/docker.sock:/var/run/docker.sock'], // TODO, quick fix for development
                    NetworkMode: 'bridge_service',
                },
                NetworkingConfig: {
                    EndpointsConfig: {
                        'bridge_service': {
                            Aliases: [repositoryName]
                        }
                    }
                }
            }).then(function (container) {
                console.log(`Running ${repoTag} docker container with container id: ${container.id} on port ${port}`)
                container.start().then(() => {
                    const model = Autograder.create({
                        containerId: container.id,
                        port,
                        name: repositoryName,
                        description,
                        status: 'Running'
                    })
                    model.save().then(() => {
                        // save success => do nothing
                    }, (error) => {
                        console.log(error)
                    })
                })
            }).catch(function (err) {
                console.error(`Error running ${repoTag} docker container`)
                console.error(err)
            })
        }
    })

    return res.send({
        success: true
    })
}

// handle exit service, stop and remove all running autograder container
async function exitHandler(eventType: any) {
    console.log('clean up before exiting')
    if (eventType || eventType === 0) {
        try {
            // clean up autograder table
            const allAutograder = await Autograder.find()
            allAutograder.forEach(async (autograder) => {
                try {
                    await docker.getContainer(autograder.containerId).kill({ force: true })
                } catch (err) {
                    console.error(`error killing container with id ${autograder.containerId}`)
                    console.error(err)
                }
            })
            await Autograder.remove(allAutograder)
            console.log('clean up done')
        } catch (err) {
            console.error(err)
        }

        console.log(`process exit with eventType: ${eventType}`)
    }
}

['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType) => {
    process.on(eventType, exitHandler.bind(null, eventType))
})
