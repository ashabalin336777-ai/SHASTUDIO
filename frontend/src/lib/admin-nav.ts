export const ADMIN_LINKS = [
  { href: '/admin', label: 'Обзор', title: 'Админ-панель', desc: 'Сводка разделов' },
  {
    href: '/admin/profile',
    label: 'Профиль',
    title: 'Профиль',
    desc: 'Имя, bio, навыки, MBTI, контакты',
  },
  {
    href: '/admin/experience',
    label: 'Опыт',
    title: 'Опыт',
    desc: 'Работа в формате HeadHunter',
  },
  {
    href: '/admin/education',
    label: 'Образование',
    title: 'Образование',
    desc: 'Учебные заведения и степени',
  },
  {
    href: '/admin/courses',
    label: 'Курсы',
    title: 'Курсы',
    desc: 'Онлайн-курсы и сертификаты обучения',
  },
  {
    href: '/admin/projects',
    label: 'Проекты',
    title: 'Проекты',
    desc: 'Портфолио-кейсы и технологии',
  },
  { href: '/admin/blog', label: 'Блог', title: 'Блог', desc: 'Статьи и публикации' },
  {
    href: '/admin/certificates',
    label: 'Сертификаты',
    title: 'Сертификаты',
    desc: 'Профессиональные сертификаты',
  },
  {
    href: '/admin/contacts',
    label: 'Контакты',
    title: 'Контакты',
    desc: 'Телефон, email, Telegram, Max, сайт',
  },
  {
    href: '/admin/media',
    label: 'Фото разделов',
    title: 'Фото разделов',
    desc: 'Начальное фото и картинки для каждого раздела',
  },
  {
    href: '/admin/generate',
    label: 'AI генерация',
    title: 'AI генерация',
    desc: 'Черновики разделов через VseLLM',
  },
  {
    href: '/admin/account',
    label: 'Аккаунт',
    title: 'Аккаунт',
    desc: 'Смена пароля администратора',
  },
] as const

export const ADMIN_SECTIONS = ADMIN_LINKS.filter((l) => l.href !== '/admin')
