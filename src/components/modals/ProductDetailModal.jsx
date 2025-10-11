import React, { useEffect, useMemo, useState } from 'react'

export default function ProductDetailModal({ open, onClose, product }) {
  const [activeIdx, setActiveIdx] = useState(0)

  const images = useMemo(() => (Array.isArray(product?.images) ? product.images : []), [product])

  useEffect(() => {
    if (open) setActiveIdx(0)
  }, [open, product])

  if (!open || !product) return null

  const activeImage = images[activeIdx]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">{product.name}</h3>
            <p className="text-xs text-gray-500">Product details</p>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {images.length > 0 ? (
              <div>
                <div className="w-full h-64 md:h-72 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((url, idx) => (
                    <button
                      key={url + idx}
                      onClick={() => setActiveIdx(idx)}
                      className={`border rounded-md overflow-hidden ${idx === activeIdx ? 'ring-2 ring-medium-blue' : ''}`}
                    >
                      <img src={url} alt="thumb" className="h-16 w-16 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 md:h-72 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No images for this product found
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              <div className="font-semibold text-primary">Size</div>
              <div>{product.sizeLiters} L</div>
            </div>
            <div className="text-sm text-gray-700">
              <div className="font-semibold text-primary">Price</div>
              <div>${product.price}</div>
            </div>
            {product.description ? (
              <div className="text-sm text-gray-700">
                <div className="font-semibold text-primary">Description</div>
                <div className="whitespace-pre-wrap">{product.description}</div>
              </div>
            ) : null}
            <div className="text-sm text-gray-700">
              <div className="font-semibold text-primary">Status</div>
              <div>{product.active ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
