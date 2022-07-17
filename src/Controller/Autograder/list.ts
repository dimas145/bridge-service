import { Request, Response } from 'express'
import { Autograder } from '../../Model/Autograder'
import { Logger } from 'tslog'

const log: Logger = new Logger()

export async function List(_: Request, res: Response) {
    log.info('Autograder list')
    const autograders = await Autograder.find()

    return res.send({
        success: true,
        autograders: autograders
    })
}
