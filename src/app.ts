import express from 'express'
import { callbackRoute } from './Routes/callback'
import { gitlabRoute } from './Routes/gitlab'
import { testRoute } from './Routes/testRoutes'
import { webhookRoute } from './Routes/webhook'
import passport from 'passport'
import cors from 'cors'

const app = express()

const corsOptions = {
    origin: '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
}

app.use(cors(corsOptions))

app.all('/ping', (req, res) => {
    console.log('hit', new Date())
    console.log('url', req.url)
    console.log('query', req.query)
    console.log('body', req.body)
    res.json({
        'status': 'running',
        'time': new Date()
    })
})

app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())


app.use('/test', testRoute)
app.use('/webhook', webhookRoute)
app.use('/callback', callbackRoute)
app.use('/gitlab', gitlabRoute)

export default app