import { Column, Entity, PrimaryColumn, OneToMany, Index } from 'typeorm'
import { BaseModel } from './Base'
import { Submission } from './Submission'

@Entity()
export class Student extends BaseModel {
    @Index({ 'unique': true })
    @PrimaryColumn({ type: 'integer', nullable: false, unique: true })
    userId: number

    @Column({ type: 'text', nullable: false })
    username: string

    @Column({ type: 'integer', nullable: false })
    gitlabProfileId: number

    @OneToMany(() => Submission, submission => submission.student)
    submission: Submission[]
}
