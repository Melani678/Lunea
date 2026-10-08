import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Carousel() {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    api('/slides').then(setSlides).catch(console.error)
  }, [])

  // Avance automático cada 5 segundos (se pausa al pasar el mouse)
  useEffect(() => {
    if (slides.length < 2 || paused) return
    const timer = setTimeout(
      () => setCurrent((c) => (c + 1) % slides.length),
      5000
    )
    return () => clearTimeout(timer)
  }, [current, slides.length, paused])

  if (slides.length === 0) return null

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent((c) => (c + 1) % slides.length)

  return (
    <section
      className="relative overflow-hidden rounded-xl bg-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((s) => (
          <img
            key={s.id}
            src={s.imageUrl}
            alt=""
            className="aspect-[16/7] w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-xl hover:bg-white"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-xl hover:bg-white"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`Ir a la imagen ${i + 1}`}
                className={`h-2 w-2 rounded-full ${
                  i === current ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}