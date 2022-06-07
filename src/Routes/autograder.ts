import express from 'express'
import { Start } from '../Controller/Autograder/start'
import { Initialize } from '../Controller/Autograder/initialize'
import { RequestWrapper } from '../Utils/requestWrapper'

const autograderRoute = express.Router()

autograderRoute.post('/start', RequestWrapper(Start))
autograderRoute.post('/initialize', RequestWrapper(Initialize))

export { autograderRoute }
