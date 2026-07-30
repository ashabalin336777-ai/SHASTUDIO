import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveSqliteUrl() {
  const raw = process.env.DATABASE_URL || 'file:./data/shastudio.db'
  if (!raw.startsWith('file:')) {
    throw new Error(
      `SQLite DATABASE_URL must start with file: (got: ${raw}). Example: file:./data/shastudio.db`
    )
  }

  const withoutScheme = raw.slice('file:'.length)
  const filePath = path.isAbsolute(withoutScheme)
    ? withoutScheme
    : path.resolve(process.cwd(), withoutScheme)

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  return `file:${filePath}`
}

function createPrismaClient() {
  const url = resolveSqliteUrl()
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
