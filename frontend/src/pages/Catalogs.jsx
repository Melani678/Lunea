import { useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
    isActive
      ? 'bg-pink-600 text-white'
      : 'bg-white text-gray-700 hover:bg-pink-50'
  }`

export default function Catalogs() {
  const { slug } = useParams()
  const [sections, setSections] = useState([])
  const [section, setSection] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar las secciones del menú
  useEffect(() => {
    api('/sections')
      .then(setSections)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Si no hay slug en la URL, usamos la primera sección
  const current = slug || sections[0]?.slug

  // Cargar los productos de la sección actual
  useEffect(() => {
    if (!current) return
    setLoading(true)
    api(`/sections/${current}`)
      .then(setSection)
      .catch(() => setSection(null))
      .finally(() => setLoading(false))
  }, [current])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Catálogos</h1>

      {/* Menú de secciones */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {sections.map((s) => (
          <NavLink
            key={s.id}
            to={`/catalogos/${s.slug}`}
            className={() => linkClass({ isActive: s.slug === current })}
          >
            {s.name}
          </NavLink>
        ))}
      </div>

      {/* Contenido */}
      {loading && <p className="text-gray-500">Cargando...</p>}

      {!loading && sections.length === 0 && (
        <p className="text-gray-500">Aún no hay secciones disponibles.</p>
      )}

      {!loading && section && section.products.length === 0 && (
        <p className="text-gray-500">Esta sección todavía no tiene productos.</p>
      )}

      {!loading && section && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {section.products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              to={`/catalogos/${section.slug}/${p.id}`}
            />
          ))}
        </div>
      )}
    </main>
  )
}