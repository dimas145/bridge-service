import { Request, Response } from 'express'
import { IncomingMessage } from 'http'
import { Docker as DockerType } from '../../Type/Docker'
import Docker from 'dockerode'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

export async function DockerPull(req: Request, res: Response) {
    const dockerPullBody: DockerType.Pull = req.body

    let tag = ''
    if (dockerPullBody.tag == '') {
        tag = 'latest'
    } else {
        tag = dockerPullBody.tag
    }
    const repoTag = dockerPullBody.user + '/' + dockerPullBody.repositoryName + ':' + tag

    console.log(`Pulling ${repoTag} docker image...`)
    docker.pull(repoTag, (err: any, stream: IncomingMessage) => {
        if (err) console.error(err)
        docker.modem.followProgress(stream, onFinished)

        function onFinished(err: any, _: any) {
            if (err)
                console.error(err)
            console.log(`Pull ${repoTag} docker image done`)

            docker.createContainer({
                Image: repoTag,
                ExposedPorts: {
                    '5000/tcp': {}
                },
                HostConfig: {
                    PortBindings: {
                        '5000/tcp': [{ HostPort: '5000' }]
                    },
                    Binds: ['/var/run/docker.sock:/var/run/docker.sock'], // TODO, quick fix for development
                }
            }).then(function (container) {
                console.log(`Running ${repoTag} docker container`)
                return container.start()
            }).catch(function (err) {
                console.error(`Error running ${repoTag} docker container`)
                console.error(err)
            })
        }
    })

    res.send('received')
}
