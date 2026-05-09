"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, CheckCircle2 } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"
import type { Transaction } from "@/app/page"

type HealthData = {
  score: number
  grade: "A" | "B" | "C" | "D" | "F"
  summary: string
  breakdown: {
    savingsRate: { score: number; value: string; label: string }
    expenseControl: { score: number; value: string; label: string }
    budgetDiversity: { score: number; value: string; label: string }
    consistency: { score: number; value: string; label: string }
  }
  tips: string[]
}

const gradeConfig = {
  A: { color: "text-emerald-400", bg: "bg-emerald-400/15", ring: "ring-emerald-400/30", glow: "0 0 30px oklch(0.72 0.18 162 / 0.3)" },
  B: { color: "text-primary", bg: "bg-primary/15", ring: "ring-primary/30", glow: "0 0 30px oklch(0.72 0.18 162 / 0.2)" },
  C: { color: "text-warning", bg: "bg-warning/15", ring: "ring-warning/30", glow: "0 0 30px oklch(0.78 0.15 85 / 0.2)" },
  D: { color: "text-orange-400", bg: "bg-orange-400/15", ring: "ring-orange-400/30", glow: "0 0 30px oklch(0.65 0.2 45 / 0.2)" },
  F: { color: "text-destructive", bg: "bg-destructive/15", ring: "ring-destructive/30", glow: "0 0 30px oklch(0.62 0.22 22 / 0.2)" },
}

function calculateHealthScore(transactions: Transaction[]): HealthData {
  if (transactions.length === 0) {
    return {
      score: 0,
      grade: "F",
      summary: "Add transactions to calculate your financial health score.",
      breakdown: {
        savingsRate: { score: 0, value: "N/A", label: "Savings Rate" },
        expenseControl: { score: 0, value: "N/A", label: "Expense Control" },
        budgetDiversity: { score: 0, value: "N/A", label: "Budget Diversity" },
        consistency: { score: 0, value: "N/A", label: "Transaction Activity" },
      },
      tips: ["Start by adding your income and expenses to get your score."],
    }
  }

  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

  let savingsScore = 0
  if (savingsRate >= 30) savingsScore = 40
  else if (savingsRate >= 20) savingsScore = 32
  else if (savingsRate >= 10) savingsScore = 22
  else if (savingsRate >= 0) savingsScore = 12
  else savingsScore = 0

  const expensesByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {} as Record<string, number>)
  const maxCategoryPct = expenses > 0
    ? Math.max(...Object.values(expensesByCategory).map(v => (v / expenses) * 100))
    : 0
  let expenseScore = 0
  if (maxCategoryPct <= 30) expenseScore = 30
  else if (maxCategoryPct <= 40) expenseScore = 22
  else if (maxCategoryPct <= 50) expenseScore = 15
  else if (maxCategoryPct <= 70) expenseScore = 8
  else expenseScore = 3

  const categoryCount = Object.keys(expensesByCategory).length
  let diversityScore = 0
  if (categoryCount >= 6) diversityScore = 20
  else if (categoryCount >= 4) diversityScore = 15
  else if (categoryCount >= 2) diversityScore = 10
  else diversityScore = 5

  const txCount = transactions.length
  let consistencyScore = 0
  if (txCount >= 20) consistencyScore = 10
  else if (txCount >= 10) consistencyScore = 7
  else if (txCount >= 5) consistencyScore = 4
  else consistencyScore = 2

  const totalScore = Math.min(100, savingsScore + expenseScore + diversityScore + consistencyScore)

  let grade: "A" | "B" | "C" | "D" | "F" = "F"
  if (totalScore >= 85) grade = "A"
  else if (totalScore >= 70) grade = "B"
  else if (totalScore >= 55) grade = "C"
  else if (totalScore >= 40) grade = "D"

  const tips: string[] = []
  if (savingsRate < 20) tips.push(`Increase your savings rate. Currently at ${savingsRate.toFixed(1)}% — aim for 20%+`)
  if (maxCategoryPct > 40) tips.push(`One category is dominating your spending at ${maxCategoryPct.toFixed(0)}% — try to spread expenses`)
  if (categoryCount < 4) tips.push("Track more expense categories for a clearer picture of your finances")
  if (txCount < 10) tips.push("Add more transactions to get a more accurate health score")
  if (tips.length === 0) tips.push("Great job! Keep maintaining your current financial habits")

  let summary = ""
  if (grade === "A") summary = "Excellent financial health! You're saving well and managing expenses smartly."
  else if (grade === "B") summary = "Good financial health. A few tweaks could push you to excellent."
  else if (grade === "C") summary = "Average financial health. Focus on increasing your savings rate."
  else if (grade === "D") summary = "Needs improvement. Review your spending habits and set budget limits."
  else summary = "Critical attention needed. Start tracking income and controlling expenses."

  return {
    score: totalScore,
    grade,
    summary,
    breakdown: {
      savingsRate: { score: savingsScore, value: income > 0 ? `${savingsRate.toFixed(1)}%` : "No income", label: "Savings Rate" },
      expenseControl: { score: expenseScore, value: expenses > 0 ? `${maxCategoryPct.toFixed(0)}% max` : "No expenses", label: "Expense Control" },
      budgetDiversity: { score: diversityScore, value: `${categoryCount} categories`, label: "Budget Diversity" },
      consistency: { score: consistencyScore, value: `${txCount} transactions`, label: "Activity Level" },
    },
    tips,
  }
}

type Props = {
  transactions: Transaction[]
}

export function FinancialHealthScore({ transactions }: Props) {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)
  const { fmt } = useCurrency()

  useEffect(() => {
    const data = calculateHealthScore(transactions)
    setHealth(data)
    let start = 0
    const end = data.score
    const step = (end / 1200) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setAnimatedScore(end); clearInterval(timer) }
      else setAnimatedScore(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [transactions])

  if (!health) return null

  const cfg = gradeConfig[health.grade]
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (health.score / 100) * circumference
  const strokeColor = health.grade === "A" ? "#4ade80" : health.grade === "B" ? "#4ade80" : health.grade === "C" ? "#eab308" : health.grade === "D" ? "#fb923c" : "#ef4444"

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
          <Shield className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Financial Health Score</h2>
          <p className="text-xs text-muted-foreground">Based on your transaction history</p>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle
                cx="64" cy="64" r="54"
                fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                transform="rotate(-90 64 64)"
              />
              <text x="64" y="60" textAnchor="middle" style={{ fontSize: 28, fontWeight: 700, fill: "white" }}>
                {animatedScore}
              </text>
              <text x="64" y="76" textAnchor="middle" style={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}>
                out of 100
              </text>
            </svg>
          </div>

          <div className="flex-1 space-y-2">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${cfg.bg} ring-1 ${cfg.ring} ${cfg.color}`}>
              Grade {health.grade}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{health.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.values(health.breakdown).map((item) => (
            <div key={item.label} className="glass-row rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-[10px] font-mono text-foreground">{item.score}pts</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
              <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 40) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-primary/70"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">💡 Tips to improve</p>
          {health.tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-2 glass-row rounded-lg px-3 py-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}