import { Link, NavLink } from 'react-router-dom'
import { STORE_NAME } from '../config'
import Logo from './Logo'

const linkClass = ({ isActive }) =>
  isActive ? 'font-semibold text-pink-600' : 'text-gray-600 hover:text-pink-600'

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" aria-label={STORE_NAME}>
          <Logo className="h-18" />
        </Link>
        <div className="flex gap-6">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/catalogos" className={linkClass}>
            Catálogos
          </NavLink>
          {localStorage.getItem('token') && (
            <NavLink to="/admin" className={linkClass}>
              Panel
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}