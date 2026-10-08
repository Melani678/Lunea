import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'

const linkClass = ({ isActive }) =>
  isActive ? 'font-semibold text-pink-600' : 'text-gray-600 hover:text-pink-600'

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="flex items-center gap-3">
            <Logo className="h-8" />
            <span className="font-bold text-pink-600">Panel de administración</span>
          </span>
          <div className="flex items-center gap-6 text-sm">
            <NavLink to="/admin/secciones" className={linkClass}>
              Secciones
            </NavLink>
            <NavLink to="/admin/productos" className={linkClass}>
              Productos
            </NavLink>
            <NavLink to="/admin/carrusel" className={linkClass}>
              Carrusel
            </NavLink>
            <Link to="/" className="text-gray-600 hover:text-pink-600">
              Ver tienda
            </Link>
            <button onClick={logout} className="text-gray-600 hover:text-red-600">
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}