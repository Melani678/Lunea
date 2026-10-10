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
        <nav className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:py-4">
          {/* Fila 1: logo + título (y "Salir" solo en celular) */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Logo className="h-8" />
              <span className="font-bold text-pink-600">
                <span className="hidden sm:inline">Panel de administración</span>
                <span className="sm:hidden">Panel</span>
              </span>
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-red-600 md:hidden"
            >
              Salir
            </button>
          </div>

          {/* Fila 2: enlaces (si no caben, pasan a otra línea) */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm md:gap-6">
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
            <button
              onClick={logout}
              className="hidden text-gray-600 hover:text-red-600 md:block"
            >
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