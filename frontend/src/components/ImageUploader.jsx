import { useRef, useState } from 'react'
import { api } from '../api'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB, igual que el límite del backend

export default function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(null) // null = sin subida | { done, total }
  const [error, setError] = useState('')

  const uploading = progress !== null

  async function uploadFiles(fileList) {
    const all = Array.from(fileList)
    const valid = all.filter(
      (f) => f.type.startsWith('image/') && f.size <= MAX_SIZE
    )
    const skipped = all.length - valid.length

    setError(
      skipped > 0
        ? `${skipped} archivo(s) omitido(s): solo se aceptan imágenes de hasta 5 MB`
        : ''
    )
    if (valid.length === 0) return

    const urls = []
    setProgress({ done: 0, total: valid.length })
    try {
      for (const file of valid) {
        const formData = new FormData()
        formData.append('file', file)
        const { url } = await api('/uploads', { method: 'POST', body: formData })
        urls.push(url)
        setProgress({ done: urls.length, total: valid.length })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setProgress(null)
      // Las que ya se subieron se conservan aunque otra falle
      if (urls.length > 0) onChange([...images, ...urls])
    }
  }

  function handleInput(e) {
    uploadFiles(e.target.files)
    e.target.value = '' // permite elegir el mismo archivo otra vez
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (!uploading) uploadFiles(e.dataTransfer.files)
  }

  function handleDragOver(e) {
    e.preventDefault()
    if (!uploading) setDragging(true)
  }

  function handleDragLeave(e) {
    // Evita el parpadeo al pasar sobre los elementos internos del recuadro
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
  }

  function openPicker() {
    if (!uploading) inputRef.current.click()
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative h-24 w-20 overflow-hidden rounded-lg bg-gray-100"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                disabled={uploading}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                aria-label="Quitar imagen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus:outline-none focus:ring-2 focus:ring-pink-300 ${
          dragging
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50'
        } ${uploading ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mb-2 h-8 w-8 text-pink-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          />
        </svg>

        {uploading ? (
          <p className="text-sm font-medium text-gray-700">
            Subiendo {Math.min(progress.done + 1, progress.total)} de {progress.total}...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">
              {dragging ? 'Suelta las imágenes aquí' : 'Arrastra tus imágenes aquí'}
            </p>
            <p className="text-sm text-gray-500">o haz clic para seleccionarlas</p>
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG o WEBP · máximo 5 MB cada una
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInput}
        className="hidden"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}