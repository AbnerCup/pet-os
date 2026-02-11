import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'pets')

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const petId = formData.get('petId') as string

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    if (!petId) {
      return NextResponse.json({ error: 'No se proporcionó ID de mascota' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const filename = `${petId}_${timestamp}_${randomString}.${file.type.split('/')[1]}`
    const filepath = join(UPLOAD_DIR, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filepath, buffer)

    // Return the URL that can be used to access the image
    const imageUrl = `/uploads/pets/${filename}`

    return NextResponse.json({ 
      success: true, 
      filename,
      imageUrl 
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}