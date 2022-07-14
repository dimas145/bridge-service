import express from 'express'
import { detail } from '../Controller/Repository/detail'
import { RequestWrapper } from '../Utils/requestWrapper'

const repositoryRoute = express.Router()

repositoryRoute.get('/detail', RequestWrapper(detail))

export { repositoryRoute }
