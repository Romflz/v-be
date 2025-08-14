import express from 'express'
import { httpLogger, appLog } from './config/logger'
import { env } from './config/env'

const app = express()
app.use(express.json())
app.use(httpLogger)

const PORT = env.PORT

app.listen(PORT, () => {
  appLog.info(`Server started on port ${PORT}`)
})
