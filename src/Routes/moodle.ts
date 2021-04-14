import express from 'express'
import { saveMetric } from '../Controller/Moodle/saveMetric'
import { RequestWrapper } from '../Utils/requestWrapper'

const moodleRoute = express.Router()

moodleRoute.post('/saveMetric/:courseId/:activityId', RequestWrapper(saveMetric))

export { moodleRoute }