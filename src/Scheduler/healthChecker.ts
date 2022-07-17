import { ToadScheduler, LongIntervalJob, AsyncTask } from 'toad-scheduler'
import { DockerStatus } from '../Type/Docker'
import { Autograder } from '../Model/Autograder'
import { Constant } from '../constant'
import { Logger } from 'tslog'
import axios from 'axios'

const log: Logger = new Logger()
const scheduler = new ToadScheduler()

const task = new AsyncTask('Health Check', async () => {
    return Autograder.find().then(async (graders) => {
        for (let i = 0; i < graders.length; i++) {
            const grader = graders[i]

            if (grader.status == DockerStatus.RUNNING) {
                try {
                    const response = await axios.get(grader.url + Constant.GRADER_HEALTHCHECK_ENDPOINT)

                    if (response.data.error) {
                        throw new Error(response.data.message)
                    }
                } catch (error) {
                    log.error('Error Health Checking', grader.name)
                    log.error(error)

                    grader.status = DockerStatus.STOPPED
                    grader.save()
                }
            } else if (grader.status == DockerStatus.STOPPED && grader.containerId != null) {   // retry, TODO implement retry a few times?
                log.info('Retry Health Checking', grader.name)

                try {
                    const response = await axios.get(grader.url + Constant.GRADER_HEALTHCHECK_ENDPOINT)

                    if (response.data.error) {
                        throw new Error(response.data.message)
                    } else {
                        grader.status = DockerStatus.RUNNING
                        grader.save()
                    }
                } catch (error) {
                    log.error('Error Health Checking', grader.name)
                    log.error(error)

                    grader.containerId = null
                    grader.save()
                }
            } else if (grader.status == DockerStatus.STOPPED) { // unregister
                log.info('Unregister', grader.displayedName)

                try {
                    await Autograder.delete({ containerId: grader.containerId })
                } catch (error) {
                    log.error(error)
                }
            } // else (grader.status == DockerStatus.INITIALIZING) ignore
        }
    }).catch((error) => {
        log.error(error)
    })
})

export const healthCheckScheduler = (): ToadScheduler => {
    const job = new LongIntervalJob({ seconds: Number(process.env.INTERVAL_HEALTH_CHECK), }, task)
    scheduler.addLongIntervalJob(job)
    return scheduler
}
