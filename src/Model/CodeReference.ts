import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './Base'
import { Repository } from './Repository'

@Entity()
export class CodeReference extends BaseModel {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'text', nullable: false })
    contentHash: string

    @Column({ type: 'text', nullable: false })
    extension: string

    @Column({ type: 'text', nullable: false })
    filename: string

    @Column({ type: 'text', nullable: false })
    content: string

    @ManyToOne(() => Repository, repository => repository.codeReference)
    repository: Repository
}
