import type { Role, UserContext } from '@/types'

export function canManageOrdinances(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'Department_Head'
}

// Authoring resolutions is separate from approving them — Vice Mayor / Mayor are approvers only.
export function canManageResolutions(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'Department_Head'
}

export function canApproveResolutions(user: UserContext) {
  return user.role === 'Administrator'
}

// Recording hearings/readings is handled by the Sanggunian secretariat.
export function canRecordHearings(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'Department_Head'
}

// First approval gate — Vice Mayor (presiding officer). Administrator may act as a fallback.
export function canViceMayorApprove(user: UserContext) {
  return user.role === 'Vice_Mayor' || user.role === 'Administrator'
}

// Final approval gate — Mayor (local chief executive). Administrator may act as a fallback.
export function canMayorApprove(user: UserContext) {
  return user.role === 'Mayor' || user.role === 'Administrator'
}

export function canViewAllDepartments(user: UserContext) {
  return user.role === 'Administrator'
}

export function canManageUsers(user: UserContext) {
  return user.role === 'Administrator'
}

export function canViewAuditLogs(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'Department_Head'
}

export function getPermissions(user: UserContext): string[] {
  switch (user.role) {
    case 'Administrator':
      return [
        'view_all_ordinances', 'create_ordinances', 'edit_ordinances', 'delete_ordinances',
        'approve_ordinances', 'view_all_resolutions', 'create_resolutions', 'edit_resolutions',
        'delete_resolutions', 'approve_resolutions', 'manage_documents', 'approve_documents',
        'view_audit_logs', 'manage_users', 'manage_departments',
      ]
    case 'Department_Head':
      return [
        'view_department_ordinances', 'create_ordinances', 'edit_ordinances',
        'view_department_resolutions', 'create_resolutions', 'edit_resolutions',
        'submit_resolutions', 'record_hearings',
        'manage_documents', 'view_department_audit_logs',
      ]
    case 'Vice_Mayor':
      return [
        'view_all_resolutions', 'vice_mayor_approve_resolutions', 'vice_mayor_reject_resolutions',
        'view_all_ordinances',
      ]
    case 'Mayor':
      return [
        'view_all_resolutions', 'mayor_approve_resolutions', 'mayor_veto_resolutions',
        'view_all_ordinances',
      ]
    default:
      return ['view_own_ordinances', 'view_own_resolutions', 'upload_documents']
  }
}
