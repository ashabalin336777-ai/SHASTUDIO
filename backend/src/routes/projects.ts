import { prisma } from '../lib/prisma'
import { paramId } from '../lib/params'
import { createSoftDeleteCrudRouter, pick, stripMetaFields } from '../lib/crud'

const fields = [
  'title',
  'slug',
  'description',
  'content',
  'image',
  'images',
  'category',
  'tags',
  'link',
  'demo',
  'github',
  'technologies',
  'isActive',
  'featured',
  'order',
] as const

export default createSoftDeleteCrudRouter({
  name: 'Project',
  getDelegate: () => prisma.project as never,
  listArgs: {
    where: { isActive: true },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
  },
  resolveGet: async (req) => {
    const id = paramId(req)
    return prisma.project.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })
  },
  sanitize: (body) =>
    pick(stripMetaFields(body as Record<string, unknown>), fields),
})
