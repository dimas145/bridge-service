import { Request, Response } from 'express'
import axios from 'axios'
import { Constant } from '../../constant'
import { Repository } from '../../Model/Repository'
import { Student } from '../../Model/Student'
import { SubmissionHistory } from '../../Model/SubmissionHistory'

export async function Grader(req: Request, res: Response) {
    console.log('receiving callback from grader, ', req.body)

    res.send('received') // just to give 200 to auto grader
    // add feedback & submission comment merge request link
    const repository = await Repository.findOne({ courseId: Number(req.body.user.courseId), activityId: Number(req.body.user.activityId) })
    const student = await Student.findOne({ userId: req.body.user.userId })
    const model = SubmissionHistory.create({
        grade: req.body.total,
        repository,
        student,
        detail: JSON.stringify(req.body.detail)
    })

    await model.save()

    try {
        await axios.get(process.env.MOODLE_HOST + '/webservice/rest/server.php', {
            params: {
                'moodlewsrestformat': 'json',
                'wstoken': process.env.MOODLE_TOKEN,
                'wsfunction': Constant.WS_FUNCTION_UPDATE_GRADE,
                'source': Constant.UPDATE_GRADE_SOURCE,
                'courseid': req.body.user.courseId,
                'component': Constant.UPDATE_GRADE_COMPONENT,
                'instance': repository?.instance,
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
