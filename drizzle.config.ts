import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
const env = process.env.NODE_ENV
if (env) dotenv.config({ path: `.env.${env}` })
dotenv.config()

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: (process.env.DATABASE_URL as string) || 'postgres://postgres:postgres@localhost:5432/postgres' },
  verbose: true,
  strict: true,
})
