import express from 'express'
import { saveReference } from '../Controller/Moodle/saveReference'
import { RequestWrapper } from '../Utils/requestWrapper'

const moodleRoute = express.Router()

moodleRoute.post('/saveReference/:courseId/:activityId', RequestWrapper(saveReference))

export { moodleRoute }