import type { Role, UserContext } from '@/types'

export function canManageOrdinances(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'Department_Head'
}

export function canApproveResolutions(user: UserContext) {
  return user.role === 'Administrator'
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
        'manage_documents', 'view_department_audit_logs',
      ]
    default:
      return ['view_own_ordinances', 'view_own_resolutions', 'upload_documents']
  }
}
