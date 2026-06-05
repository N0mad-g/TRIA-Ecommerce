import { createClient } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'
import type { Product, Protocol, UserProfile, UserDiagnosis } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase credentials missing', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
}

const supabase = createClient(supabaseUrl, supabaseKey)

export class DatabaseService {
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.from('products').select('*')

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Failed to fetch products', { error })
      throw error
    }
  }

  async getProtocols(): Promise<Protocol[]> {
    try {
      const { data, error } = await supabase.from('protocols').select('*')

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Failed to fetch protocols', { error })
      throw error
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || null
    } catch (error) {
      logger.error('Failed to fetch user profile', { userId, error })
      throw error
    }
  }

  async saveDiagnosis(diagnosis: Partial<UserDiagnosis>): Promise<UserDiagnosis> {
    try {
      const { data, error } = await supabase
        .from('user_diagnoses')
        .insert([diagnosis])
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to save diagnosis', { error })
      throw error
    }
  }

  async updateProfileRecommendation(
    userId: string,
    protocolId: string
  ): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ last_quiz_recommendation: protocolId })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      logger.error('Failed to update profile recommendation', { userId, error })
      throw error
    }
  }
}

export const dbService = new DatabaseService()
