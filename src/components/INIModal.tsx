'use client'

import { useEffect } from 'react'
import type { Product, Protocol } from '@/types'

interface INIModalProps {
  item: Product | Protocol
  type: 'product' | 'protocol'
  onClose: () => void
}

function isProduct(item: Product | Protocol): item is Product {
  return 'sku' in item && 'category' in item
}

export function INIModal({ item, type, onClose }: INIModalProps) {
  const product = isProduct(item) ? item : null
  const protocol = !isProduct(item) ? item : null

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-slate-100 mb-2">
              {product?.name || protocol?.name}
            </h2>
            {product && (
              <p className="text-slate-400">
                SKU: <code className="text-emerald-400">{product.sku}</code>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {product && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                INCI Nomenclatura
              </h3>
              <p className="text-slate-200 leading-relaxed font-mono text-sm">
                {product.inci}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                Ingredientes Ativos
              </h3>
              <div className="grid gap-3">
                {Object.entries(product.active_ingredients).map(([key, value]) => (
                  <div key={key} className="bg-slate-800 p-3 rounded">
                    <p className="text-emerald-400 font-semibold capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-slate-300 text-sm">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <div className="flex-1">
                <p className="text-slate-400 text-sm">Preço</p>
                <p className="text-2xl font-bold text-emerald-400">
                  R$ {product.price.toFixed(2)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-slate-400 text-sm">Categoria</p>
                <p className="text-lg font-semibold text-slate-100">
                  {product.category}
                </p>
              </div>
            </div>
          </div>
        )}

        {protocol && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                Sobre Este Protocolo
              </h3>
              <p className="text-slate-200 leading-relaxed">
                {protocol.narrative}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-emerald-400 mb-3">
                Composição
              </h3>
              <p className="text-slate-300 text-sm mb-3">
                Este protocolo inclui {protocol.products.length} produtos cuidadosamente
                selecionados para uma rotina completa.
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-700">
              <div className="flex-1">
                <p className="text-slate-400 text-sm">Preço Protocolo</p>
                <p className="text-2xl font-bold text-emerald-400">
                  R$ {protocol.price.toFixed(2)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-slate-400 text-sm">Preço Original</p>
                <p className="text-lg text-slate-300 line-through">
                  R$ {protocol.original_price.toFixed(2)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-slate-400 text-sm">Economia</p>
                <p className="text-2xl font-bold text-emerald-500">
                  {(((protocol.original_price - protocol.price) / protocol.original_price) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700 flex gap-3">
          {type === 'protocol' && (
            <>
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold py-3 px-4 rounded-lg transition">
                Adicionar ao Carrinho
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-4 rounded-lg transition"
              >
                Fechar
              </button>
            </>
          )}
          {type === 'product' && (
            <button
              onClick={onClose}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-4 rounded-lg transition"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
