import express from 'express'
import { List } from '../Controller/Autograder/list'
import { Start } from '../Controller/Autograder/start'
import { Running } from '../Controller/Autograder/running'
import { Initialize } from '../Controller/Autograder/initialize'
import { RequestWrapper } from '../Utils/requestWrapper'

const autograderRoute = express.Router()

autograderRoute.get('/list', RequestWrapper(List))
autograderRoute.get('/running', RequestWrapper(Running))
autograderRoute.post('/start', RequestWrapper(Start))
autograderRoute.post('/initialize', RequestWrapper(Initialize))

export { autograderRoute }
