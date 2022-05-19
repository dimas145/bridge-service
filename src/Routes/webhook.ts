import express from 'express'
import { Webhook } from '../Controller/Webhook'

const webhookRoute = express.Router()

webhookRoute.post('/:courseId/:activityId', Webhook)

export { webhookRoute }
