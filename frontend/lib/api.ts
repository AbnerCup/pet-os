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

export async function put(url: string, data: any) {
  return fetcher(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function del(url: string) {
  return fetcher(url, {
    method: 'DELETE',
  })
}

export async function uploadFile(url: string, formData: FormData) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const targetUrl = `${API_URL}${url}`
  console.log('--- Uploading File ---')
  console.log('Target URL:', targetUrl)

  const res = await fetch(targetUrl, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Error desconocido' }))
    console.error('Upload failed body:', errorBody)
    throw new Error(errorBody.error || 'Error al subir archivo')
  }

  const result = await res.json()
  console.log('Upload success:', result)
  return result
}
