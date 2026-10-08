import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { api } from '../api'
import { WHATSAPP_NUMBER } from '../config'

const chipClass = (active) =>
  `rounded-lg border px-3 py-1 text-sm transition ${
    active
      ? 'border-pink-600 bg-pink-600 text-white'
      : 'border-gray-300 hover:border-pink-400'
  }`

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selected, setSelected] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setSelected(0)
    setSelectedSize(null)
    setSelectedColor(null)
    api(`/products/${id}`)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-8 text-gray-500">Cargando...</p>
  }

  if (notFound || !product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="mb-4 text-gray-600">No encontramos este producto.</p>
        <Link to="/catalogos" className="text-pink-600 hover:underline">
          ← Volver a catálogos
        </Link>
      </main>
    )
  }

  const images = product.images ?? []
  const sizes = product.sizes ?? []
  const colors = product.colors ?? []

  function buildWhatsAppLink() {
    const lines = [
      `Hola, me interesa este producto: ${product.name} (Bs ${Number(product.price).toFixed(2)})`,
    ]
    if (selectedSize) lines.push(`Talla: ${selectedSize}`)
    if (selectedColor) lines.push(`Color: ${selectedColor}`)
    lines.push(window.location.href)

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to={`/catalogos/${product.section.slug}`}
        className="mb-6 inline-block text-sm text-pink-600 hover:underline"
      >
        ← Volver a {product.section.name}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Galería */}
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
            {images[selected] && (
              <img
                src={images[selected]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setSelected(i)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === selected ? 'border-pink-600' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-2xl text-pink-600">
            Bs {Number(product.price).toFixed(2)}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-gray-600">
              {product.description}
            </p>
          )}

          {sizes.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold">Tallas</h2>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                    className={chipClass(selectedSize === size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold">Colores</h2>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                    className={chipClass(selectedColor === color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {WHATSAPP_NUMBER && (
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
            >
              <FaWhatsapp className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </main>
  )
}