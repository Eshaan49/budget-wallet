"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react"
import type { Transaction } from "@/app/page"
import { useCurrency } from "@/lib/currency-context"

type Props = {
  transactions: Transaction[]
  onDelete: (id: string) => void
  loading?: boolean
}

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d)

export function RecentTransactions({ transactions, onDelete, loading }: Props) {
  const { fmt } = useCurrency()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Transactions</h2>
        {transactions.length > 0 && (
          <span className="text-xs text-muted-foreground glass-row rounded-full px-2 py-0.5">
            {transactions.length}
          </span>
        )}
      </div>

      <div className="px-3 pb-3 space-y-1.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl shimmer" />
          ))
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add one above to get started!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="group flex items-center gap-3 glass-row rounded-xl px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    tx.type === "income" ? "bg-primary/15 ring-1 ring-primary/25" : "bg-destructive/15 ring-1 ring-destructive/25"
                  }`}
                >
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
                  <span
                    className={`font-mono text-sm font-semibold ${
                      tx.type === "income" ? "text-primary" : "text-destructive"
                    }`}
                  >
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