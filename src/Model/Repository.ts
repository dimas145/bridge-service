import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm'
import { Autograder } from './Autograder'
import { BaseModel } from './Base'
import { CodeReference } from './CodeReference'
import { SubmissionHistory } from './SubmissionHistory'

@Entity()
export class Repository extends BaseModel {
    @PrimaryColumn({ type: 'integer', nullable: false })
    activityId: number

    @PrimaryColumn({ type: 'integer', nullable: false })
    courseId: number

    @Column({ type: 'integer', nullable: false })
    instance: number

    @Column({ type: 'text', nullable: false })
    gitlabUrl: string

    @Column({ type: 'integer', nullable: false })
    timeLimit: number

    @Column({ default: 'last', enum: ['first', 'last'] })
    gradingPriority: 'first' | 'last'

    @Column({ default: 'max', enum: ['max', 'min', 'avg'] })
    gradingMethod: 'max' | 'min' | 'avg'

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
