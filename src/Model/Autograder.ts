import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm'
import { BaseModel } from './Base'
import { SubmissionHistory } from './SubmissionHistory'

@Entity()
export class Autograder extends BaseModel {
    @PrimaryColumn({ type: 'text', nullable: false })
    containerId: string

    @Column({ type: 'integer', nullable: false })
    port: number

    @Column({ type: 'integer', nullable: false })
    name: number

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'text', nullable: true })
    status: string

    @OneToMany(() => SubmissionHistory, submissionHistory => submissionHistory.autograder)
    submissionHistory: SubmissionHistory[]
}
