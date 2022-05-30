import dotenv from 'dotenv'
dotenv.config()
import { createConnection } from 'typeorm'
import app from './app'

const main = async () => {
    const PORT = process.env.PORT || 8085

    try {
        const connection = await createConnection()
        await connection.synchronize()
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