import { Request, Response, NextFunction } from 'express'
import { AuthUser, verifyToken } from '../lib/auth'
import { HttpError } from '../lib/http'

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Unauthorized'))
  }

  try {
    req.user = verifyToken(header.slice(7))
    next()
  } catch {
    next(new HttpError(401, 'Invalid or expired token'))
  }
}
