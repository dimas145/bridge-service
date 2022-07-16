import { Column, Entity, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'
import { Submission } from './Submission'
import { DockerStatus } from '../Type/Docker'
import { Constant } from '../constant'

@Entity()
export class Autograder extends BaseModel {
    @PrimaryColumn({ type: 'text', nullable: false })
    imageName: string

    @Column({ type: 'text', nullable: false })
    displayedName: string

    @Column({ type: 'text', nullable: false })
    description: string

    @Column({ type: 'text', nullable: true, unique: true })
    containerId: string | null

    @Column({ enum: DockerStatus })
    status: DockerStatus

    @OneToMany(() => Submission, submission => submission.autograder)
    submission: Submission[]

    @ManyToMany(() => Repository, repository => repository.graders)
    repository: Repository[]

    public get name(): string {
        return this.imageName.split('/')[1].split(':')[0]
    }

    public get alias(): string {
        return this.containerId?.slice(0, 12) || ''
    }

    public get url(): string {
        return `http://${this.alias}:${Constant.GRADER_PORT}`
    }
}
