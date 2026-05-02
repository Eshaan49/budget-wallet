import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

export async function POST(req: Request) {
  const { transactions } = await req.json()
  if (!transactions?.length) return NextResponse.json({ insights: [] })

  const summary = transactions
    .slice(0, 30)
    .map((t: any) => `${t.type}: ${t.description} - ₹${t.amount} (${t.category})`)
    .join('\n')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a personal finance advisor. Analyze transactions and return ONLY a JSON array of 3-4 insight objects. No markdown, no explanation.
Format: [{"type":"warning|tip|info|success","title":"short title","message":"1-2 sentence insight"}]`
        },
        {
          role: 'user',
          content: `Analyze these transactions:\n${summary}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content ?? '[]'
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return NextResponse.json({ insights: JSON.parse(clean) })
  } catch {
    return NextResponse.json({ insights: [] })
  }
}