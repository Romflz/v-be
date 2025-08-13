import express from 'express'
import exampleRoute from './routes/exampleRoute'
import { initDb } from './db/client'
import { env } from './config/env'

const app = express()
app.use(express.json())

app.use('/example', exampleRoute)

const PORT = env.PORT

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to init DB', err)
    process.exit(1)
  })
