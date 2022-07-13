import express from 'express'
import { detail } from '../Controller/Submission/detail'
import { RequestWrapper } from '../Utils/requestWrapper'

const submissionRoute = express.Router()

submissionRoute.get('/detail', RequestWrapper(detail))

export { submissionRoute }
