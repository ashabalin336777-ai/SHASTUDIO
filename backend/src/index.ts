import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import profileRoutes from './routes/profile'
import experienceRoutes from './routes/experience'
import educationRoutes from './routes/education'
import coursesRoutes from './routes/courses'
import projectRoutes from './routes/projects'
import blogRoutes from './routes/blog'
import certificateRoutes from './routes/certificates'
import chatRoutes from './routes/chat'
import contextRoutes from './routes/context'
import authRoutes from './routes/auth'
import mediaRoutes from './routes/media'
import uploadsRoutes from './routes/uploads'
import { errorMiddleware } from './lib/http'
import { ensureAdminUser } from './lib/auth'
import { prisma } from './lib/prisma'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const uploadDir = path.resolve(process.cwd(), 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // PDFs are embedded in the Next.js app (often another origin in local/dev).
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'frame-ancestors': ["'self'", 'http://localhost:3000', 'https://shastudio.ru'],
        // Allow <object>/<embed> for PDF previews when used.
        'object-src': ["'self'", 'blob:', 'data:'],
      },
    },
  })
)
app.use(cors())
app.use(express.json({ limit: '1mb' }))
// Uploads must be frameable for certificate PDF previews (admin + public site).
app.use(
  '/uploads',
  (_req, res, next) => {
    res.removeHeader('X-Frame-Options')
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none';frame-ancestors *; object-src 'self';sandbox"
    )
    next()
  },
  express.static(uploadDir)
)

app.get('/health', async (_req, res) => {
  const timestamp = new Date().toISOString()
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'up', timestamp })
  } catch (error) {
    console.error('[health] database check failed:', error)
    res.status(503).json({ status: 'degraded', db: 'down', timestamp })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/experience', experienceRoutes)
app.use('/api/education', educationRoutes)
app.use('/api/courses', coursesRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/context', contextRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/uploads', uploadsRoutes)

app.use(errorMiddleware)

async function start() {
  try {
    await ensureAdminUser()
  } catch (error) {
    console.error('[auth] Failed to seed admin user:', error)
  }

  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`)
  })
}

start()
