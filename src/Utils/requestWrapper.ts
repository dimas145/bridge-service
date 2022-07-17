import { Request, Response, NextFunction } from 'express'
import { Logger } from 'tslog'

const log: Logger = new Logger()

export function RequestWrapper(requestHandler: any){
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            return await requestHandler(req, res, next)
        } catch (error) {
            log.error(error)
            return res.status(500).send(error)
        }
    }
}
