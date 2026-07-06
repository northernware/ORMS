// Shared TypeScript types for ORMS

export type Role = 'Administrator' | 'Department_Head' | 'Staff' | 'Vice_Mayor' | 'Mayor'

export type OrdinanceStatus = 'active' | 'inactive'

// Resolution lifecycle:
//   draft → in_hearings → pending_vice_mayor → pending_mayor → active
// Vice Mayor may send back (rejected → resubmittable); a Mayor veto is terminal (vetoed).
export type ResolutionStatus =
  | 'draft'
  | 'in_hearings'
  | 'pending_vice_mayor'
  | 'pending_mayor'
  | 'active'
  | 'inactive'
  | 'rejected'
  | 'vetoed'

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
