import express from 'express'
import { sendQueue } from '../Controller/Test/sendQueue'
import { simulateAll } from '../Controller/Test/simulateAll'
import { RequestWrapper } from '../Utils/requestWrapper'

const testRoute = express.Router()

testRoute.post('/sendQueue', RequestWrapper(sendQueue))
testRoute.post('/simulateAll', RequestWrapper(simulateAll))

export { testRoute }
