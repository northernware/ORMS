import type { Role, UserContext } from '@/types'

// Ordinance requests come from anyone in the municipality; office staff
// (SB_Staff) and department heads encode them and record the Mayor's
// decision. Department heads are scoped to their own department's requests.
export function canManageOrdinances(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'SB_Staff' || user.role === 'Department_Head'
}

// Mirrors view_all_ordinances in getPermissions: office staff, SB members,
// and both executives see the full ordinance register.
export function canViewAllOrdinances(user: UserContext) {
  return (
    user.role === 'Administrator' ||
    user.role === 'SB_Staff' ||
    user.role === 'SB_Member' ||
    user.role === 'Vice_Mayor' ||
    user.role === 'Mayor'
  )
}

// SB office staff encode resolutions end to end — intake, calendaring,
// referral, committee reports, adoption outcomes, and the Mayor's signature.
// Everyone else (SB members, Vice Mayor, Mayor, departments) only views.
export function canManageResolutions(user: UserContext) {
  return user.role === 'Administrator' || user.role === 'SB_Staff'
}

export function canRecordResolutionFlow(user: UserContext) {
  return canManageResolutions(user)
}

// All SB members and SB office employees must see every resolution;
// the Vice Mayor and Mayor likewise view everything.
export function canViewAllResolutions(user: UserContext) {
  return (
    user.role === 'Administrator' ||
    user.role === 'SB_Staff' ||
    user.role === 'SB_Member' ||
    user.role === 'Vice_Mayor' ||
    user.role === 'Mayor'
  )
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
        'delete_resolutions', 'record_resolution_flow', 'manage_documents', 'approve_documents',
        'view_audit_logs', 'manage_users', 'manage_departments',
      ]
    case 'SB_Staff':
      return [
        'view_all_resolutions', 'create_resolutions', 'edit_resolutions',
        'record_resolution_flow', 'manage_documents', 'view_all_ordinances',
        'create_ordinances', 'edit_ordinances', 'record_ordinance_decision',
      ]
    case 'SB_Member':
    case 'Vice_Mayor':
    case 'Mayor':
      return ['view_all_resolutions', 'view_all_ordinances']
    case 'Department_Head':
      return [
        'view_department_ordinances', 'create_ordinances', 'edit_ordinances',
        'view_department_resolutions', 'manage_documents', 'view_department_audit_logs',
      ]
    default:
      return ['view_own_ordinances', 'view_own_resolutions', 'upload_documents']
  }
}
