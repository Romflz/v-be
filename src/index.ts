import express from 'express'
import { httpLogger, appLog } from './config/logger'
import exampleRoute from './routes/exampleRoute'
import { initDb } from './db/client'
import { env } from './config/env'

const app = express()
app.use(express.json())
app.use(httpLogger)

app.use('/example', exampleRoute)

const PORT = env.PORT

initDb()
  .then(() => {
    app.listen(PORT, () => {
      appLog.info(`Server started on port ${PORT}`)
    })
  })
  .catch((err) => {
    appLog.error('Failed to init DB', err)
    process.exit(1)
  })
