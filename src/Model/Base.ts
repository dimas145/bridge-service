import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export class BaseModel extends BaseEntity {
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date
}
