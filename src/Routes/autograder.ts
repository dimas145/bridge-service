import express from 'express'
import { InitializeAutograder } from '../Controller/Autograder/initialize'
import { RequestWrapper } from '../Utils/requestWrapper'

const autograderRoute = express.Router()

autograderRoute.post('/initialize', RequestWrapper(InitializeAutograder))

export { autograderRoute }
