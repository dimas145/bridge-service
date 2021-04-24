import { Column, Entity, OneToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'

@Entity()
export class MetricFile extends BaseModel {
    @Column({ type: 'text', nullable: false })
    contentHash: string

    @Column({ type: 'text', nullable: false })
    mimetype: string

    @Column({ type: 'text', nullable: false })
    filename: string

    @OneToOne(() => Repository)
    @JoinColumn()
    repository: Repository
}