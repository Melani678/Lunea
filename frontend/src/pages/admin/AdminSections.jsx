import { useEffect, useState } from 'react'
import { api } from '../../api'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function AdminSections() {
  const [sections, setSections] = useState([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)

  const load = () =>
    api('/sections')
      .then(setSections)
      .catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/sections', {
        method: 'POST',
        body: JSON.stringify({ name: newName, order: sections.length }),
      })
      setNewName('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpdate(id) {
    setError('')
    try {
      await api(`/sections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editingName }),
      })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function confirmDelete() {
     const section = toDelete
     setToDelete(null)
     setError('')
     try {
       await api(`/sections/${section.id}`, { method: 'DELETE' })
       load()
     } catch (err) {
       setError(err.message)
     }
   }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Secciones</h1>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva sección (ej. Vestidos)"
          required
          minLength={2}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none"
        />
        <button className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700">
          Agregar
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="divide-y rounded-xl bg-white shadow-sm">
        {sections.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 p-4">
            {editingId === s.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-1"
                autoFocus
              />
            ) : (
              <span className="font-medium">{s.name}</span>
            )}

            <div className="flex gap-3 text-sm">
              {editingId === s.id ? (
                <>
                  <button
                    onClick={() => handleUpdate(s.id)}
                    className="text-pink-600 hover:underline"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(s.id)
                      setEditingName(s.name)
                    }}
                    className="text-pink-600 hover:underline"
                  >
                    Renombrar
                  </button>
                  <button onClick={() => setToDelete(s)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
        {sections.length === 0 && (
          <li className="p-4 text-gray-500">Aún no hay secciones.</li>
        )}
      </ul>
      {toDelete && (
        <ConfirmDialog
          title="Eliminar sección"
          message={`¿Eliminar "${toDelete.name}"? También se eliminarán todos sus productos. Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}