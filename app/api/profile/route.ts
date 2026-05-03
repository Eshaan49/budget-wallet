import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ currency: 'INR' })
  }

  return NextResponse.json({ currency: data.currency })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currency } = await req.json()
  if (!currency) return NextResponse.json({ error: 'Missing currency' }, { status: 400 })

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, currency })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, currency })
}