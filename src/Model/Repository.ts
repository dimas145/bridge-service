import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm'
import { Autograder } from './Autograder'
import { BaseModel } from './Base'
import { CodeReference } from './CodeReference'
import { SubmissionHistory } from './SubmissionHistory'
import { GradingMethod, GradingPriority } from '../Type/Grading'

@Entity()
export class Repository extends BaseModel {
    @PrimaryColumn({ type: 'integer', nullable: false })
    activityId: number

    @PrimaryColumn({ type: 'integer', nullable: false })
    courseId: number

    @Column({ type: 'text', nullable: false })
    gitlabUrl: string

    @Column({ type: 'integer', nullable: false })
    timeLimit: number

    @Column({ default: GradingPriority.LAST, enum: GradingPriority })
    gradingPriority: GradingPriority

    @Column({ default: GradingMethod.MAXIMUM, enum: GradingMethod })
    gradingMethod: GradingMethod

    @Column({ type: 'timestamp' })
    dueDate: Date

    @OneToMany(() => SubmissionHistory, submissionHistory => submissionHistory.repository)
    submissionHistory: SubmissionHistory[]

    @OneToMany(() => CodeReference, codeReference => codeReference.repository)
    codeReference: CodeReference[]

    @ManyToMany(() => Autograder, autograder => autograder.repository)
    @JoinTable()
    graders: Autograder[]
}
