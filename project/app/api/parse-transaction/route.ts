import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `You are a personal finance assistant. Parse the user's natural language transaction description into structured JSON.

Return ONLY valid JSON in this exact format, with no markdown, no backticks, no explanation:
{
  "amount": <number>,
  "category": "<one of: Income, Housing, Food, Transportation, Utilities, Entertainment, Healthcare, Shopping, Other>",
  "description": "<clean short description>",
  "type": "<income or expense>"
}

Rules:
- amount is always a positive number
- type is "income" for salary, earnings, refunds; "expense" for everything else
- category "Income" should only be used when type is "income"
- description should be concise (2-4 words)
- If amount is ambiguous or missing, use 0`

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 })
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `Parse this transaction: "${text}"` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: `Gemini API error: ${err}` }, { status: 500 })
  }

  const geminiData = await response.json()
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  try {
    // Strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: rawText }, { status: 422 })
  }
}
