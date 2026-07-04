import { api } from './axios'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../features/auth/authTypes'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', payload)
    return response.data
  },
}
