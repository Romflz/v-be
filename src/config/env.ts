import { config } from 'dotenv'
import { z } from 'zod'

// Load environment files
const NODE_ENV = process.env.NODE_ENV || 'development'
config({ path: `.env.${NODE_ENV}` })
config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, 'Must be a postgres connection string')
    .default('postgres://postgres:postgres@localhost:5432/postgres'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
})

// Parse and validate
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Environment validation failed:')
  const errors = parsed.error.format()
  Object.entries(errors).forEach(([field, value]) => {
    if (field !== '_errors' && value && typeof value === 'object' && '_errors' in value) {
      console.error(`  ${field}: ${value._errors.join(', ')}`)
    }
  })
  process.exit(1)
}

// Export validated config
export const env = parsed.data

// Export type
export type Env = z.infer<typeof envSchema>

// Helper to check environment
export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
