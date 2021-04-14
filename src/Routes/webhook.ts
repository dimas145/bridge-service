import express from 'express'
import { Webhook } from '../Controller/Webhook'
import { RequestWrapper } from '../Utils/requestWrapper'

const webhookRoute = express.Router()

webhookRoute.post('/:courseId/:activityId', RequestWrapper(Webhook))

export { webhookRoute }