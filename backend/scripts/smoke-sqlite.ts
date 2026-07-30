import { prisma } from '../src/lib/prisma'

async function main() {
  const ok = await prisma.$queryRaw`SELECT 1 as ok`
  console.log('sqlite ok', ok)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
