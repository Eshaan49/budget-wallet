"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Trophy, Info, Zap } from "lucide-react"

type Insight = {
  type: "warning" | "tip" | "achievement" | "alert"
  title: string
  message: string
  severity: "high" | "medium" | "low"
}

const iconMap = {
  warning: AlertTriangle,
  tip: Zap,
  achievement: Trophy,
  alert: AlertTriangle,
}

const colorMap = {
  warning: { bg: "bg-warning/10", ring: "ring-warning/25", icon: "text-warning", border: "" },
  tip: { bg: "bg-primary/10", ring: "ring-primary/25", icon: "text-primary", border: "" },
  achievement: { bg: "bg-emerald-500/10", ring: "ring-emerald-500/25", icon: "text-emerald-400", border: "" },
  alert: { bg: "bg-destructive/10", ring: "ring-destructive/25", icon: "text-destructive", border: "ring-1 ring-destructive/20" },
}

const severityOrder = { high: 0, medium: 1, low: 2 }

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    const res = await fetch("/api/insights")
    const data = await res.json()

    if (Array.isArray(data.insights)) {
      const sorted = [...data.insights].sort(
        (a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]
      )
      setInsights(sorted)
    }

    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchInsights() }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25 glow-primary">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            <p className="text-xs text-muted-foreground">Powered by Llama 3.1</p>
          </div>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={refreshing || loading}
          className="p-1.5 rounded-lg glass-row text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="px-5 pb-5 space-y-2.5">
        {loading ? (
          <>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
              <Sparkles className="h-3 w-3 animate-pulse text-primary" />
              Analysing your finances…
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl shimmer" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </>
        ) : insights.length === 0 ? (
          <div className="py-6 text-center">
            <Info className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Add transactions to get AI insights.</p>
          </div>
        ) : (
          <AnimatePresence>
            {insights.map((insight, i) => {
              const Icon = iconMap[insight.type] || Zap
              const colors = colorMap[insight.type] || colorMap.tip
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className={`glass-row rounded-xl p-3.5 space-y-1.5 ${colors.border}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${colors.bg} ring-1 ${colors.ring} mt-0.5`}>
                      <Icon className={`h-3.5 w-3.5 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                        {insight.severity === "high" && (
                          <span className="text-[10px] font-medium text-destructive bg-destructive/10 rounded-full px-1.5 py-0.5">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
