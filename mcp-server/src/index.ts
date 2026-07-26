// @ts-nocheck
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function api(pathname: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${API_URL}${pathname}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`)
  }
  return res.json()
}

function text(payload: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
  }
}

const server = new McpServer({
  name: 'shastudio-mcp',
  version: '0.1.0',
})

server.tool('get_portfolio_context', 'Получить профиль, опыт и проекты ShaStudio', async () => {
  const [profile, experiences, projects, education] = await Promise.all([
    api('/api/profile'),
    api('/api/experience'),
    api('/api/projects'),
    api('/api/education'),
  ])
  return text({ profile, experiences, projects, education })
})

server.tool('list_site_context', 'Список сохранённых AI-контекстов разделов', async () => {
  return text(await api('/api/context'))
})

server.tool(
  'generate_section',
  {
    section: z.string().describe('Имя раздела'),
    prompt: z.string().describe('Инструкция для генерации'),
  },
  async ({ section, prompt }) =>
    text(
      await api('/api/context/generate', {
        method: 'POST',
        body: JSON.stringify({ section, prompt }),
      })
    )
)

server.tool(
  'create_project_draft',
  {
    title: z.string().describe('Название проекта'),
    description: z.string().describe('Описание'),
    technologies: z.array(z.string()).optional().describe('Технологии'),
  },
  async ({ title, description, technologies }) => {
    const tech = technologies ?? []
    const slug =
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `project-${Date.now()}`

    return text(
      await api('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug,
          description,
          technologies: tech,
          tags: [],
          images: [],
          isActive: true,
          featured: false,
          order: 0,
        }),
      })
    )
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[shastudio-mcp] ready')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
