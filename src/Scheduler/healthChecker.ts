import { ToadScheduler, LongIntervalJob, AsyncTask } from 'toad-scheduler'
import { DockerStatus } from '../Type/Docker'
import { Autograder } from '../Model/Autograder'
import { Constant } from '../constant'
import axios from 'axios'

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
                    console.error('Error Health Checking', grader.name)
                    console.error(error)

                    grader.status = DockerStatus.STOPPED
                    grader.save()
                }
            } else if (grader.status == DockerStatus.STOPPED && grader.containerId != null) {   // retry, TODO implement retry a few times?
                console.log('Retry Health Checking', grader.name)

                try {
                    const response = await axios.get(grader.url + Constant.GRADER_HEALTHCHECK_ENDPOINT)

                    if (response.data.error) {
                        throw new Error(response.data.message)
                    } else {
                        grader.status = DockerStatus.RUNNING
                        grader.save()
                    }
                } catch (error) {
                    console.error('Error Health Checking', grader.name)
                    console.error(error)

                    grader.containerId = null
                    grader.save()
                }
            } else if (grader.status == DockerStatus.STOPPED) { // unregister
                console.log('Unregister', grader.displayedName)

                try {
                    await Autograder.delete({ containerId: grader.containerId })
                } catch (error) {
                    console.error(error)
                }
            } // else (grader.status == DockerStatus.INITIALIZING) ignore
        }
    }).catch((error) => {
        console.error(error)
    })
})

export const healthCheckScheduler = (): ToadScheduler => {
    const job = new LongIntervalJob({ seconds: Number(process.env.INTERVAL_HEALTH_CHECK), }, task)
    scheduler.addLongIntervalJob(job)
    return scheduler
}
