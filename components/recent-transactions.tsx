"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Trash2, Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Transaction } from "@/app/page"
import { useCurrency } from "@/lib/currency-context"

type Props = {
  transactions: Transaction[]
  onDelete: (id: string) => void
  loading?: boolean
}

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d)

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function RecentTransactions({ transactions, onDelete, loading }: Props) {
  const { fmt } = useCurrency()

  // Month filter state
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  // Search & filter state
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.category))]
    return cats.sort()
  }, [transactions])

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date)
      const matchMonth = txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear
      const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === "all" || tx.type === filterType
      const matchCategory = filterCategory === "all" || tx.category === filterCategory
      return matchMonth && matchSearch && matchType && matchCategory
    })
  }, [transactions, selectedMonth, selectedYear, search, filterType, filterCategory])

  // Month navigation
  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
    else setSelectedMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
    else setSelectedMonth(m => m + 1)
  }
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear()

  // Monthly stats
  const monthIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0)
  const monthExpenses = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0)

  const clearFilters = () => {
    setSearch("")
    setFilterType("all")
    setFilterCategory("all")
  }
  const hasActiveFilters = search || filterType !== "all" || filterCategory !== "all"

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">Transactions</h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors">
                <X className="h-3 w-3" /> Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 glass-row rounded-lg px-2.5 py-1.5 text-xs transition-colors ${showFilters ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Filter className="h-3 w-3" />
              Filter
            </button>
            {filtered.length > 0 && (
              <span className="text-xs text-muted-foreground glass-row rounded-full px-2 py-0.5">
                {filtered.length}
              </span>
            )}
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between glass-row rounded-xl px-3 py-2 mb-3">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{MONTHS[selectedMonth]} {selectedYear}</p>
            <p className="text-[10px] text-muted-foreground">
              +{fmt(monthIncome)} / -{fmt(monthExpenses)}
            </p>
          </div>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass-row rounded-xl pl-8 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 border-0 outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {/* Type filter */}
              <div className="flex gap-1.5">
                {(["all", "income", "expense"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      filterType === type
                        ? type === "income" ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                          : type === "expense" ? "bg-destructive/20 text-destructive ring-1 ring-destructive/30"
                          : "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground glass-row"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Category filter */}
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full glass-row rounded-xl px-3 py-2 text-xs text-foreground border-0 outline-none focus:ring-1 focus:ring-primary/50 bg-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction List */}
      <div className="px-3 pb-3 space-y-1.5 max-h-[500px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl shimmer" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters || search ? "No transactions match your filters." : "No transactions this month."}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {hasActiveFilters ? "Try clearing filters" : "Add one above to get started!"}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((tx) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="group flex items-center gap-3 glass-row rounded-xl px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  tx.type === "income" ? "bg-primary/15 ring-1 ring-primary/25" : "bg-destructive/15 ring-1 ring-destructive/25"
                }`}>
                  {tx.type === "income" ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                    {tx.category} · {fmtDate(tx.date)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`font-mono text-sm font-semibold ${
                    tx.type === "income" ? "text-primary" : "text-destructive"
                  }`}>
                    {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(tx.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}