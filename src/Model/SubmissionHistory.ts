import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'
import { Student } from './Student'

@Entity()
export class SubmissionHistory extends BaseModel {
    @Column({ type: 'integer', nullable: false })
    grade: number

    @ManyToOne(() => Repository, repository => repository.submissionHistory)
    repository: Repository

    @ManyToOne(() => Student, student => student.submissionHistory)
    student: Student

    @Column({ type: 'text', nullable: true })
    detail: string
}