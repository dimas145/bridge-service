import express from 'express'
import { Initialize } from '../Controller/Autograder/initialize'
import { RequestWrapper } from '../Utils/requestWrapper'

const autograderRoute = express.Router()

autograderRoute.post('/initialize', RequestWrapper(Initialize))

export { autograderRoute }
