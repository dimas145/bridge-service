import express from 'express'
import { callbackRoute } from './Routes/callback'
import { gitlabRoute } from './Routes/gitlab'
import { testRoute } from './Routes/testRoutes'
import { webhookRoute } from './Routes/webhook'
import passport from 'passport'

const app = express()

app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())


app.use('/test', testRoute)
app.use('/webhook', webhookRoute)
app.use('/callback',callbackRoute)
app.use('/gitlab', gitlabRoute)

export default app