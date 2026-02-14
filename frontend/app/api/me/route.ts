import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/api/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error || 'Error en la petición' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en me API route:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}