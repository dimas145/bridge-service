import { Request, Response } from 'express'
import { IncomingMessage } from 'http'
import Docker from 'dockerode'
import { Autograder } from '../../Model/Autograder'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

export async function DockerPull(req: Request, res: Response) {
    const { user, repositoryName, graderPort, tag } = req.body

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
                console.log(`Running ${repoTag} docker container`)
                return container.start()    // TODO save to db
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
