import express from 'express'
import { sendQueue } from '../Controller/Test/sendQueue'

const testRoute = express.Router()

testRoute.post('/sendQueue', sendQueue)

export { testRoute }