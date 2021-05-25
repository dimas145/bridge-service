import express from 'express'
import { testArchive, Webhook } from '../Controller/Webhook'

const webhookRoute = express.Router()

webhookRoute.post('/:courseId/:activityId', Webhook)
webhookRoute.get('/testArchive', testArchive)

export { webhookRoute }