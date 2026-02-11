const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function fetcher(url: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error en la petición')
  }

  return res.json()
}

export async function post(url: string, data: any) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
