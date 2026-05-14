"use client"
import { useState, useEffect } from "react"
import { getSupabase } from "@/lib/supabase"
import { DashboardHeader } from "@/components/dashboard-header"
import { BalanceSummary } from "@/components/balance-summary"
import { QuickAddTransaction } from "@/components/quick-add-transaction"
import { SpendingChart } from "@/components/spending-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { BudgetManager } from "@/components/budget-manager"
import { AIInsights } from "@/components/ai-insights"
import { FinancialHealthScore } from "@/components/financial-health-score"

export type Transaction = {
  id: string
  description: string
  amount: number
  category: string
  type: "income" | "expense"
  date: Date
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? "")
    })
    fetch("/api/transactions")
      .then(r => r.json())
      .then(rows => {
        if (Array.isArray(rows)) {
          setTransactions(rows.map(r => ({
            id: r.id, description: r.description, amount: r.amount,
            category: r.category, type: r.type, date: new Date(r.date),
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const addTransaction = async (transaction: Omit<Transaction, "id" | "date">) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    })
    if (!res.ok) return
    const row = await res.json()
    setTransactions(prev => [{
      id: row.id, description: row.description, amount: row.amount,
      category: row.category, type: row.type, date: new Date(row.date),
    }, ...prev])
  }

  const deleteTransaction = async (id: string) => {
    const res = await fetch("/api/transactions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) return
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpenses
  const expensesByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {} as Record<string, number>)

  return (
    <main className="min-h-screen">
      <DashboardHeader userEmail={userEmail} />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <BalanceSummary balance={balance} income={totalIncome} expenses={totalExpenses} loading={loading} />
            <SpendingChart expensesByCategory={expensesByCategory} />
            <FinancialHealthScore transactions={transactions} />
            <BudgetManager expensesByCategory={expensesByCategory} />
          </div>
          <div className="space-y-5">
            <QuickAddTransaction onAddTransaction={addTransaction} />
            <AIInsights />
            <RecentTransactions
              transactions={transactions}
              onDelete={deleteTransaction}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </main>
  )
}