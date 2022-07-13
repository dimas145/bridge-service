import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Autograder } from './Autograder'
import { BaseModel } from './Base'
import { Repository } from './Repository'
import { Student } from './Student'

@Entity()
export class SubmissionHistory extends BaseModel {
    @PrimaryColumn()
    repositoryCourseId: number

    @PrimaryColumn()
    repositoryAssignmentId: number

    @PrimaryColumn()
    studentUserId: number

    @PrimaryColumn()
    autograderName: string

    @Column({ type: 'integer', nullable: false })
    grade: number

    @ManyToOne(() => Repository, repository => repository.submissionHistory)
    repository: Repository

    @ManyToOne(() => Student, student => student.submissionHistory)
    student: Student

    @ManyToOne(() => Autograder, autograder => autograder.submissionHistory)
    autograder: Autograder
}
