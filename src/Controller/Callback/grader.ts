import { Request, Response } from 'express'
import axios from 'axios'
import { Constant } from '../../constant'

export async function Grader(req: Request, res: Response) {
    console.log('receiving callback from grader, ', req.body)

    res.send('received') // just to give 200 to auto grader

    try {
        await axios.get(process.env.MOODLE_HOST + '/webservice/rest/server.php', {
            params: {
                'moodlewsrestformat': 'json',
                'wstoken': process.env.MOODLE_TOKEN,
                'wsfunction': Constant.WS_FUNCTION_UPDATE_GRADE,
                'source': Constant.UPDATE_GRADE_SOURCE,
                'courseid': req.body.user.courseId,
                'component': Constant.UPDATE_GRADE_COMPONENT,
                'activityid': req.body.user.activityId,
                'itemnumber': 0,
                'grades[0][studentid]': req.body.user.userId,
                'grades[0][grade]': req.body.total,
            }
        })
        console.log('success')
    } catch (error){
        console.log('error',error)
    }
}
