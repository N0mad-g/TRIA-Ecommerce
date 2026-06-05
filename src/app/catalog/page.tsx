'use client'

import { useEffect, useState } from 'react'
import type { Product, Protocol } from '@/types'
import { CatalogCard } from '@/components/CatalogCard'
import { logger } from '@/utils/logger'

interface CatalogData {
  products: Product[]
  protocols: Protocol[]
}

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<CatalogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/catalog')

        if (!response.ok) {
          throw new Error('Failed to fetch catalog')
        }

        const data = await response.json()
        setCatalog(data.data)
        setError(null)
      } catch (err) {
        logger.error('Error fetching catalog', { error: err })
        setError('Erro ao carregar catálogo. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchCatalog()
  }, [])

  return (
    <main className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold text-slate-100 mb-4">
            Nossos Produtos & Protocolos
          </h1>
          <p className="text-lg text-slate-300">
            Descubra nossa linha completa de tratamentos cientificamente formulados para reconstrução capilar.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-12">
            {/* Products Skeleton */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-100 mb-6">
                Produtos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="glass rounded-lg p-6 h-64 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Protocols Skeleton */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-100 mb-6">
                Protocolos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass rounded-lg p-6 h-72 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loaded State */}
        {!loading && catalog && (
          <div className="space-y-12">
            {/* Products */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-100 mb-6">
                Produtos ({catalog.products.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalog.products.map((product) => (
                  <CatalogCard
                    key={product.id}
                    item={product}
                    type="product"
                  />
                ))}
              </div>
            </div>

            {/* Protocols */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-100 mb-6">
                Protocolos ({catalog.protocols.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catalog.protocols.map((protocol) => (
                  <CatalogCard
                    key={protocol.id}
                    item={protocol}
                    type="protocol"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
