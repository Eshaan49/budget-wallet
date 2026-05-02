"use client"

import { motion } from "framer-motion"
import { Wallet, Sparkles, LogOut, User } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { useState } from "react"

type Props = { userEmail?: string }

export function DashboardHeader({ userEmail }: Props) {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = getSupabase()
    await supabase.auth.signOut()
    window.location.href = "/auth"
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 glass-strong border-b border-white/[0.08]"
    >
      <div className="container mx-auto px-4 py-3.5 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/40 glow-primary">
              <Wallet className="h-4.5 w-4.5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary/80" />
              </span>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground leading-tight">Budget Wallet</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1 leading-tight">
                <Sparkles className="h-3 w-3 text-primary/70" />
                AI-Powered Finance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "long", day: "numeric" })}
            </div>

            {userEmail && (
              <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground hidden sm:block max-w-32 truncate">
                  {userEmail}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:block">{loggingOut ? "Signing out…" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
