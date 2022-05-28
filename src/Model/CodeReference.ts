import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'

@Entity()
export class CodeReference extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Index({ 'unique': true })
    @Column({ type: 'text', nullable: false, unique: true })
    contentHash: string

    @Column({ type: 'text', nullable: false })
    extension: string

    @Column({ type: 'text', nullable: false })
    filename: string

    @Column({ type: 'text', nullable: false })
    content: string

    @ManyToOne(() => Repository, repository => repository.id)
    repository: Repository
}
