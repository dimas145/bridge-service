import { Request, Response } from 'express'
import { IncomingMessage } from 'http'
import { Autograder } from '../../Model/Autograder'
import { DockerStatus } from '../../Type/Docker'
import Docker from 'dockerode'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

export async function Initialize(req: Request, res: Response) {
    const { dockerUser, name, tag, displayedName, description } = req.body

    if (!dockerUser || !name || !displayedName) {
        return res.status(400).send('Bad request')
    }

    // validation, use default value if not specified
    let useTag
    if (!tag || tag == '') {
        useTag = 'latest'
    } else {
        useTag = tag
    }
    const imageName = dockerUser + '/' + name + ':' + useTag

    let grader: Autograder
    try {
        grader = await Autograder.findOneOrFail({ name })

        if (grader.status == DockerStatus.RUNNING) {
            return res.status(400).send({
                success: false,
                message: 'Autograder is already running'
            })
        } else if (grader.status == DockerStatus.INITIALIZING) {
            return res.status(400).send({
                success: false,
                message: 'Autograder is initializing'
            })
        } else if (grader.status == DockerStatus.STOPPED) {
            createAutograderContainerAndRun(grader)
            return res.send({
                success: true,
                message: 'Autograder already exist, restarting...'
            })
        }
    } catch (_) {
        grader = Autograder.create({
            imageName,
            displayedName,
            description,
        })
    }

    console.log(`Pulling ${imageName} docker image...`)
    grader.status = DockerStatus.INITIALIZING
    await grader.save()

    docker.pull(imageName, (err: any, stream: IncomingMessage) => {
        if (err) console.error(err)
        docker.modem.followProgress(stream, onFinished)

        function onFinished(err: any, _: any) {
            if (err)
                console.error(err)
            console.log(`Pull ${imageName} docker image done`)

            createAutograderContainerAndRun(grader)
        }
    })

    return res.send({
        success: true
    })
}

function createAutograderContainerAndRun(grader: Autograder) {
    const finalPort = process.env.GRADING_PORT + '/tcp'
    docker.createContainer({
        Image: grader.imageName,
        ExposedPorts: {
            [finalPort]: {}
        },
        HostConfig: {
            Binds: ['/var/run/docker.sock:/var/run/docker.sock'], // TODO, quick fix for development
            NetworkMode: 'bridge_service',
        },
    }).then(function (container) {
        console.log(`Running ${grader.imageName} docker container with container id: ${container.id}`)
        container.start(() => {
            grader.containerId = container.id
            grader.status = DockerStatus.RUNNING
            grader.save().then(() => {
                console.log(`Run ${grader.imageName} docker container success`)
            }, (error) => {
                console.log(error)
            })
        })
    }).catch(function (err) {
        console.error(`Error running ${grader.imageName} docker container`)
        console.error(err)
    })
}
