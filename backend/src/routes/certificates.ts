import { prisma } from '../lib/prisma'
import {
  createSoftDeleteCrudRouter,
  pick,
  stripMetaFields,
  toDateOrNull,
} from '../lib/crud'

const fields = [
  'title',
  'issuer',
  'issuerLogo',
  'issueDate',
  'expiryDate',
  'credentialId',
  'credentialUrl',
  'image',
  'description',
  'isActive',
  'order',
] as const

export default createSoftDeleteCrudRouter({
  name: 'Certificate',
  getDelegate: () => prisma.certificate as never,
  listArgs: {
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { issueDate: 'desc' }],
  },
  sanitize: (body) => {
    const data = pick(
      stripMetaFields(body as Record<string, unknown>),
      fields
    ) as Record<string, unknown>
    if ('issueDate' in data && data.issueDate != null) {
      data.issueDate = toDateOrNull(data.issueDate) ?? new Date()
    }
    if ('expiryDate' in data) data.expiryDate = toDateOrNull(data.expiryDate)
    return data
  },
})
