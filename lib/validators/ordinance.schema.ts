import { z } from 'zod'

const currentYear = new Date().getFullYear()

export const ordinanceCreateSchema = z.object({
  ordinanceNumber: z.string().max(255).min(1, 'Ordinance number is required'),
  title: z.string().max(255).min(1, 'Title is required'),
  year: z.coerce.number().int().min(1992).max(currentYear + 1),
  who: z.string().nullable().optional(),
  what: z.string().nullable().optional(),
  when: z.coerce.date().nullable().optional(),
  where: z.string().nullable().optional(),
  why: z.string().nullable().optional(),
  how: z.string().nullable().optional(),
  approvalAuthority: z.string().max(255).nullable().optional(),
  departmentId: z.coerce.number().int().positive('Department is required'),
  status: z.enum(['active', 'inactive']).default('active'),
  summary: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const ordinanceUpdateSchema = ordinanceCreateSchema.partial()

export type OrdinanceCreateInput = z.infer<typeof ordinanceCreateSchema>
export type OrdinanceUpdateInput = z.infer<typeof ordinanceUpdateSchema>
