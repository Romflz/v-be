import morgan from 'morgan'
import type { Request, Response, NextFunction } from 'express'
import { isDev } from '../config/env'

// Middleware to capture response body
function captureResponseBody(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json
  const originalSend = res.send

  res.json = function (body: any) {
    res.locals.responseBody = body
    return originalJson.call(this, body)
  }

  res.send = function (body: any) {
    res.locals.responseBody = body
    return originalSend.call(this, body)
  }

  next()
}

// Token for request body (works for POST, PUT, PATCH)
morgan.token('req-body', (req: Request) => {
  if (!isDev) return '-'
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method?.toUpperCase() || '')) return '-'
  const body = (req as any).body
  if (!body || Object.keys(body).length === 0) return '-'
  try {
    const str = JSON.stringify(body)
    return str.length > 800 ? str.slice(0, 800) + '...' : str
  } catch {
    return '[parse error]'
  }
})

// Token for response body
morgan.token('res-body', (_req: Request, res: Response) => {
  if (!isDev) return '-'
  const body = res.locals.responseBody
  if (body == null) return '-'
  try {
    const str = typeof body === 'string' ? body : JSON.stringify(body)
    return str.length > 800 ? str.slice(0, 800) + '...' : str
  } catch {
    return '[parse error]'
  }
})

// Format that shows everything clearly
const verboseFormat = ':date[iso] :method :url :status :response-time ms ReqBody::req-body ResBody::res-body'
const basicFormat = ':method :url :status :response-time ms'

export const httpLogger = isDev ? [captureResponseBody, morgan(verboseFormat)] : [morgan(basicFormat)]

// Simple app logger
export const appLog = {
  info: (...args: any[]) => console.log('[INFO]', new Date().toISOString(), ...args),
  error: (...args: any[]) => console.error('[ERROR]', new Date().toISOString(), ...args),
  warn: (...args: any[]) => console.warn('[WARN]', new Date().toISOString(), ...args),
  debug: (...args: any[]) => {
    if (isDev) console.log('[DEBUG]', new Date().toISOString(), ...args)
  },
}
