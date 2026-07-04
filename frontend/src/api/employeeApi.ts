import { api } from './axios'
import type { AuthUser } from '../features/auth/authTypes'
import type { ApiListResponse, ApiResponse } from '../types/api'

export type Employee = AuthUser

export type EmployeePayload = {
  fullName: string
  email: string
  password?: string
  department: string
  designation: string
}

export type EmployeeQueryParams = {
  page: number
  limit: number
  search?: string
  sortBy?: 'fullName' | 'email' | 'department' | 'designation' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export const employeeApi = {
  getEmployees: async (
    params?: EmployeeQueryParams,
  ): Promise<ApiListResponse<Employee>> => {
    const response = await api.get<ApiListResponse<Employee>>('/employees', {
      params,
    })
    return response.data
  },
  getEmployeeById: async (id: string): Promise<ApiResponse<Employee>> => {
    const response = await api.get<ApiResponse<Employee>>(`/employees/${id}`)
    return response.data
  },
  createEmployee: async (
    payload: EmployeePayload,
  ): Promise<ApiResponse<Employee>> => {
    const response = await api.post<ApiResponse<Employee>>('/employees', payload)
    return response.data
  },
  updateEmployee: async (
    id: string,
    payload: Partial<EmployeePayload>,
  ): Promise<ApiResponse<Employee>> => {
    const response = await api.put<ApiResponse<Employee>>(
      `/employees/${id}`,
      payload,
    )
    return response.data
  },
  deleteEmployee: async (id: string): Promise<ApiResponse<Employee>> => {
    const response = await api.delete<ApiResponse<Employee>>(`/employees/${id}`)
    return response.data
  },
}
