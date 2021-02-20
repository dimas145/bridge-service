import dotenv from 'dotenv'
import app from './app'
import { Queue } from './Queue/'


const main = async () => {

    dotenv.config()

    const PORT = process.env.PORT || 8080

    await Queue.init({
        url: process.env.QUEUE || 'amqp://localhost'
    })

    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`)
    })
}

main()