import { prisma } from '../lib/prisma'
import { createSoftDeleteCrudRouter, pick, stripMetaFields } from '../lib/crud'

const fields = [
  'institution',
  'logo',
  'website',
  'degree',
  'field',
  'startYear',
  'startMonth',
  'endYear',
  'endMonth',
  'isCurrent',
  'description',
  'gpa',
  'certificate',
  'certificateUrl',
  'isActive',
  'order',
] as const

export default createSoftDeleteCrudRouter({
  name: 'Education',
  getDelegate: () => prisma.education as never,
  listArgs: {
    where: { isActive: true },
    orderBy: [{ startYear: 'desc' }, { order: 'asc' }],
  },
  sanitize: (body) =>
    pick(stripMetaFields(body as Record<string, unknown>), fields),
})
