import { ToadScheduler, LongIntervalJob, AsyncTask } from 'toad-scheduler'
import { DockerStatus } from '../Type/Docker'
import { Autograder } from '../Model/Autograder'
import { Constant } from '../constant'
import { Logger } from 'tslog'
import Docker from 'dockerode'
import axios from 'axios'

const log: Logger = new Logger()
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
                    log.info(`new autograder registered: ${newGrader.displayedName}`)
                }
            } catch (error) {
                log.error(error)
            }
        }
    }).catch((error) => {
        log.error(error)
    })
})

export const scannerScheduler = (): ToadScheduler => {
    const job = new LongIntervalJob({ seconds: Number(process.env.INTERVAL_SCANNER), }, task)
    scheduler.addLongIntervalJob(job)
    return scheduler
}
