export const MEDIA_SECTIONS = [
  { key: 'hero', label: 'Начальное фото (Обзор)', path: '/' },
  { key: 'profile', label: 'Профиль', path: '/profile' },
  { key: 'experience', label: 'Опыт', path: '/experience' },
  { key: 'education', label: 'Образование', path: '/education' },
  { key: 'courses', label: 'Курсы', path: '/courses' },
  { key: 'projects', label: 'Проекты', path: '/projects' },
  { key: 'blog', label: 'Блог', path: '/blog' },
  { key: 'certificates', label: 'Сертификаты', path: '/certificates' },
  { key: 'contacts', label: 'Контакты', path: '/contacts' },
  { key: 'assistant', label: 'AI Помощник', path: '/assistant' },
] as const

export type MediaSectionKey = (typeof MEDIA_SECTIONS)[number]['key']

export function isMediaSection(value: string): value is MediaSectionKey {
  return MEDIA_SECTIONS.some((s) => s.key === value)
}
