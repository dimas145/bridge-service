import express from 'express'
import { testRoute } from './Routes/testRoutes'
import { webhookRoute } from './Routes/webhook'

const app = express()

app.use(express.json())
app.use('/test', testRoute)
app.use('/webhook', webhookRoute)

export default app