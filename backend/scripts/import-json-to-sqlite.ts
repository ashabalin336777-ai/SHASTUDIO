/**
 * Import portfolio JSON into SQLite.
 * JSON shape: { users?, profile?, experiences?, education?, courses?,
 *   projects?, blog_posts?, certificates?, site_context?, section_media? }
 *
 * Usage:
 *   DATABASE_URL=file:./data/shastudio.db npx tsx scripts/import-json-to-sqlite.ts ./export.json
 */
import fs from 'fs'
import { prisma } from '../src/lib/prisma'

type Row = Record<string, unknown>

function asJsonArray(value: unknown) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return value
}

function dates(row: Row, keys: string[]) {
  const out = { ...row }
  for (const key of keys) {
    if (out[key] != null) out[key] = new Date(String(out[key]))
  }
  return out
}

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: npx tsx scripts/import-json-to-sqlite.ts <export.json>')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, Row[]>

  if (data.users?.length) {
    for (const row of data.users) {
      const r = dates(row, ['createdAt', 'updatedAt'])
      await prisma.user.upsert({
        where: { email: String(r.email) },
        create: r as never,
        update: {
          password: r.password as string,
          name: (r.name as string) ?? null,
          role: (r.role as string) ?? 'admin',
        },
      })
    }
  }

  if (data.profile?.length) {
    for (const row of data.profile) {
      const r = dates(row, ['createdAt', 'updatedAt'])
      await prisma.profile.create({
        data: {
          ...r,
          personalTraits: asJsonArray(r.personalTraits),
          skills: asJsonArray(r.skills),
        } as never,
      })
    }
  }

  const simple = [
    ['experiences', 'experience', ['createdAt', 'updatedAt'], ['responsibilities', 'achievements', 'technologies']],
    ['education', 'education', ['createdAt', 'updatedAt'], []],
    ['courses', 'course', ['createdAt', 'updatedAt', 'startDate', 'endDate'], ['skills']],
    ['projects', 'project', ['createdAt', 'updatedAt'], ['images', 'tags', 'technologies']],
    ['blog_posts', 'blogPost', ['createdAt', 'updatedAt', 'publishedAt'], ['tags']],
    ['certificates', 'certificate', ['createdAt', 'updatedAt', 'issueDate', 'expiryDate'], []],
    ['site_context', 'siteContext', ['createdAt', 'updatedAt'], ['keywords']],
    ['section_media', 'sectionMedia', ['createdAt', 'updatedAt'], []],
  ] as const

  for (const [key, model, dateKeys, jsonKeys] of simple) {
    const rows = data[key]
    if (!rows?.length) continue
    const delegate = (prisma as never as Record<string, { create: (a: { data: unknown }) => Promise<unknown> }>)[
      model
    ]
    for (const row of rows) {
      let r = dates(row, [...dateKeys])
      for (const jk of jsonKeys) r = { ...r, [jk]: asJsonArray(r[jk]) }
      try {
        await delegate.create({ data: r })
      } catch (e) {
        console.warn(`skip ${key}`, e)
      }
    }
  }

  console.log('Import finished')
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
