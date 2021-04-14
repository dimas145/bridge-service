import dotenv from 'dotenv'
dotenv.config()
import app from './app'
import { Queue } from './Queue/'
import mongoose from 'mongoose'

const main = async () => {


    const PORT = process.env.PORT || 8080

    await Queue.init({
        url: process.env.QUEUE || 'amqp://localhost'
    })
    console.log('success connect to rabbitmq')


    const MONGODB_URL = process.env.MONGODB_URL as string

    try {
        await mongoose.connect(MONGODB_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log('success connect to mongodb')
    } catch (error) {
        console.log("Can't connect to mongodb", error)
        process.exit(1)
    }

    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`)
    })
}

main()