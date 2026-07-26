import { Router } from 'express'
import { asyncHandler, HttpError } from '../lib/http'
import { buildSiteContext, callVseLlm } from '../lib/ai'

const router = Router()

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { message } = req.body as { message?: string }
    if (!message?.trim()) throw new HttpError(400, 'Message is required')

    const context = await buildSiteContext()
    const answer = await callVseLlm(
      `Ты - AI помощник сайта ShaStudio. Отвечай на вопросы о владельце сайта, опыте, проектах и навыках.
ОТВЕЧАЙ ТОЛЬКО НА ОСНОВЕ ПРЕДОСТАВЛЕННОГО КОНТЕКСТА. НЕ ВЫДУМЫВАЙ ИНФОРМАЦИЮ.

Контекст:
${context}`,
      message,
      500
    )

    res.json({ answer })
  })
)

export default router
