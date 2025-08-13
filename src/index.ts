import express from 'express'
import { httpLogger, appLog } from './config/logger'
import apiRoute from './routes/apiRoute'
import { initDb } from './db/client'
import { env } from './config/env'
import './config/firebase' // side-effect import ensures Firebase Admin initializes once

import cors from 'cors'

const app = express()
app.use(express.json())
app.use(httpLogger)
app.use(cors())

app.use('/api', apiRoute)

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
