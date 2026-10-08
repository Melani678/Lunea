import { useEffect, useState } from 'react'
import { api } from '../../api'
import ImageUploader from '../../components/ImageUploader'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function AdminCarousel() {
  const [slides, setSlides] = useState([])
  const [toDelete, setToDelete] = useState(null)
  const [error, setError] = useState('')

  const load = () =>
    api('/slides')
      .then(setSlides)
      .catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  // ImageUploader sube los archivos a Cloudinary y nos entrega las URLs
  async function handleUploaded(urls) {
    setError('')
    try {
      for (const url of urls) {
        await api('/slides', {
          method: 'POST',
          body: JSON.stringify({ imageUrl: url }),
        })
      }
    } catch (err) {
      setError(err.message)
    }
    load()
  }

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= slides.length) return

    const updated = [...slides]
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    setSlides(updated) // se ve el cambio al instante

    try {
      await api('/slides/reorder', {
        method: 'PUT',
        body: JSON.stringify({ ids: updated.map((s) => s.id) }),
      })
    } catch (err) {
      setError(err.message)
      load() // si falla, volvemos al orden real
    }
  }

  async function confirmDelete() {
    const slide = toDelete
    setToDelete(null)
    setError('')
    try {
      await api(`/slides/${slide.id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Carrusel del inicio</h1>
      <p className="mb-6 text-sm text-gray-500">
        Se muestran en este orden. Lo ideal son imágenes horizontales (por ejemplo 1600 × 700 px).
      </p>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium">Agregar imágenes</p>
        {/* images vacío: cada subida se guarda de inmediato como diapositiva nueva */}
        <ImageUploader images={[]} onChange={handleUploaded} />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="divide-y rounded-xl bg-white shadow-sm">
        {slides.map((s, i) => (
          <li key={s.id} className="flex items-center gap-4 p-4">
            <span className="w-6 text-center text-sm text-gray-400">{i + 1}</span>
            <img
              src={s.imageUrl}
              alt=""
              className="aspect-[16/7] w-40 rounded-lg bg-gray-100 object-cover"
            />
            <div className="ml-auto flex gap-3 text-sm">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-pink-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
              >
                ↑ Subir
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === slides.length - 1}
                className="text-pink-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
              >
                ↓ Bajar
              </button>
              <button
                onClick={() => setToDelete(s)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {slides.length === 0 && (
          <li className="p-4 text-gray-500">Aún no hay imágenes en el carrusel.</li>
        )}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title="Quitar imagen"
          message="¿Quitar esta imagen del carrusel? Esta acción no se puede deshacer."
          confirmText="Quitar"
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}