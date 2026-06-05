export interface Product {
  id: string
  sku: string
  name: string
  price: number
  category: 'Cabelo' | 'Styling' | 'Barba'
  active_ingredients: Record<string, string>
  inci: string
  created_at: string
}

export interface Protocol {
  id: string
  name: 'Origin' | 'Reconstruct' | 'Define' | 'Complete'
  price: number
  original_price: number
  products: string[]
  narrative: string
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string | null
  last_quiz_recommendation: string | null
  updated_at: string
}

export interface UserDiagnosis {
  id: string
  user_id: string | null
  answers: Record<string, unknown>
  recommended_protocol_id: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  protocol_id: string
  status: 'active' | 'paused' | 'cancelled' | 'past_due'
  gateway_subscription_id: string
  next_billing_date: string
  created_at: string
}

export interface QuizAnswers {
  clinical_stage: string
  focus: string
  [key: string]: unknown
}
