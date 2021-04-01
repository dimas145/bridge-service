import mongoose, { Schema, Document } from 'mongoose'

interface IRepository extends Document {
    courseId: number,
    activityId: number,
    gitlabUrl: string
}

const RepositorySchema = new Schema({
    courseId: {
        type: Number,
        required: true,
    },
    activityId: {
        type: Number,
        required: true,
    },
    gitlabUrl: {
        type: String,
        required: true,
    },
})

const Repository = mongoose.model<IRepository>('Repository', RepositorySchema)

export { Repository }

