import { Link } from 'react-router-dom'

export default function ProductCard({ product, to }) {
  return (
    <Link to={to} className="block">
      <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
        <div className="aspect-[3/4] bg-gray-100">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="mt-1 text-pink-600">
            Bs {Number(product.price).toFixed(2)}
          </p>
        </div>
      </article>
    </Link>
  )
}