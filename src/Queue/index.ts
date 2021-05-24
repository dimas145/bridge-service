import amqp, { Channel } from 'amqplib'

interface QueueOption {
    url: string
}

export class Queue {
    private static connection: Channel

    private constructor() { }

    public static async init(queueOption: QueueOption) {
        if (!this.connection) {
            try {
                const conn = await amqp.connect(queueOption.url)
                const ch = await conn.createChannel()
                this.connection = ch
            } catch (error) {
                console.log('Error starting queue', error)
            }
        }
    }

    public static get conn() {
        if (!this.connection) {
            throw Error('Init queue first')
        }
        return this.connection
    }

    public static async sendMessage(queueName: string, message: string) {
        this.connection.assertQueue(queueName, { durable: false }).then(
            () => {
                this.connection.sendToQueue(queueName, Buffer.from(message))
                console.log(`message: ${message} is sent`)
            }
        )

    }
}