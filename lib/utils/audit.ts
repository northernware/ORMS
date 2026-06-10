import { prisma } from '@/lib/db'

export interface AuditEntry {
  userId?: number
  action: string
  tableName: string
  recordId: number
  oldValues?: Record<string, unknown> | string
  newValues?: Record<string, unknown> | string
  ipAddress?: string
  userAgent?: string
}

export async function logAudit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        tableName: entry.tableName,
        recordId: entry.recordId,
        oldValues: entry.oldValues ? (typeof entry.oldValues === 'string' ? entry.oldValues : JSON.stringify(entry.oldValues)) : undefined,
        newValues: entry.newValues ? (typeof entry.newValues === 'string' ? entry.newValues : JSON.stringify(entry.newValues)) : undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
