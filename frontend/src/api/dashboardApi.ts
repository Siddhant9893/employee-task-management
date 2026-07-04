import { api } from './axios'
import type { DashboardStats } from '../types/dashboard'

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard')
    return response.data
  },
}
