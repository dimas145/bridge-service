// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

module.exports = {
    'type': 'postgres',
    'host': process.env.DATABASE_HOST,
    'port': process.env.DATABASE_PORT,
    'username': process.env.DATABASE_USERNAME,
    'password': process.env.DATABASE_PASSWORD,
    'database': process.env.DATABASE_NAME,
    'synchronize': true,
    'entities': ['dist/Model/*.js'] // TODO create migrate for production
}
