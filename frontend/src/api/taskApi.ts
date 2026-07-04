import { api } from './axios'
import type { AuthUser } from '../features/auth/authTypes'
import type { ApiListResponse, ApiResponse } from '../types/api'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export type Task = {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  startDate: string
  dueDate: string
  assignedToId: string
  createdById: string
  createdAt: string
  updatedAt: string
  assignedTo?: Pick<AuthUser, 'id' | 'fullName' | 'email' | 'role'>
  createdBy?: Pick<AuthUser, 'id' | 'fullName' | 'email' | 'role'>
}

export type TaskPayload = {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  startDate: string
  dueDate: string
  assignedToId: string
}

export type TaskAttachment = {
  id: string
  taskId: string
  fileName: string
  storedPath: string
  mimeType: string
  sizeBytes: number
  uploadedBy: string
  createdAt: string
}

export const taskApi = {
  getTasks: async (): Promise<ApiListResponse<Task>> => {
    const response = await api.get<ApiListResponse<Task>>('/tasks')
    return response.data
  },
  getTaskById: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`)
    return response.data
  },
  createTask: async (payload: TaskPayload): Promise<ApiResponse<Task>> => {
    const response = await api.post<ApiResponse<Task>>('/tasks', payload)
    return response.data
  },
  updateTask: async (
    id: string,
    payload: Partial<TaskPayload>,
  ): Promise<ApiResponse<Task>> => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload)
    return response.data
  },
  deleteTask: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await api.delete<ApiResponse<Task>>(`/tasks/${id}`)
    return response.data
  },
  uploadAttachment: async (
    id: string,
    file: File,
  ): Promise<ApiResponse<TaskAttachment>> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ApiResponse<TaskAttachment>>(
      `/tasks/${id}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    return response.data
  },
}
