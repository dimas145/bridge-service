import express from 'express'
import { sendQueue } from '../Controller/Test/sendQueue'
import { simulateWebhook, mockCreateRepo } from '../Controller/Test/simulate'
import { RequestWrapper } from '../Utils/requestWrapper'

const testRoute = express.Router()

testRoute.post('/sendQueue', RequestWrapper(sendQueue))
testRoute.post('/mockCreateRepo', RequestWrapper(mockCreateRepo))
testRoute.post('/simulateWebhook', RequestWrapper(simulateWebhook))

export { testRoute }
