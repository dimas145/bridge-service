import { Column, Entity, OneToMany } from 'typeorm'
import { BaseModel } from './Base'
import { SubmissionHistory } from './SubmissionHistory'

@Entity()
export class Repository extends BaseModel {
    @Column({ type: 'integer', nullable: false })
    activityId: number

    @Column({ type: 'integer', nullable: false })
    courseId: number

    @Column({ type: 'integer', nullable: false })
    instance: number

    @Column({ type: 'text', nullable: false })
    gitlabUrl: string

    @OneToMany(() => SubmissionHistory, submissionHistory => submissionHistory.repository)
    submissionHistory: SubmissionHistory

    @Column({ default: 'last', enum: ['first', 'last'] })
    gradingMethod: 'first' | 'last'

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    dueDate: Date

}