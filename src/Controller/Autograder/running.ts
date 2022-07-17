import { Request, Response } from 'express'
import { DockerStatus } from '../../Type/Docker'
import { Autograder } from '../../Model/Autograder'
import { Logger } from 'tslog'

const log: Logger = new Logger()

export async function Running(_: Request, res: Response) {
    log.info('Autograder list running')
    const autograders = await Autograder.find({ status: DockerStatus.RUNNING })

    return res.send({
        success: true,
        autograders: autograders.map((grader) => grader.displayedName)
    })
}
