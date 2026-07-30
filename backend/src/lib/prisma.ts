import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

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
  // libsql accepts file:./relative or file:/absolute
  if (withoutScheme === ':memory:' || withoutScheme.startsWith(':memory:')) {
    return raw
  }

  const filePath = path.isAbsolute(withoutScheme)
    ? withoutScheme
    : path.resolve(process.cwd(), withoutScheme)

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  // Prefer forward slashes for libsql on all platforms
  return `file:${filePath.replace(/\\/g, '/')}`
}

function createPrismaClient() {
  const url = resolveSqliteUrl()
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
