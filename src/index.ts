import dotenv from 'dotenv'
dotenv.config()
import { createConnection } from 'typeorm'
import app from './app'
import { Queue } from './Queue/'

const main = async () => {
    const PORT = process.env.PORT || 8085

    await Queue.init({
        url: process.env.QUEUE_URL as string
    })
    console.log('success connect to rabbitmq')

    try {
        createConnection()
        console.log('success connect to db')
    } catch (error) {
        console.log("Can't connect to db", error)
        process.exit(1)
    }

    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`)
    })
}

main()