import { createConnection } from 'typeorm'
import { Logger } from 'tslog'
import dotenv from 'dotenv'
import app from './app'

dotenv.config()
const log: Logger = new Logger()

const main = async () => {
    const PORT = process.env.PORT || 8085

    try {
        const connection = await createConnection()
        await connection.synchronize()
        log.info('success connect to db')
    } catch (error) {
        log.info("Can't connect to db", error)
        process.exit(1)
    }

    app.listen(PORT, () => {
        log.info(`Server is running at port: ${PORT}`)
    })
}

main()
