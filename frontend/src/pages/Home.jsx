import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { api } from '../api'
import { STORE_NAME, WHATSAPP_NUMBER } from '../config'
import Carousel from '../components/Carousel'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [sections, setSections] = useState([])
  const [latest, setLatest] = useState([])

  useEffect(() => {
    api('/sections').then(setSections).catch(console.error)
    api('/products?limit=8').then(setLatest).catch(console.error)
  }, [])

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hola, quisiera más información sobre sus productos'
  )}`

  return (
    <main>
      {/* Carrusel */}
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Carousel />
      </div>

      {/* Bienvenida */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-pink-500">
          Moda para mujer
        </p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          ¡Bienvenida a <span className="text-pink-600">{STORE_NAME}</span>!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Descubre nuestros catálogos de ropa para mujer: vestidos, tops y mucho más.
        </p>
        <Link
          to="/catalogos"
          className="mt-8 inline-block rounded-lg bg-pink-600 px-8 py-3 font-semibold text-white transition hover:bg-pink-700"
        >
          Ver catálogos
        </Link>
      </section>

      {/* Categorías */}
      {sections.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-6 text-2xl font-bold">Explora por categoría</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {sections.map((s) => {
              const cover = s.products?.[0]?.images?.[0]
              return (
                <Link
                  key={s.id}
                  to={`/catalogos/${s.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-pink-100"
                >
                  {cover && (
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3 text-lg font-semibold text-white">
                    {s.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Novedades */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Novedades</h2>
            <Link to="/catalogos" className="text-sm text-pink-600 hover:underline">
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                to={`/catalogos/${p.section.slug}/${p.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Llamado a WhatsApp */}
      {WHATSAPP_NUMBER && (
        <section className="bg-pink-600">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center text-white">
            <h2 className="text-2xl font-bold">¿Buscas algo en especial?</h2>
            <p className="max-w-xl text-pink-100">
              Escríbenos y te ayudamos a encontrar lo que necesitas.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-pink-600 transition hover:bg-pink-50"
            >
              <FaWhatsapp className="h-5 w-5" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </section>
      )}
    </main>
  )
}