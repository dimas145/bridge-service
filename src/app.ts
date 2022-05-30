import express from 'express'
import { gitlabRoute } from './Routes/gitlab'
import { testRoute } from './Routes/testRoutes'
import { webhookRoute } from './Routes/webhook'
import passport from 'passport'
import cors from 'cors'
import { moodleRoute } from './Routes/moodle'
import path from 'path'
import { dockerRoute } from './Routes/dockerRoutes'

const app = express()

const corsOptions = {
    origin: '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
}

app.use(cors(corsOptions))

app.use('/files', express.static(path.join(__dirname, 'Files')))

app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())

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

app.use('/test', testRoute)
app.use('/webhook', webhookRoute)
app.use('/gitlab', gitlabRoute)
app.use('/moodle', moodleRoute)
app.use('/docker', dockerRoute)

export default app
