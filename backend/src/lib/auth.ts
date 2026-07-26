import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: string
}

const TOKEN_TTL = '7d'

function jwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export function hashPassword(password: string) {
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10)
  return bcrypt.hash(password, rounds)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(user: AuthUser) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    jwtSecret(),
    { expiresIn: TOKEN_TTL }
  )
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, jwtSecret()) as {
    sub: string
    email: string
    role: string
    name?: string | null
  }
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name ?? null,
  }
}

function truthy(value: string | undefined) {
  return ['1', 'true', 'yes', 'on'].includes((value || '').trim().toLowerCase())
}

export async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || 'admin@shastudio.local').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Admin'
  const forcePassword = truthy(process.env.ADMIN_PASSWORD_FORCE)

  const existing = await prisma.user.findUnique({ where: { email } })
  const hashed = await hashPassword(password)

  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: 'admin',
      },
    })
    console.log(`[auth] Seeded admin user: ${email}`)
    return { created: true, updated: false, email }
  }

  if (forcePassword) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashed, name: existing.name || name },
    })
    console.log(`[auth] Forced password reset for admin: ${email}`)
    return { created: false, updated: true, email }
  }

  return { created: false, updated: false, email }
}
