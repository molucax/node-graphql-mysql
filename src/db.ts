import { DataSource } from 'typeorm'
import { Users } from './Entities/Users'
import { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } from './config'

export const appDataSource = new DataSource({
  type: 'mysql',
  username: DB_USER,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
  host: DB_HOST,
  database: DB_NAME,
  entities: [Users],
  synchronize: false,
  ssl: false,
})

export const connectDB = async () => {
  console.time('main')
  await appDataSource.initialize()
}
