import { useState } from 'react'
import { LOGO_SRC, STORE_NAME } from '../config'

export default function Logo({ className = 'h-10', showName = false }) {
  const [failed, setFailed] = useState(false)

  // Si la imagen no existe o no carga, mostramos el nombre en texto
  if (failed) {
    return <span className="text-xl font-bold text-pink-600">{STORE_NAME}</span>
  }

  return (
    <span className="flex items-center gap-2">
      <img
        src={LOGO_SRC}
        alt={STORE_NAME}
        className={`w-auto ${className}`}
        onError={() => setFailed(true)}
      />
      {showName && (
        <span className="text-xl font-bold text-pink-600">{STORE_NAME}</span>
      )}
    </span>
  )
}