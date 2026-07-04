import { api } from './axios'
import type { ApiListResponse, ApiResponse } from '../types/api'
import type { TaskStatus } from './taskApi'

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_DUE'
  | 'TASK_COMPLETED'

export type Notification = {
  id: string
  type: NotificationType
  message: string
  isRead: boolean
  userId: string
  taskId?: string | null
  createdAt: string
  task?: {
    id: string
    title: string
    status: TaskStatus
    dueDate: string
  } | null
}

export const notificationApi = {
  getNotifications: async (): Promise<ApiListResponse<Notification>> => {
    const response =
      await api.get<ApiListResponse<Notification>>('/notifications')
    return response.data
  },
  markRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await api.put<ApiResponse<Notification>>(
      `/notifications/${id}/read`,
    )
    return response.data
  },
}
