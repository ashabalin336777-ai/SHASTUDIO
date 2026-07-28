import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { asyncHandler, HttpError } from '../lib/http'
import { requireAuth } from '../middleware/auth'

const uploadDir = path.resolve(process.cwd(), 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin'
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, safe)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new Error('Можно загружать изображения (JPG/PNG/WebP) или PDF'))
      return
    }
    cb(null, true)
  },
})

const router = Router()

router.post(
  '/',
  requireAuth,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        const message =
          err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
            ? 'Файл слишком большой (макс. 15 МБ)'
            : err.message || 'Upload failed'
        next(new HttpError(400, message))
        return
      }
      next()
    })
  },
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'File is required')
    const url = `/uploads/${req.file.filename}`
    res.status(201).json({
      url,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    })
  })
)

export default router
