import { prisma } from '../lib/prisma'
import { createSoftDeleteCrudRouter, pick, stripMetaFields } from '../lib/crud'

const fields = [
  'company',
  'companyLogo',
  'companyWebsite',
  'startYear',
  'startMonth',
  'endYear',
  'endMonth',
  'isCurrent',
  'city',
  'country',
  'remote',
  'position',
  'department',
  'description',
  'responsibilities',
  'achievements',
  'technologies',
  'isActive',
  'order',
] as const

export default createSoftDeleteCrudRouter({
  name: 'Experience',
  getDelegate: () => prisma.experience as never,
  listArgs: {
    where: { isActive: true },
    orderBy: [{ startYear: 'desc' }, { startMonth: 'desc' }],
  },
  sanitize: (body) =>
    pick(stripMetaFields(body as Record<string, unknown>), fields),
})
