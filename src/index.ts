import express from 'express'
import { httpLogger, appLog } from './config/logger'
import apiRoute from './routes/apiRoute'
import { env } from './config/env'
import './config/firebase'

import cors from 'cors'

const app = express()
app.use(express.json())
app.use(httpLogger)
app.use(cors())

app.use('/api', apiRoute)

const PORT = env.PORT

app.listen(PORT, () => {
  appLog.info(`Server started on port ${PORT}`)
})
