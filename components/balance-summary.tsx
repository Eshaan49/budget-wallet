"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

type BalanceSummaryProps = {
  balance: number
  income: number
  expenses: number
  loading?: boolean
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
}

export function BalanceSummary({ balance, income, expenses, loading }: BalanceSummaryProps) {
  const { fmt } = useCurrency()

  const cards = [
    {
      label: "Total Balance",
      value: balance,
      sub: "Available to spend",
      icon: CreditCard,
      color: "text-primary",
      bg: "bg-primary/10",
      ring: "ring-primary/25",
      glow: balance >= 0 ? "glow-income" : "glow-expense",
      valueColor: balance >= 0 ? "text-primary" : "text-destructive",
    },
    {
      label: "Total Income",
      value: income,
      sub: "This month",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      ring: "ring-primary/25",
      glow: "glow-income",
      valueColor: "text-primary",
    },
    {
      label: "Total Expenses",
      value: expenses,
      sub: "This month",
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
      ring: "ring-destructive/25",
      glow: "glow-expense",
      valueColor: "text-destructive",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`glass rounded-2xl p-5 ${card.glow}`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {card.label}
                </p>
                {loading ? (
                  <div className="h-8 w-28 rounded-lg shimmer" />
                ) : (
                  <p className={`text-2xl font-bold font-mono tracking-tight ${card.valueColor}`}>
                    {fmt(card.value)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </div>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.bg} ring-1 ${card.ring}`}
              >
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}