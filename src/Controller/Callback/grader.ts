import { Request, Response } from 'express'

export async function Grader(req: Request, res: Response) {
    console.log('receiving callback from grader, ', req.body)
    res.send('received') // just to give 200 to gitlab
}
