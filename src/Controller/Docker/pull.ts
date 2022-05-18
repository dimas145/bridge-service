import { Request, Response } from 'express'
import { IncomingMessage } from 'http'
import { Docker as DockerType } from '../../Type/Docker'
import Docker from 'dockerode'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

export async function DockerPull(req: Request, res: Response) {
    console.log(req.body)
    const dockerPullBody: DockerType.Pull = req.body

    let tag = ''
    if (dockerPullBody.tag == '') {
        tag = 'latest'
    } else {
        tag = dockerPullBody.tag
    }
    const repoTag = dockerPullBody.user + '/' + dockerPullBody.repositoryName+ ':' + tag

    docker.pull(repoTag, function (err: any, stream: IncomingMessage) {
        if (err) console.error(err)
        docker.modem.followProgress(stream, onFinished)

        function onFinished(err: any, output: any) {
            if (err) console.error(err)
            console.log('Pull docker image done')
            console.log(output)

            docker.createContainer({
                Image: repoTag,
                ExposedPorts: {
                    '8080/tcp': {}
                },
                HostConfig: {
                    PortBindings: {
                        '8080/tcp': [{ HostPort: '8080' }]
                    }
                }
            }).then(function (container) {
                return container.start()
            }).catch(function (err) {
                console.error(err)
            })
        }
    })

    res.send('received')
}
