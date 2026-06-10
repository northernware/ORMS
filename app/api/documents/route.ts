import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { DocumentService } from '@/lib/services/document.service'
import { documentUploadSchema } from '@/lib/validators/document.schema'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Simplified list endpoint for documents
  return NextResponse.json({ data: [] })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 422 })
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads'
    await fs.mkdir(uploadDir, { recursive: true })

    const fileExtension = path.extname(file.name)
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(filePath, buffer)

    const parsedData = documentUploadSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      documentType: formData.get('documentType'),
      remarks: formData.get('remarks'),
      departmentId: formData.get('departmentId'),
      ordinanceId: formData.get('ordinanceId'),
      resolutionId: formData.get('resolutionId'),
      parentDocumentId: formData.get('parentDocumentId'),
    })

    if (!parsedData.success) {
      // Clean up file if validation fails
      await fs.unlink(filePath)
      return NextResponse.json({ errors: parsedData.error.flatten().fieldErrors }, { status: 422 })
    }

    const document = await DocumentService.upload({
      ...parsedData.data,
      filename: file.name,
      filePath: fileName,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: session.id,
    })

    return NextResponse.json({ data: document, message: 'Document uploaded successfully.' }, { status: 201 })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Server error during upload.' }, { status: 500 })
  }
}
