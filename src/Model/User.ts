import mongoose, { Schema, Document } from 'mongoose'

interface IUser extends Document {
    userId: number,
    username: string,
    gitlabProfileId: number
}

const UserSchema = new Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    gitlabProfileId: {
        type: Number,
        required: true,
        unique: true
    },
})

const User = mongoose.model<IUser>('User', UserSchema)

export { User }

