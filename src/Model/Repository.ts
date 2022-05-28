import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BaseModel } from './Base'
import { CodeReference } from './CodeReference'
import { SubmissionHistory } from './SubmissionHistory'

@Entity()
export class Repository extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'integer', nullable: false })
    activityId: number

    @Column({ type: 'integer', nullable: false })
    courseId: number

    @Column({ type: 'integer', nullable: false })
    instance: number

    @Column({ type: 'text', nullable: false })
    gitlabUrl: string

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
}
