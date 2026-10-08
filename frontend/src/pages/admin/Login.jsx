import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../api'
import Logo from '../../components/Logo'


export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    localStorage.removeItem('token')
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('token', data.access_token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow-sm"
      >
        <div className="flex justify-center">
          <Logo className="h-14" />
        </div>
        <h1 className="text-center text-2xl font-bold text-pink-600">
          Acceso administrador
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="w-full rounded-lg bg-pink-600 py-2 font-semibold text-white hover:bg-pink-700">
          Entrar
        </button>
        <Link
          to="/"
          className="block text-center text-sm text-gray-500 hover:text-pink-600"
        >
          ← Volver a la tienda
        </Link>
      </form>
    </main>
  )
}