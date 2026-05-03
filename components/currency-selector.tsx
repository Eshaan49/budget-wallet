"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { useCurrency, CURRENCIES, type Currency } from "@/lib/currency-context"

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)

  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="font-medium text-foreground">{current.symbol}</span>
        <span>{current.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 glass-strong rounded-xl overflow-hidden min-w-[180px] shadow-xl"
            >
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code as Currency); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-left"
                >
                  <span className="w-6 text-center font-medium text-primary">{c.symbol}</span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-xs">{c.code}</p>
                    <p className="text-muted-foreground text-[10px]">{c.name}</p>
                  </div>
                  {currency === c.code && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}