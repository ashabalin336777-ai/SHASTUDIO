import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { asyncHandler } from '../lib/http'
import { pick, stripMetaFields } from '../lib/crud'
import { requireAuth } from '../middleware/auth'

const router = Router()

const fields = [
  'fullName',
  'title',
  'bio',
  'avatar',
  'location',
  'email',
  'phone',
  'website',
  'telegram',
  'max',
  'github',
  'linkedin',
  'mbtiType',
  'personalTraits',
  'skills',
] as const

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const profile = await prisma.profile.findFirst()
    res.json(profile || {})
  })
)

router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = pick(stripMetaFields(req.body as Record<string, unknown>), fields)
    const existing = await prisma.profile.findFirst()
    const profile = existing
      ? await prisma.profile.update({ where: { id: existing.id }, data: data as never })
      : await prisma.profile.create({ data: data as never })
    res.json(profile)
  })
)

export default router
