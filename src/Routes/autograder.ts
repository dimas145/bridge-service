import express from 'express'
import { Start } from '../Controller/Autograder/start'
import { Initialize } from '../Controller/Autograder/initialize'
import { GetRunning } from '../Controller/Autograder/getRunning'
import { RequestWrapper } from '../Utils/requestWrapper'

const autograderRoute = express.Router()

autograderRoute.get('/running', RequestWrapper(GetRunning))
autograderRoute.post('/start', RequestWrapper(Start))
autograderRoute.post('/initialize', RequestWrapper(Initialize))

export { autograderRoute }
