// Shared TypeScript types for ORMS

// SB_Staff: SB office employees — they encode everything.
// SB_Member, Vice_Mayor, Mayor: view all resolutions; decisions happen on
// the session floor and are only recorded in the system by SB staff.
export type Role =
  | 'Administrator'
  | 'SB_Staff'
  | 'SB_Member'
  | 'Department_Head'
  | 'Staff'
  | 'Vice_Mayor'
  | 'Mayor'

export type OrdinanceStatus = 'active' | 'inactive'

// Resolution lifecycle (real Sangguniang Bayan process):
//   request_received — request from another office, usually endorsed by the
//                      Mayor's Office with a letter
//   calendared       — SB office placed it on the Calendar of Business
//   in_committee     — referred in regular session to a standing committee
//   for_adoption     — committee report submitted; back on the calendar
//   adopted          — approved by the whole SB membership in regular session
//   not_adopted      — declined by the SB (terminal)
//   signed           — Mayor signed; requester notified
export type ResolutionStatus =
  | 'request_received'
  | 'calendared'
  | 'in_committee'
  | 'for_adoption'
  | 'adopted'
  | 'not_adopted'
  | 'signed'
  | 'inactive'

export type CommitteePosition = 'Chairman' | 'Vice_Chairman' | 'Member'

export type CalendarPurpose = 'referral' | 'adoption'

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
