export type Profile = {
  id?: string
  fullName: string
  title?: string
  bio?: string
  avatar?: string
  location?: string
  email?: string
  phone?: string
  website?: string
  telegram?: string
  max?: string
  github?: string
  linkedin?: string
  mbtiType?: string
  personalTraits: string[]
  skills: string[]
}

export type Experience = {
  id?: string
  company: string
  companyLogo?: string
  companyWebsite?: string
  position: string
  department?: string
  startYear: number
  startMonth: number
  endYear?: number
  endMonth?: number
  isCurrent: boolean
  city?: string
  country?: string
  remote: boolean
  description?: string
  responsibilities: string[]
  achievements: string[]
  technologies: string[]
  isActive: boolean
  order: number
}

export type Education = {
  id?: string
  institution: string
  logo?: string
  website?: string
  degree: string
  field?: string
  startYear: number
  startMonth?: number
  endYear?: number
  endMonth?: number
  isCurrent: boolean
  description?: string
  gpa?: string
  certificate?: string
  certificateUrl?: string
  isActive: boolean
  order: number
}

export type Course = {
  id?: string
  title: string
  provider: string
  platform?: string
  startDate?: string
  endDate?: string
  certificate?: string
  certificateUrl?: string
  description?: string
  skills: string[]
  isActive: boolean
  order: number
}

export type Project = {
  id?: string
  title: string
  slug: string
  description?: string
  content?: string
  image?: string
  images: string[]
  category?: string
  tags: string[]
  link?: string
  demo?: string
  github?: string
  technologies: string[]
  isActive: boolean
  featured: boolean
  order: number
}

export type BlogPost = {
  id?: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImage?: string
  tags: string[]
  isPublished: boolean
  publishedAt?: string | null
}

export type Certificate = {
  id?: string
  title: string
  issuer: string
  issuerLogo?: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  image?: string
  description?: string
  isActive: boolean
  order: number
}
