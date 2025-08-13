import { Client } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../config/env'
import { appLog } from '../config/logger'

const connectionString = env.DATABASE_URL

export const pgClient = new Client({ connectionString })
export const db = drizzle(pgClient)

let connected = false
export async function initDb() {
  if (connected) return
  await pgClient.connect()
  connected = true
  appLog.info('Database connected')
}
