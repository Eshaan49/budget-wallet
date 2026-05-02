import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY!

const SYSTEM_PROMPT = `You are a professional personal finance AI. Parse natural language into structured transaction data.

Return ONLY valid JSON, no markdown, no explanation:
{"amount":<positive number>,"category":"<category>","description":"<clean 2-5 word title>","type":"<income|expense>"}

CATEGORIES — pick the single most specific match:
- Salary: monthly pay, CTC, in-hand salary, wages
- Freelance: gig work, contract payment, project payment, consulting fee
- Investment: dividends, stock profit, mutual fund returns, crypto gains, interest earned
- Refund: cashback, return, reimbursement, money back
- Housing: rent, mortgage, maintenance, society charges, home repair
- Groceries: supermarket, vegetables, fruits, milk, kirana store, daily essentials
- Dining: restaurant, cafe, food delivery, Swiggy, Zomato, hotel meal
- Transport: fuel, petrol, diesel, bus, auto, metro, local train, toll, parking
- Vehicle: bike purchase, car purchase, scooter, EMI for vehicle, car accessories, tyre, service
- Utilities: electricity, water bill, gas cylinder, internet, broadband, mobile recharge
- Subscriptions: Netflix, Hotstar, Spotify, Amazon Prime, YouTube Premium, OTT
- Healthcare: doctor, hospital, medicine, pharmacy, health insurance, lab test, gym
- Education: school fee, college fee, course, coaching, books, online course
- Shopping: clothes, shoes, electronics, gadgets, Amazon, Flipkart, mall
- Travel: flight, train ticket, hotel booking, trip, holiday, Uber, Ola, MakeMyTrip
- Entertainment: movie ticket, concert, amusement park, games, sports event
- Insurance: life insurance, health insurance premium, vehicle insurance, LIC
- Personal Care: salon, haircut, spa, beauty products, cosmetics, skincare
- Gifts & Donations: gift, charity, donation, NGO, birthday present
- Finance: loan EMI, credit card payment, interest payment, bank charges
- Other: anything that doesn't clearly fit above

TYPE RULES:
- "income": salary, received money, earnings, refund, cashback, returns, dividends
- "expense": everything else

DESCRIPTION: Always title case, specific, 2-5 words max.
AMOUNT: always a positive number.`

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Parse this transaction: "${text}"` },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  })

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content ?? ''

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return NextResponse.json(JSON.parse(clean))
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 422 })
  }
}