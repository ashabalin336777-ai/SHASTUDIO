import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { asyncHandler, HttpError } from '../lib/http'
import { buildSiteContext, callVseLlm } from '../lib/ai'
import { createSoftDeleteCrudRouter, pick, stripMetaFields } from '../lib/crud'
import { requireAuth } from '../middleware/auth'

const crud = createSoftDeleteCrudRouter({
  name: 'SiteContext',
  getDelegate: () => prisma.siteContext as never,
  listArgs: {
    where: { isActive: true },
    orderBy: { section: 'asc' },
  },
  sanitize: (body) =>
    pick(stripMetaFields(body as Record<string, unknown>), [
      'section',
      'content',
      'keywords',
      'isActive',
    ]),
})

const router = Router()

router.post(
  '/generate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { section, prompt } = req.body as { section?: string; prompt?: string }
    if (!section || !prompt) {
      throw new HttpError(400, 'section and prompt are required')
    }

    const context = await buildSiteContext()
    const content = await callVseLlm(
      `Ты помощник редактора портфолио ShaStudio. Сгенерируй черновик раздела "${section}" на русском.
Опирайся на контекст сайта, не выдумывай биографические факты которых нет.
Верни только текст раздела без markdown-обёртки.`,
      `Контекст сайта:\n${context}\n\nЗадача:\n${prompt}`,
      1200
    )

    const saved = await prisma.siteContext.create({
      data: {
        section,
        content,
        keywords: [section],
        isActive: true,
      },
    })

    res.status(201).json(saved)
  })
)

router.use(crud)

export default router
