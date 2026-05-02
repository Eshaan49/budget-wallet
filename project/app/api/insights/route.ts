import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch last 90 days of transactions
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', since.toISOString())
    .order('date', { ascending: false })

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({
      insights: [
        { type: 'tip', title: 'Get Started', message: 'Add some transactions to unlock AI-powered financial insights tailored to your spending.', severity: 'info' }
      ]
    })
  }

  // Summarise data for AI
  const now = new Date()
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
  })

  const summarise = (txns: typeof transactions) => {
    const byCategory: Record<string, number> = {}
    let income = 0, expense = 0
    for (const t of txns) {
      if (t.type === 'income') income += t.amount
      else { expense += t.amount; byCategory[t.category] = (byCategory[t.category] || 0) + t.amount }
    }
    return { income, expense, byCategory, balance: income - expense }
  }

  const current = summarise(thisMonth)
  const previous = summarise(lastMonth)

  const prompt = `You are a professional financial advisor AI. Analyse this user's financial data and return actionable insights.

CURRENT MONTH: Income ₹${current.income}, Expenses ₹${current.expense}, Balance ₹${current.balance}
Spending by category: ${JSON.stringify(current.byCategory)}

LAST MONTH: Income ₹${previous.income}, Expenses ₹${previous.expense}
Spending by category: ${JSON.stringify(previous.byCategory)}

MONTHLY BUDGETS SET: ${budgets && budgets.length > 0 ? JSON.stringify(budgets.map(b => ({ category: b.category, limit: b.monthly_limit, spent: current.byCategory[b.category] || 0 }))) : 'None set'}

Generate 4-6 highly specific, actionable insights. Return ONLY a JSON array, no markdown:
[
  {
    "type": "warning|tip|achievement|alert",
    "title": "Short title (4-6 words)",
    "message": "Specific, data-driven insight with actual numbers. Be direct and helpful. Reference real amounts.",
    "severity": "high|medium|low"
  }
]

Rules:
- Reference actual rupee amounts from the data
- Compare current vs last month where relevant  
- Flag budget overruns specifically
- Celebrate achievements (positive balance, savings)
- Give concrete saving suggestions with estimated amounts
- severity "high" = urgent action needed, "medium" = worth attention, "low" = FYI`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1000,
    }),
  })

  const aiData = await response.json()
  const raw = aiData?.choices?.[0]?.message?.content ?? '[]'

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const insights = JSON.parse(clean)
    return NextResponse.json({ insights })
  } catch {
    return NextResponse.json({ insights: [], error: 'Failed to parse insights' })
  }
}
