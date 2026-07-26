import { prisma } from '../lib/prisma'
import {
  createSoftDeleteCrudRouter,
  pick,
  stripMetaFields,
  toDateOrNull,
} from '../lib/crud'

const fields = [
  'title',
  'provider',
  'platform',
  'startDate',
  'endDate',
  'certificate',
  'certificateUrl',
  'description',
  'skills',
  'isActive',
  'order',
] as const

export default createSoftDeleteCrudRouter({
  name: 'Course',
  getDelegate: () => prisma.course as never,
  listArgs: {
    where: { isActive: true },
    orderBy: [{ order: 'asc' }],
  },
  sanitize: (body) => {
    const data = pick(
      stripMetaFields(body as Record<string, unknown>),
      fields
    ) as Record<string, unknown>
    if ('startDate' in data) data.startDate = toDateOrNull(data.startDate)
    if ('endDate' in data) data.endDate = toDateOrNull(data.endDate)
    return data
  },
})
