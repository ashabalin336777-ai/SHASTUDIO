import { prisma } from './prisma'

function truncate(text: string | null | undefined, max = 280) {
  if (!text) return text
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export async function buildSiteContext() {
  const [contextData, profile, experiences, education, courses, projects, certificates, blog] =
    await Promise.all([
      prisma.siteContext.findMany({
        where: { isActive: true },
        select: { section: true, content: true, keywords: true },
      }),
      prisma.profile.findFirst({
        select: {
          fullName: true,
          title: true,
          bio: true,
          location: true,
          email: true,
          phone: true,
          website: true,
          telegram: true,
          max: true,
          github: true,
          linkedin: true,
          mbtiType: true,
          personalTraits: true,
          skills: true,
        },
      }),
      prisma.experience.findMany({
        where: { isActive: true },
        orderBy: [{ startYear: 'desc' }, { startMonth: 'desc' }],
        select: {
          company: true,
          position: true,
          startYear: true,
          startMonth: true,
          endYear: true,
          endMonth: true,
          isCurrent: true,
          city: true,
          country: true,
          remote: true,
          description: true,
          responsibilities: true,
          achievements: true,
          technologies: true,
        },
      }),
      prisma.education.findMany({
        where: { isActive: true },
        select: {
          institution: true,
          degree: true,
          field: true,
          startYear: true,
          endYear: true,
          isCurrent: true,
          description: true,
        },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: {
          title: true,
          provider: true,
          platform: true,
          description: true,
          skills: true,
        },
      }),
      prisma.project.findMany({
        where: { isActive: true },
        select: {
          title: true,
          slug: true,
          description: true,
          category: true,
          tags: true,
          technologies: true,
          featured: true,
          link: true,
          demo: true,
          github: true,
        },
      }),
      prisma.certificate.findMany({
        where: { isActive: true },
        select: {
          title: true,
          issuer: true,
          issueDate: true,
          description: true,
          credentialUrl: true,
        },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { title: true, excerpt: true, tags: true, publishedAt: true },
        take: 10,
      }),
    ])

  const compact = {
    profile: profile
      ? { ...profile, bio: truncate(profile.bio, 500) }
      : null,
    experiences: experiences.map((e) => ({
      ...e,
      description: truncate(e.description),
    })),
    education: education.map((e) => ({
      ...e,
      description: truncate(e.description),
    })),
    courses: courses.map((c) => ({
      ...c,
      description: truncate(c.description),
    })),
    projects: projects.map((p) => ({
      ...p,
      description: truncate(p.description),
    })),
    certificates: certificates.map((c) => ({
      ...c,
      description: truncate(c.description),
    })),
    blog,
    siteContext: contextData.map((c) => ({
      section: c.section,
      keywords: c.keywords,
      content: truncate(c.content, 600),
    })),
  }

  return `
ИНФОРМАЦИЯ О САЙТЕ SHASTUDIO:
${JSON.stringify(compact, null, 2)}

ВАЖНО: Отвечай ТОЛЬКО на основе предоставленной информации.
Если информации нет в контексте, скажи честно: "У меня нет информации об этом".
Не выдумывай факты.
`.trim()
}

export async function callVseLlm(system: string, user: string, maxTokens = 500) {
  const baseUrl = (process.env.VSELLM_BASE_URL || 'https://api.vsellm.ru/v1').replace(/\/$/, '')
  const model = (process.env.VSELLM_MODEL || 'openai/gpt-4o-mini').replace(/[\u2010-\u2015]/g, '-')

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VSELLM_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`VseLLM API error ${response.status}: ${errText}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  return data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ'
}
