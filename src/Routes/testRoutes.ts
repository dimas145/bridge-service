import express from 'express'
import { sendQueue } from '../Controller/Test/sendQueue'
import { RequestWrapper } from '../Utils/requestWrapper'

const testRoute = express.Router()

testRoute.post('/sendQueue', RequestWrapper(sendQueue))

export { testRoute }