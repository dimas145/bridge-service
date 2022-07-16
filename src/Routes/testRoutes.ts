import express from 'express'
import { simulateWebhook, mockCreateRepo } from '../Controller/Test/simulate'
import { RequestWrapper } from '../Utils/requestWrapper'

const testRoute = express.Router()

testRoute.post('/mockCreateRepo', RequestWrapper(mockCreateRepo))
testRoute.post('/simulateWebhook', RequestWrapper(simulateWebhook))

export { testRoute }
