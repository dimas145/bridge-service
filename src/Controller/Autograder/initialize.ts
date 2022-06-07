import { Request, Response } from 'express'
import { IncomingMessage } from 'http'
import { Autograder } from '../../Model/Autograder'
import { DockerStatus } from 'src/Type/Docker'
import Docker from 'dockerode'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

export async function InitializeAutograder(req: Request, res: Response) {
    const { dockerUser, repositoryName, graderPort, tag, description } = req.body

    if (!dockerUser || !repositoryName || !graderPort) {
        return res.status(400).send('Bad request')
    }

    let useTag = ''
    if (!tag || tag == '') {
        useTag = 'latest'
    } else {
        useTag = tag
    }
    const repoTag = dockerUser + '/' + repositoryName + ':' + useTag

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
                console.log(`Running ${repoTag} docker container with container id: ${container.id}`)
                container.start().then(() => {
                    const model = Autograder.create({
                        containerId: container.id,
                        port: graderPort,
                        name: repositoryName,
                        description,
                        status: DockerStatus.RUNNING
                    })
                    model.save().then(() => {
                        console.log(`Run ${repoTag} docker container success`)
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
                    autograder.status = DockerStatus.STOPPED
                    await docker.getContainer(autograder.containerId).kill({ force: true })
                } catch (err) {
                    console.error(`error killing container with id ${autograder.containerId}`)
                    console.error(err)
                }
            })
            await Autograder.save(allAutograder)
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
