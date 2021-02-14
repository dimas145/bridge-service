import { Request, Response } from 'express'
import { Queue } from '../../Queue'

export function sendQueue(req: Request, res: Response) {
    console.log(req.body)
    Queue.sendMessage("hello", JSON.stringify(req.body))
    res.send('sent')
}