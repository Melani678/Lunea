import { useState } from 'react'
import { api } from '../api'
import ImageUploader from './ImageUploader'

const toList = (text) =>
  text.split(',').map((t) => t.trim()).filter(Boolean)

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none'

export default function ProductForm({ product, sections, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    sectionId: product?.sectionId ?? sections[0]?.id ?? '',
    sizes: (product?.sizes ?? []).join(', '),
    colors: (product?.colors ?? []).join(', '),
  })
  const [images, setImages] = useState(product?.images ?? [])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (images.length === 0) {
      setError('Sube al menos una imagen')
      return
    }

    setSaving(true)
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sectionId: Number(form.sectionId),
      sizes: toList(form.sizes),
      colors: toList(form.colors),
      images,
    }

    try {
      await api(product ? `/products/${product.id}` : '/products', {
        method: product ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      })
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">
        {product ? 'Editar producto' : 'Nuevo producto'}
      </h2>

      <label className="block text-sm font-medium">
        Nombre
        <input value={form.name} onChange={set('name')} required minLength={2} className={`${inputClass} mt-1`} />
      </label>

      <label className="block text-sm font-medium">
        Descripción
        <textarea value={form.description} onChange={set('description')} rows={3} className={`${inputClass} mt-1`} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Precio (Bs)
          <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm font-medium">
          Sección
          <select value={form.sectionId} onChange={set('sectionId')} required className={`${inputClass} mt-1`}>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium">
        Tallas (separadas por coma)
        <input value={form.sizes} onChange={set('sizes')} placeholder="S, M, L" className={`${inputClass} mt-1`} />
      </label>

      <label className="block text-sm font-medium">
        Colores (separados por coma)
        <input value={form.colors} onChange={set('colors')} placeholder="Rojo, Negro" className={`${inputClass} mt-1`} />
      </label>

      <div className="text-sm font-medium">
        Imágenes
        <div className="mt-1 font-normal">
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
          Cancelar
        </button>
        <button disabled={saving} className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}