import express from 'express'
import { simulateWebhook, mockCreateRepo, test } from '../Controller/Test/simulate'
import { RequestWrapper } from '../Utils/requestWrapper'

const testRoute = express.Router()

testRoute.post('/mockCreateRepo', RequestWrapper(mockCreateRepo))
testRoute.post('/simulateWebhook', RequestWrapper(simulateWebhook))
testRoute.post('/test', RequestWrapper(test))

export { testRoute }
