import express from 'express'
import { Grader } from '../Controller/Callback/grader'

const callbackRoute = express.Router()

callbackRoute.post('/', Grader)

export { callbackRoute }