import { z } from 'zod'

const currentYear = new Date().getFullYear()

export const resolutionCreateSchema = z.object({
  resolutionNumber: z.string().max(255).min(1, 'Resolution number is required'),
  title: z.string().max(255).min(1, 'Title is required'),
  year: z.coerce.number().int().min(1992).max(currentYear + 1),
  who: z.string().nullable().optional(),
  what: z.string().nullable().optional(),
  when: z.coerce.date().nullable().optional(),
  where: z.string().nullable().optional(),
  why: z.string().nullable().optional(),
  how: z.string().nullable().optional(),
  approvingBody: z.string().max(255).nullable().optional(),
  responsibleDepartmentId: z.coerce.number().int().positive('Department is required'),
  status: z
    .enum(['draft', 'in_hearings', 'pending_vice_mayor', 'pending_mayor', 'active', 'inactive', 'rejected', 'vetoed'])
    .default('draft'),
  summary: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
})

export const resolutionUpdateSchema = resolutionCreateSchema.partial()

// Recording a hearing (reading) during the in_hearings stage.
export const hearingCreateSchema = z.object({
  heldAt: z.coerce.date().nullable().optional(),
  minutes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

// Rejection / veto reason supplied by Vice Mayor or Mayor.
export const decisionSchema = z.object({
  reason: z.string().max(1000).nullable().optional(),
})

export type ResolutionCreateInput = z.infer<typeof resolutionCreateSchema>
export type ResolutionUpdateInput = z.infer<typeof resolutionUpdateSchema>
export type HearingCreateInput = z.infer<typeof hearingCreateSchema>
