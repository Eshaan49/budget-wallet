"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Minus, Sparkles, Loader2, CheckCircle2, Wand2 } from "lucide-react"
import type { Transaction } from "@/app/page"

// canvas-confetti is loaded lazily to keep SSR safe
async function fireConfetti() {
  const confetti = (await import("canvas-confetti")).default
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#4ade80", "#22d3ee", "#a78bfa", "#f9a8d4"],
    scalar: 0.85,
  })
}

type Props = {
  onAddTransaction: (transaction: Omit<Transaction, "id" | "date">) => Promise<void>
}

const CATEGORIES = [
  "Income", "Housing", "Food", "Transportation",
  "Utilities", "Entertainment", "Healthcare", "Shopping", "Other",
]

type Tab = "manual" | "magic"
type ParsedPreview = {
  amount: number
  category: string
  description: string
  type: "income" | "expense"
}

export function QuickAddTransaction({ onAddTransaction }: Props) {
  const [tab, setTab] = useState<Tab>("magic")

  // Manual form state
  const [type, setType] = useState<"income" | "expense">("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Magic AI state
  const [magicText, setMagicText] = useState("")
  const [parsing, setParsing] = useState(false)
  const [preview, setPreview] = useState<ParsedPreview | null>(null)
  const [parseError, setParseError] = useState("")
  const [adding, setAdding] = useState(false)

  // ── Manual submit ──
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !category) return
    setSubmitting(true)
    await onAddTransaction({ description, amount: parseFloat(amount), category, type })
    setDescription("")
    setAmount("")
    setCategory("")
    setSubmitting(false)
    setSuccess(true)
    await fireConfetti()
    setTimeout(() => setSuccess(false), 2000)
  }

  // ── Magic parse ──
  const handleMagicParse = async () => {
    if (!magicText.trim()) return
    setParsing(true)
    setParseError("")
    setPreview(null)
    try {
      const res = await fetch("/api/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: magicText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Parse failed")
      setPreview(data as ParsedPreview)
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setParsing(false)
    }
  }

  const handleMagicAdd = async () => {
    if (!preview) return
    setAdding(true)
    await onAddTransaction(preview)
    setAdding(false)
    setPreview(null)
    setMagicText("")
    await fireConfetti()
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.08]">
        {(["magic", "manual"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              tab === t
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              {t === "magic" && <Sparkles className="h-3.5 w-3.5" />}
              {t === "magic" ? "Magic Add" : "Manual"}
            </span>
            {tab === t && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* ── MAGIC TAB ── */}
          {tab === "magic" && (
            <motion.div
              key="magic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <p className="text-xs text-muted-foreground mb-3">
                  Describe your transaction in plain English — Gemini AI does the rest.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder={`"Spent 15 on a burger" or "Got paid 3000 salary"`}
                    value={magicText}
                    onChange={(e) => setMagicText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleMagicParse()}
                    className="glass-row border-0 focus-visible:ring-1 focus-visible:ring-primary/60 text-sm magic-ring placeholder:text-muted-foreground/60"
                  />
                  <Button
                    onClick={handleMagicParse}
                    disabled={parsing || !magicText.trim()}
                    size="icon"
                    className="shrink-0 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    {parsing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {parseError && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {parseError}
                </p>
              )}

              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="glass-row rounded-xl p-4 space-y-3"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      AI Parsed ✦
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Description</p>
                        <p className="font-medium text-foreground">{preview.description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className={`font-mono font-semibold ${preview.type === "income" ? "text-primary" : "text-destructive"}`}>
                          {preview.type === "income" ? "+" : "-"}{fmt(preview.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="font-medium text-foreground">{preview.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className={`font-medium capitalize ${preview.type === "income" ? "text-primary" : "text-destructive"}`}>
                          {preview.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreview(null)}
                        className="flex-1 text-muted-foreground hover:text-foreground"
                      >
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleMagicAdd}
                        disabled={adding}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {adding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Transaction
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── MANUAL TAB ── */}
          {tab === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleManualSubmit} className="space-y-4">
                {/* Income / Expense toggle */}
                <div className="flex gap-2 p-1 glass-row rounded-xl">
                  {(["expense", "income"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setType(t); setCategory("") }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        type === t
                          ? t === "expense"
                            ? "bg-destructive/20 text-destructive ring-1 ring-destructive/30"
                            : "bg-primary/20 text-primary ring-1 ring-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "expense" ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {t === "expense" ? "Expense" : "Income"}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                  <Input
                    placeholder="e.g. Coffee, Netflix, Salary…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-row border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="glass-row border-0 pl-7 focus-visible:ring-1 focus-visible:ring-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="glass-row border-0 focus:ring-1 focus:ring-primary/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/10">
                      {CATEGORIES.filter((c) =>
                        type === "income" ? c === "Income" : c !== "Income"
                      ).map((c) => (
                        <SelectItem key={c} value={c} className="focus:bg-white/10">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={!description || !amount || !category || submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                >
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.span
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Added!
                      </motion.span>
                    ) : submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Plus className="h-4 w-4" /> Add Transaction
                      </span>
                    )}
                  </AnimatePresence>
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
