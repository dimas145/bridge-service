import express from 'express'
import { Grader } from '../Controller/Callback/grader'
import { RequestWrapper } from '../Utils/requestWrapper'

const callbackRoute = express.Router()

callbackRoute.post('/', RequestWrapper(Grader))

export { callbackRoute }