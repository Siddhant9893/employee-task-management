export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string | null
}

export type ApiListResponse<T> = {
  success: boolean
  message?: string
  data: T[]
  meta?: PaginationMeta
}
