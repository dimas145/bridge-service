import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Autograder } from './Autograder'
import { BaseModel } from './Base'
import { Repository } from './Repository'
import { Student } from './Student'

@Entity()
export class SubmissionDetail extends BaseModel {
    @PrimaryColumn()
    repositoryCourseId: number

    @PrimaryColumn()
    repositoryAssignmentId: number

    @PrimaryColumn()
    codeReferenceId: number

    @PrimaryColumn()
    studentUserId: number

    @PrimaryColumn()
    autograderImageName: string

    @Column({ type: 'text', nullable: true })
    detail: string

    @ManyToOne(() => Repository, repository => repository.submission)
    repository: Repository

    @ManyToOne(() => Student, student => student.submission)
    student: Student

    @ManyToOne(() => Autograder, autograder => autograder.submission)
    autograder: Autograder
}
