import { Request, Response } from 'express'
import axios from 'axios'
import { Student } from '../../Model/Student'
import { Constant } from '../../constant'

export async function updateMoodle(req: Request, res: Response){
    const userId = JSON.parse(req.query['state']?.toString() || '{}')?.['userId']

    const model = Student.create({
        userId,
        username: req.session.passport.user.username,
        gitlabProfileId: req.session.passport.user.id
    })

    try {
        await model.save()
    } catch (error) {
        return res.send('already exist')
    }

    const resp = await axios.get(process.env.MOODLE_HOST + '/webservice/rest/server.php', {
        params: {
            'moodlewsrestformat': 'json',
            'wstoken': process.env.MOODLE_TOKEN,
            'wsfunction': Constant.WS_FUNCTION_UPDATE_USER,
            'users[0][id]': userId,
            'users[0][customfields][0][type]': 'gitlab',
            'users[0][customfields][0][value]': req.session.passport.user.username,
            'users[0][customfields][1][type]': 'isGitlabVerified',
            'users[0][customfields][1][value]': 1
        }
    })
    if (resp.status === 200){
        return res.send('you can close this page')
    } else{
        return res.send('something error')
    }
}
