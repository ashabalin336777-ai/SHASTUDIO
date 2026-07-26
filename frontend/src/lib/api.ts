const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const TOKEN_KEY = 'shastudio_token'

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    let message = text || `Request failed: ${res.status}`
    try {
      const json = JSON.parse(text) as { error?: string }
      if (json.error) message = json.error
    } catch {
      // keep raw text
    }

    if (res.status === 401 && typeof window !== 'undefined') {
      clearToken()
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`
      }
    }

    throw new ApiError(res.status, message)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: async <T>(path: string, file: File, fieldName = 'file') => {
    const token = getToken()
    const form = new FormData()
    form.append(fieldName, file)
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const text = await res.text()
      let message = text || `Request failed: ${res.status}`
      try {
        const json = JSON.parse(text) as { error?: string }
        if (json.error) message = json.error
      } catch {
        // keep raw text
      }
      throw new ApiError(res.status, message)
    }
    return res.json() as Promise<T>
  },
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return null
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export { API_URL }
