'use client'

import { useState } from 'react'
import type { Product, Protocol } from '@/types'
import { INIModal } from './INIModal'

interface CatalogCardProps {
  item: Product | Protocol
  type: 'product' | 'protocol'
}

function isProduct(item: Product | Protocol): item is Product {
  return 'sku' in item && 'category' in item
}

export function CatalogCard({ item, type }: CatalogCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const product = isProduct(item) ? item : null
  const protocol = !isProduct(item) ? item : null

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="glass p-6 rounded-lg hover:border-emerald-500 transition-all transform hover:scale-105 text-left h-full flex flex-col justify-between"
      >
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-serif text-lg font-bold text-slate-100">
              {product?.name || protocol?.name}
            </h3>
            {product && (
              <span className="text-xs bg-emerald-600 px-2 py-1 rounded text-slate-900 font-semibold">
                {product.category}
              </span>
            )}
            {protocol && (
              <span className="text-xs bg-slate-700 px-2 py-1 rounded text-emerald-400 font-semibold">
                {protocol.name === 'Complete' && '★'}
                {protocol.name === 'Reconstruct' && '⚕'}
                {protocol.name === 'Define' && '✓'}
                {protocol.name === 'Origin' && '◆'}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-emerald-400">
              R$ {type === 'product' ? product?.price?.toFixed(2) : protocol?.price?.toFixed(2)}
            </p>
            {protocol && protocol.original_price > protocol.price && (
              <p className="text-sm text-slate-400 line-through">
                R$ {protocol.original_price.toFixed(2)}
              </p>
            )}
          </div>

          {/* INCI Preview */}
          {product && (
            <p className="text-xs text-slate-400 mb-3 line-clamp-2">
              {product.inci}
            </p>
          )}
          {protocol && (
            <p className="text-sm text-slate-300 mb-3 italic">
              {protocol.narrative}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsModalOpen(true)
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 py-2 px-3 rounded text-sm transition"
          >
            Ver Detalhes
          </button>
          {type === 'protocol' && (
            <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold py-2 px-3 rounded text-sm transition">
              Adicionar
            </button>
          )}
        </div>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <INIModal
          item={item}
          type={type}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
