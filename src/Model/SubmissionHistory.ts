import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Autograder } from './Autograder'
import { BaseModel } from './Base'
import { Repository } from './Repository'
import { Student } from './Student'

@Entity()
export class SubmissionHistory extends BaseModel {
    @PrimaryColumn()
    repositoryActivityId: number

    @PrimaryColumn()
    repositoryCourseId: number

    @PrimaryColumn()
    studentUserId: number

    @PrimaryColumn()
    autograderContainerId: number

    @Column({ type: 'integer', nullable: false })
    grade: number

    @Column({ type: 'text', nullable: true })
    detail: string

    @ManyToOne(() => Repository, repository => repository.submissionHistory)
    repository: Repository

    @ManyToOne(() => Student, student => student.submissionHistory)
    student: Student

    @ManyToOne(() => Autograder, autograder => autograder.submissionHistory)
    autograder: Autograder
}
