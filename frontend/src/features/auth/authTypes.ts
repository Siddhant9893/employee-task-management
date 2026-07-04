export type UserRole = 'ADMIN' | 'EMPLOYEE'

export type AuthUser = {
  id: string
  fullName: string
  email: string
  role: UserRole
  department?: string | null
  designation?: string | null
  createdAt?: string
  updatedAt?: string
}

export type LoginCredentials = {
  email: string
  password: string
  rememberMe?: boolean
}

export type LoginResponse = {
  success: boolean
  user: AuthUser
  token: string
  message?: string
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
  role: UserRole
}

export type RegisterResponse = {
  success: boolean
  user: AuthUser
  message?: string
}

export type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}
