import { Column, Entity, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'
import { SubmissionHistory } from './SubmissionHistory'

@Entity()
export class Autograder extends BaseModel {
    @PrimaryColumn({ type: 'text', nullable: false })
    containerId: string

    @Column({ type: 'integer', nullable: false })
    port: number

    @Column({ type: 'text', nullable: false })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ type: 'text', nullable: true })
    status: string

    @OneToMany(() => SubmissionHistory, submissionHistory => submissionHistory.autograder)
    submissionHistory: SubmissionHistory[]

    @ManyToMany(() => Repository, repository => repository.graders)
    repository: Repository[]
}
