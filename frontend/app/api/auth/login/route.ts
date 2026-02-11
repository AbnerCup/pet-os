import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.error || 'Error en la petición' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en login API route:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}