import { Request, Response, NextFunction } from 'express'

export function RequestWrapper(requestHandler: any){
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            return await requestHandler(req, res, next)
        } catch (error) {
            console.log(error)
            console.error('FATAL:', error)
            return res.status(500).send(error)
        }
    }
}