import mongoose, { Schema, Document } from 'mongoose'

interface IRepository extends Document {
    courseId: number,
    activityId: number,
    gitlabUrl: string,
    metricFile?: {
        contentHash: string,
        mimetype: string,
        filename: string
    }
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
    metricFile: {
        contentHash: {
            type: String
        },
        mimetype: {
            type: String
        },
        filename: {  // base64 binary file
            type: String
        }
    }
})

const Repository = mongoose.model<IRepository>('Repository', RepositorySchema)

export { Repository }

