import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma'
import { asyncHandler, HttpError } from '../lib/http'
import { requireAuth } from '../middleware/auth'
import { isMediaSection, MEDIA_SECTIONS } from '../lib/sections'

const uploadDir = path.resolve(process.cwd(), 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, safe)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Можно загружать только изображения'))
      return
    }
    cb(null, true)
  },
})

const router = Router()

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await prisma.sectionMedia.findMany()
    const map = Object.fromEntries(items.map((i) => [i.section, i.imageUrl]))
    res.json({
      sections: MEDIA_SECTIONS,
      media: map,
    })
  })
)

router.get(
  '/:section',
  asyncHandler(async (req, res) => {
    const section = String(req.params.section)
    if (!isMediaSection(section)) throw new HttpError(400, 'Unknown section')
    const item = await prisma.sectionMedia.findUnique({ where: { section } })
    res.json({ section, imageUrl: item?.imageUrl || null })
  })
)

router.put(
  '/:section',
  requireAuth,
  asyncHandler(async (req, res) => {
    const section = String(req.params.section)
    if (!isMediaSection(section)) throw new HttpError(400, 'Unknown section')
    const imageUrl =
      typeof req.body?.imageUrl === 'string' && req.body.imageUrl.trim()
        ? req.body.imageUrl.trim()
        : null

    const item = await prisma.sectionMedia.upsert({
      where: { section },
      create: { section, imageUrl },
      update: { imageUrl },
    })
    res.json(item)
  })
)

router.post(
  '/:section/upload',
  requireAuth,
  (req, _res, next) => {
    const section = String(req.params.section)
    if (!isMediaSection(section)) {
      next(new HttpError(400, 'Unknown section'))
      return
    }
    next()
  },
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        const message =
          err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
            ? 'Файл слишком большой (макс. 10 МБ)'
            : err.message || 'Upload failed'
        next(new HttpError(400, message))
        return
      }
      next()
    })
  },
  asyncHandler(async (req, res) => {
    const section = String(req.params.section)
    if (!isMediaSection(section)) throw new HttpError(400, 'Unknown section')
    if (!req.file) throw new HttpError(400, 'File is required')

    const imageUrl = `/uploads/${req.file.filename}`
    const item = await prisma.sectionMedia.upsert({
      where: { section },
      create: { section, imageUrl },
      update: { imageUrl },
    })
    res.status(201).json(item)
  })
)

router.delete(
  '/:section',
  requireAuth,
  asyncHandler(async (req, res) => {
    const section = String(req.params.section)
    if (!isMediaSection(section)) throw new HttpError(400, 'Unknown section')
    await prisma.sectionMedia.upsert({
      where: { section },
      create: { section, imageUrl: null },
      update: { imageUrl: null },
    })
    res.json({ message: 'Cleared' })
  })
)

export default router
