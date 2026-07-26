import { Request, Response, NextFunction, RequestHandler } from 'express'

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export function asyncHandler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
