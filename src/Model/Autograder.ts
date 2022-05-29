import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { BaseModel } from './Base'
import { SubmissionHistory } from './SubmissionHistory'

@Entity()
export class Autograder extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'text', nullable: false })
    port: string

    @Column({ type: 'integer', nullable: false })
    name: number

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'text', nullable: true })
    status: string

    @OneToMany(() => SubmissionHistory, submissionHistory => submissionHistory.autograder)
    submissionHistory: SubmissionHistory[]
}
