const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      // Con FormData el navegador pone el Content-Type correcto
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  // Token vencido o inválido: cerramos sesión
  if (res.status === 401 && token) {
    localStorage.removeItem('token')
    window.location.href = '/admin/login'
    throw new Error('Sesión expirada')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message
    throw new Error(message || 'Error en la petición')
  }
  return res.json()
}