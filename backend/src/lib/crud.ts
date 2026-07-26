import { Router, Request, RequestHandler } from 'express'
import { paramId } from './params'
import { asyncHandler, HttpError } from './http'
import { requireAuth } from '../middleware/auth'

type Delegate = {
  findMany: (args?: unknown) => Promise<unknown>
  findUnique?: (args: unknown) => Promise<unknown | null>
  findFirst?: (args: unknown) => Promise<unknown | null>
  create: (args: { data: unknown }) => Promise<unknown>
  update: (args: { where: { id: string }; data: unknown }) => Promise<unknown>
}

type SoftDeleteCrudOptions = {
  name: string
  getDelegate: () => Delegate
  listArgs?: Record<string, unknown> | (() => Record<string, unknown>)
  softDeleteData?: Record<string, unknown>
  sanitize?: (body: unknown, mode: 'create' | 'update') => unknown
  resolveGet?: (req: Request) => Promise<unknown | null>
  /** Protect POST/PUT/DELETE (default true) */
  protectWrites?: boolean
}

export function createSoftDeleteCrudRouter(options: SoftDeleteCrudOptions) {
  const router = Router()
  const softDeleteData = options.softDeleteData ?? { isActive: false }
  const writeGuard: RequestHandler[] =
    options.protectWrites === false ? [] : [requireAuth]

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const args =
        typeof options.listArgs === 'function' ? options.listArgs() : options.listArgs ?? {}
      const items = await options.getDelegate().findMany(args)
      res.json(items)
    })
  )

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const item = options.resolveGet
        ? await options.resolveGet(req)
        : await options.getDelegate().findUnique?.({ where: { id: paramId(req) } })

      if (!item) throw new HttpError(404, `${options.name} not found`)
      res.json(item)
    })
  )

  router.post(
    '/',
    ...writeGuard,
    asyncHandler(async (req, res) => {
      const data = options.sanitize ? options.sanitize(req.body, 'create') : req.body
      const item = await options.getDelegate().create({ data })
      res.status(201).json(item)
    })
  )

  router.put(
    '/:id',
    ...writeGuard,
    asyncHandler(async (req, res) => {
      const data = options.sanitize ? options.sanitize(req.body, 'update') : req.body
      const item = await options.getDelegate().update({
        where: { id: paramId(req) },
        data,
      })
      res.json(item)
    })
  )

  router.delete(
    '/:id',
    ...writeGuard,
    asyncHandler(async (req, res) => {
      await options.getDelegate().update({
        where: { id: paramId(req) },
        data: softDeleteData,
      })
      res.json({ message: 'Deleted' })
    })
  )

  return router
}

export function pick(obj: Record<string, unknown>, keys: readonly string[]) {
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key]
  }
  return out
}

export function toDateOrNull(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (value instanceof Date) return value
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d
}

export function stripMetaFields(body: Record<string, unknown>) {
  const { id, createdAt, updatedAt, ...rest } = body
  void id
  void createdAt
  void updatedAt
  return rest
}
