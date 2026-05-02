import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (for client components)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type TransactionRow = {
  id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  created_at: string
  user_id: string
}
