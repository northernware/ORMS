import { z } from 'zod'

const currentYear = new Date().getFullYear()

export const resolutionCreateSchema = z.object({
  resolutionNumber: z.string().max(255).min(1, 'Resolution number is required'),
  title: z.string().max(255).min(1, 'Title is required'),
  year: z.coerce.number().int().min(1992).max(currentYear + 1),
  term: z.string().max(50).nullable().optional(),
  who: z.string().nullable().optional(),
  what: z.string().nullable().optional(),
  when: z.coerce.date().nullable().optional(),
  where: z.string().nullable().optional(),
  why: z.string().nullable().optional(),
  how: z.string().nullable().optional(),
  requestedBy: z.string().max(255).nullable().optional(),
  requestReceivedAt: z.coerce.date().nullable().optional(),
  endorsedByMayor: z.coerce.boolean().default(false),
  responsibleDepartmentId: z.coerce.number().int().positive('Department is required'),
  status: z
    .enum(['request_received', 'calendared', 'in_committee', 'for_adoption', 'adopted', 'not_adopted', 'signed', 'inactive'])
    .default('request_received'),
  summary: z.string().nullable().optional(),
})

export const resolutionUpdateSchema = resolutionCreateSchema.partial()

// SB office places the resolution on the Calendar of Business.
export const calendarSchema = z.object({
  sessionDate: z.coerce.date(),
  remarks: z.string().max(1000).nullable().optional(),
})

// Regular session refers the resolution to a standing committee.
export const referralSchema = z.object({
  committeeId: z.coerce.number().int().positive('Committee is required'),
  referredAt: z.coerce.date().nullable().optional(),
})

// Committee report: findings + recommendation, then back on the calendar
// for adoption at the given session.
export const committeeReportSchema = z.object({
  findings: z.string().max(5000).nullable().optional(),
  recommendation: z.string().max(2000).min(1, 'Recommendation is required'),
  hearingHeldAt: z.coerce.date().nullable().optional(),
  sessionDate: z.coerce.date(),
})

// Outcome of the adoption vote by the whole SB membership (the vote itself
// happens on the floor and is not tracked here — only the result).
export const adoptionSchema = z.object({
  outcome: z.enum(['adopted', 'not_adopted']),
  decidedAt: z.coerce.date().nullable().optional(),
  remarks: z.string().max(1000).nullable().optional(),
})

// Mayor signs the adopted resolution; the requester is notified.
export const signatureSchema = z.object({
  signedAt: z.coerce.date().nullable().optional(),
  requesterNotifiedAt: z.coerce.date().nullable().optional(),
})

export type ResolutionCreateInput = z.infer<typeof resolutionCreateSchema>
export type ResolutionUpdateInput = z.infer<typeof resolutionUpdateSchema>
