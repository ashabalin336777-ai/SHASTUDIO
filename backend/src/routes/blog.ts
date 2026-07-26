import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { paramId } from '../lib/params'
import { asyncHandler, HttpError } from '../lib/http'
import { pick, stripMetaFields, toDateOrNull } from '../lib/crud'
import { requireAuth } from '../middleware/auth'

const router = Router()

const fields = [
  'title',
  'slug',
  'excerpt',
  'content',
  'coverImage',
  'tags',
  'isPublished',
  'publishedAt',
] as const

function sanitize(body: unknown) {
  const data = pick(
    stripMetaFields(body as Record<string, unknown>),
    fields
  ) as Record<string, unknown>
  if ('publishedAt' in data) data.publishedAt = toDateOrNull(data.publishedAt)
  return data
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: 'desc' }],
    })
    res.json(items)
  })
)

router.get(
  '/all',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const items = await prisma.blogPost.findMany({
      orderBy: [{ createdAt: 'desc' }],
    })
    res.json(items)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = paramId(req)
    const item = await prisma.blogPost.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })
    if (!item) throw new HttpError(404, 'Blog post not found')
    res.json(item)
  })
)

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await prisma.blogPost.create({ data: sanitize(req.body) as never })
    res.status(201).json(item)
  })
)

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await prisma.blogPost.update({
      where: { id: paramId(req) },
      data: sanitize(req.body) as never,
    })
    res.json(item)
  })
)

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.blogPost.delete({ where: { id: paramId(req) } })
    res.json({ message: 'Deleted' })
  })
)

export default router
