import { Request, Response } from 'express'
import { DockerStatus } from '../../Type/Docker'
import { Autograder } from '../../Model/Autograder'

export async function Running(_: Request, res: Response) {
    const autograders = await Autograder.find({ status: DockerStatus.RUNNING })

    return res.send({
        success: true,
        autograders: autograders.map((grader) => grader.displayedName)
    })
}
