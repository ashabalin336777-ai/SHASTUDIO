import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { asyncHandler, HttpError } from '../lib/http'
import { requireAuth } from '../middleware/auth'
import { hashPassword, signToken, verifyPassword } from '../lib/auth'

const router = Router()

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email?.trim() || !password) {
      throw new HttpError(400, 'Email and password are required')
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) throw new HttpError(401, 'Invalid credentials')

    const ok = await verifyPassword(password, user.password)
    if (!ok) throw new HttpError(401, 'Invalid credentials')

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    res.json({
      token: signToken(authUser),
      user: authUser,
    })
  })
)

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true },
    })
    if (!user) throw new HttpError(401, 'Unauthorized')
    res.json(user)
  })
)

router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      throw new HttpError(400, 'currentPassword and newPassword are required')
    }
    if (newPassword.length < 8) {
      throw new HttpError(400, 'New password must be at least 8 characters')
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) throw new HttpError(401, 'Unauthorized')

    const ok = await verifyPassword(currentPassword, user.password)
    if (!ok) throw new HttpError(400, 'Current password is incorrect')

    const password = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password },
    })

    res.json({ message: 'Password updated' })
  })
)

export default router
