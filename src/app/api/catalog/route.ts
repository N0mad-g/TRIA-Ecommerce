import { NextResponse } from 'next/server'
import { dbService } from '@/services/db-service'
import { logger } from '@/utils/logger'

export async function GET() {
  try {
    const [products, protocols] = await Promise.all([
      dbService.getProducts(),
      dbService.getProtocols(),
    ])

    return NextResponse.json(
      {
        status: 'ok',
        data: {
          products,
          protocols,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Failed to fetch catalog', { error })
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch catalog',
      },
      { status: 500 }
    )
  }
}
