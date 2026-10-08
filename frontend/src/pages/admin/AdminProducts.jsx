import { useEffect, useState } from 'react'
import { api } from '../../api'
import ProductForm from '../../components/ProductForm'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function AdminProducts() {
  const [sections, setSections] = useState([])
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('')
  const [modal, setModal] = useState(null) // null = cerrado | { product: null } = nuevo | { product } = editar
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)

  useEffect(() => {
    api('/sections')
      .then(setSections)
      .catch((err) => setError(err.message))
  }, [])

  const loadProducts = () =>
    api(`/products${filter ? `?sectionId=${filter}` : ''}`)
      .then(setProducts)
      .catch((err) => setError(err.message))

  useEffect(() => {
    loadProducts()
  }, [filter])

     async function confirmDelete() {
        const product = toDelete
        setToDelete(null)
        setError('')
        try {
        await api(`/products/${product.id}`, { method: 'DELETE' })
        loadProducts()
        } catch (err) {
        setError(err.message)
        }
    }

  function handleSaved() {
    setModal(null)
    loadProducts()
  }

  const sectionName = (id) => sections.find((s) => s.id === id)?.name

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Todas las secciones</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button
            onClick={() => setModal({ product: null })}
            disabled={sections.length === 0}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
          >
            Nuevo producto
          </button>
        </div>
      </div>

      {sections.length === 0 && (
        <p className="mb-4 text-sm text-gray-500">
          Primero crea una sección para poder agregar productos.
        </p>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="divide-y rounded-xl bg-white shadow-sm">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
              {p.images?.[0] && (
                <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                {sectionName(p.sectionId)} · Bs {Number(p.price).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => setModal({ product: p })} className="text-pink-600 hover:underline">
                Editar
              </button>
              <button onClick={() => setToDelete(p)} className="text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
          </li>
        ))}
        {products.length === 0 && (
          <li className="p-4 text-gray-500">No hay productos.</li>
        )}
      </ul>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
            <ProductForm
              product={modal.product}
              sections={sections}
              onSaved={handleSaved}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}
      {toDelete && (
            <ConfirmDialog
            title="Eliminar producto"
            message={`¿Seguro que quieres eliminar "${toDelete.name}"? Esta acción no se puede deshacer.`}
            onConfirm={confirmDelete}
            onCancel={() => setToDelete(null)}
            />
        )}
    </div>
  )
}