import { Column, Entity, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'
import { SubmissionHistory } from './SubmissionHistory'
import { DockerStatus } from '../Type/Docker'

@Entity()
export class Autograder extends BaseModel {
    @PrimaryColumn({ type: 'text', nullable: false })
    name: string

    @Column({ type: 'text', nullable: false })
    repoTag: string

    @Column({ type: 'text', nullable: false })
    endpoint: string

    @Column({ type: 'integer', nullable: false })
    port: number

    @Column({ type: 'text', nullable: true })
    containerId: string | null

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ enum: DockerStatus })
    status: DockerStatus

    @OneToMany(() => SubmissionHistory, submissionHistory => submissionHistory.autograder)
    submissionHistory: SubmissionHistory[]

    @ManyToMany(() => Repository, repository => repository.graders)
    repository: Repository[]
}
