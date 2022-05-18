import express from 'express'
import { DockerPull } from '../Controller/Docker/pull'
import { RequestWrapper } from '../Utils/requestWrapper'

const dockerRoute = express.Router()

dockerRoute.post('/pull', RequestWrapper(DockerPull))

export { dockerRoute }
