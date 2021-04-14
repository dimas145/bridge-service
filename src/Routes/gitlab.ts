import express from 'express'
import passport from 'passport'
import GitLabStrategy from 'passport-gitlab2'
import { createRepository } from '../Controller/Gitlab/repository'
import { updateMoodle } from '../Controller/Gitlab/updateMoodle'
import { RequestWrapper } from '../Utils/requestWrapper'

const gitlabRoute = express.Router()

gitlabRoute.post('/createRepository/:courseId/:activityId', RequestWrapper(createRepository))

passport.use(new GitLabStrategy({
    clientID: process.env.GITLAB_APP_ID as string,
    clientSecret: process.env.GITLAB_APP_SECRET as string,
    callbackURL: 'http://localhost:8080/gitlab/auth/callback'
},
function (_: any, __: any, profile: any, cb: any) {
    return cb(null, profile)
}
))


gitlabRoute.get('/auth', (req ,res,next) => {
    const { userId } = req.query
    const state = userId
        ? JSON.stringify({ userId })
        : undefined
    const authenticator = passport.authenticate('gitlab', { state })
    authenticator(req, res, next)
})

gitlabRoute.get('/auth/callback',
    passport.authenticate('gitlab', {
        failureRedirect: '/login',
    }), updateMoodle)


passport.serializeUser(function (user: any, done) {
    done(null, user)
})

passport.deserializeUser(function (user: any, done) {
    done(null, user)
})

// gitlab oauth buat mapping user moodle & gitlab disimpen ke db (apakah psql?) trus confirm ke moodle kalau udh beres verifnya

export { gitlabRoute }