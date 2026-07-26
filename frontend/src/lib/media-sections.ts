export const MEDIA_SECTIONS = [
  { key: 'hero', label: 'Начальное фото (Обзор)', href: '/' },
  { key: 'profile', label: 'Профиль', href: '/profile' },
  { key: 'experience', label: 'Опыт', href: '/experience' },
  { key: 'education', label: 'Образование', href: '/education' },
  { key: 'courses', label: 'Курсы', href: '/courses' },
  { key: 'projects', label: 'Проекты', href: '/projects' },
  { key: 'blog', label: 'Блог', href: '/blog' },
  { key: 'certificates', label: 'Сертификаты', href: '/certificates' },
  { key: 'contacts', label: 'Контакты', href: '/contacts' },
  { key: 'assistant', label: 'AI Помощник', href: '/assistant' },
] as const

export type MediaSectionKey = (typeof MEDIA_SECTIONS)[number]['key']

export function hrefToMediaKey(href: string): MediaSectionKey | null {
  if (href === '/') return 'hero'
  const found = MEDIA_SECTIONS.find((s) => s.href === href)
  return found?.key ?? null
}
