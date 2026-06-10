// Shared TypeScript types for ORMS

export type Role = 'Administrator' | 'Department_Head' | 'Staff'

export type OrdinanceStatus = 'active' | 'inactive'

export type ResolutionStatus = 'draft' | 'pending_approval' | 'active' | 'inactive' | 'rejected'

export interface SessionPayload {
  userId: number
  name: string
  email: string
  role: Role
  departmentId: number | null
  expiresAt: Date
}

export interface UserContext {
  id: number
  name: string
  email: string
  role: Role
  departmentId: number | null
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
