import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'

@Entity()
export class MetricFile extends BaseModel {
    @Column({ type: 'text', nullable: false })
    contentHash: string

    @Column({ type: 'text', nullable: false })
    extension: string

    @Column({ type: 'text', nullable: false })
    filename: string

    @ManyToOne(() => Repository, repository => repository.id)
    repository: Repository
}