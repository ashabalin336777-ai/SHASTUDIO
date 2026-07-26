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
import { errorMiddleware } from './lib/http'
import { ensureAdminUser } from './lib/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const uploadDir = path.resolve(process.cwd(), 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(uploadDir))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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
