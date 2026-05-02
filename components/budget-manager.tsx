"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Plus, Trash2, Loader2, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"

type Budget = {
  id: string
  category: string
  monthly_limit: number
}

type Props = {
  expensesByCategory: Record<string, number>
}

const EXPENSE_CATEGORIES = [
  "Housing", "Groceries", "Dining", "Transport", "Vehicle",
  "Utilities", "Subscriptions", "Healthcare", "Education",
  "Shopping", "Travel", "Entertainment", "Investment Expense",
  "Insurance", "Personal Care", "Gifts & Donations", "Finance", "Other",
]

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

function BudgetBar({ spent, limit }: { spent: number; limit: number }) {
  const pct = Math.min((spent / limit) * 100, 100)
  const over = spent > limit
  const warning = pct >= 80

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={over ? "text-destructive font-medium" : warning ? "text-warning font-medium" : "text-muted-foreground"}>
          {fmt(spent)} spent
        </span>
        <span className="text-muted-foreground">{fmt(limit)} limit</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            over ? "bg-destructive" : warning ? "bg-warning" : "bg-primary"
          }`}
        />
      </div>
      {over && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Over by {fmt(spent - limit)}
        </p>
      )}
    </div>
  )
}

export function BudgetManager({ expensesByCategory }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newLimit, setNewLimit] = useState("")

  useEffect(() => {
    fetch("/api/budgets")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBudgets(data) })
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!newCategory || !newLimit) return
    setAdding(true)
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCategory, monthly_limit: parseFloat(newLimit) }),
    })
    const data = await res.json()
    if (res.ok) {
      setBudgets(prev => {
        const exists = prev.findIndex(b => b.category === data.category)
        if (exists >= 0) { const updated = [...prev]; updated[exists] = data; return updated }
        return [...prev, data]
      })
      setNewCategory("")
      setNewLimit("")
      setShowForm(false)
    }
    setAdding(false)
  }

  const handleDelete = async (category: string) => {
    await fetch("/api/budgets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    })
    setBudgets(prev => prev.filter(b => b.category !== category))
  }

  const usedCategories = new Set(budgets.map(b => b.category))
  const availableCategories = EXPENSE_CATEGORIES.filter(c => !usedCategories.has(c))

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Monthly Budgets</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors glass-row rounded-lg px-2.5 py-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Set Budget
        </button>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-row rounded-xl p-3 space-y-2.5"
            >
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full glass-row rounded-lg px-3 py-2 text-sm text-foreground bg-transparent outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="" className="bg-gray-900">Select category</option>
                {availableCategories.map(c => (
                  <option key={c} value={c} className="bg-gray-900">{c}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="Monthly limit"
                    value={newLimit}
                    onChange={e => setNewLimit(e.target.value)}
                    className="w-full glass-row rounded-lg pl-7 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={adding || !newCategory || !newLimit}
                  className="px-3 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Budget list */}
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl shimmer" />
          ))
        ) : budgets.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No budgets set yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Set limits to track your spending.</p>
          </div>
        ) : (
          <AnimatePresence>
            {budgets.map((budget) => {
              const spent = expensesByCategory[budget.category] || 0
              const over = spent > budget.monthly_limit
              return (
                <motion.div
                  key={budget.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`group glass-row rounded-xl p-3 space-y-2 ${over ? "ring-1 ring-destructive/30" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {over ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className="text-sm font-medium text-foreground">{budget.category}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(budget.category)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <BudgetBar spent={spent} limit={budget.monthly_limit} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
