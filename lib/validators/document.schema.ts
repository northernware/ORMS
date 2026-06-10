import { z } from 'zod'

export const documentUploadSchema = z.object({
  title: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  documentType: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  departmentId: z.coerce.number().int().positive().nullable().optional(),
  ordinanceId: z.coerce.number().int().positive().nullable().optional(),
  resolutionId: z.coerce.number().int().positive().nullable().optional(),
  parentDocumentId: z.coerce.number().int().positive().nullable().optional(),
})

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
