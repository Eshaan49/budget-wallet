import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Keep a singleton for client components
let client: ReturnType<typeof createClient> | null = null
export function getSupabase() {
  if (!client) client = createClient()
  return client
}

export type TransactionRow = {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  created_at: string
}

export type BudgetRow = {
  id: string
  user_id: string
  category: string
  monthly_limit: number
  created_at: string
}
