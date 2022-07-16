import { ToadScheduler, LongIntervalJob, AsyncTask } from 'toad-scheduler'
import { getConnectionManager } from 'typeorm'
import { DockerStatus } from '../Type/Docker'
import { Autograder } from '../Model/Autograder'
import { Constant } from '../constant'
import Docker from 'dockerode'
import axios from 'axios'

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET })

const scheduler = new ToadScheduler()

const task = new AsyncTask('Scan Container', async () => {
    return docker.listContainers({
        'filters': {
            'network': [Constant.DOCKER_NETWORK],
            'label': [Constant.CONTAINER_LABEL],
        },
    }).then(async (containers) => {
        for (let i = 0; i < containers.length; i++) {
            const container = containers[i]

            // check if grader exist
            const grader = await Autograder.findOne({
                containerId: container.Id
            })
            if (grader) continue

            try {
                const alias = container.Id.slice(0, 12)
                const response = await axios.get(`http://${alias}:${Constant.GRADER_PORT}${Constant.GRADER_DESCRIPTION_ENDPOINT}`)

                if (!response.data.error) {
                    // register
                    const newGrader = Autograder.create({
                        imageName: response.data.data.imageName,
                        displayedName: response.data.data.displayedName,
                        description: response.data.data.description,
                        containerId: container.Id,
                        status: DockerStatus.RUNNING,
                    })

                    await newGrader.save()
                    console.log(`new autograder registered: ${newGrader.displayedName}`)
                }
            } catch (error) {
                console.error(error)
            }
        }
    }).catch((error) => {
        console.error(error)
    })
})

export const registratorScheduler = (): ToadScheduler => {
    const job = new LongIntervalJob({ seconds: Number(process.env.INTERVAL_REGISTRATOR), }, task)
    scheduler.addLongIntervalJob(job)
    return scheduler
}

// handle exit service, stop and remove all running autograder container
async function exitHandler(eventType: any) {
    console.log('clean up before exiting')
    if (getConnectionManager().connections.length > 0 && (eventType || eventType === 0)) {
        try {
            // clean up autograder table
            const allAutograder = await Autograder.find()

            for (let i = 0; i < allAutograder.length; i++) {
                const autograder = allAutograder[i]
                try {
                    autograder.status = DockerStatus.STOPPED
                    const container = docker.getContainer(autograder.containerId as string)
                    await container.stop()

                    autograder.containerId = null
                } catch (err) {
                    console.error(`error killing container with id ${autograder.containerId}`)
                    console.error(err)
                }
            }

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
