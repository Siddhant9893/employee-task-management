import type { AuthUser } from '../features/auth/authTypes'

const AUTH_STORAGE_KEY = 'employee_task_management_auth'

type PersistedAuth = {
  user: AuthUser
  token: string
}

const canUseStorage = () => typeof window !== 'undefined'

const parseAuth = (value: string | null): PersistedAuth | null => {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as PersistedAuth
    return parsed?.token && parsed?.user ? parsed : null
  } catch {
    return null
  }
}

export const getPersistedAuth = (): PersistedAuth | null => {
  if (!canUseStorage()) {
    return null
  }

  return (
    parseAuth(window.localStorage.getItem(AUTH_STORAGE_KEY)) ??
    parseAuth(window.sessionStorage.getItem(AUTH_STORAGE_KEY))
  )
}

export const getPersistedToken = () => getPersistedAuth()?.token ?? null

export const persistAuth = (
  auth: PersistedAuth,
  rememberMe: boolean,
): void => {
  if (!canUseStorage()) {
    return
  }

  const targetStorage = rememberMe ? window.localStorage : window.sessionStorage
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage

  otherStorage.removeItem(AUTH_STORAGE_KEY)
  targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export const clearPersistedAuth = (): void => {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
}
