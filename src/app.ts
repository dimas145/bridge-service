import express from 'express'
import { testRoute } from './Routes/testRoutes'
import { gitlabRoute } from './Routes/gitlab'
import { moodleRoute } from './Routes/moodle'
import { webhookRoute } from './Routes/webhook'
import { autograderRoute } from './Routes/autograder'
import { submissionRoute } from './Routes/submission'
import passport from 'passport'
import cors from 'cors'
import path from 'path'

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
app.use('/autograder', autograderRoute)
app.use('/submission', submissionRoute)

export default app
