import { Request, Response } from 'express'
import { Autograder } from '../../Model/Autograder'

export async function List(_: Request, res: Response) {
    const autograders = await Autograder.find()

    return res.send({
        success: true,
        autograders: autograders
    })
}
