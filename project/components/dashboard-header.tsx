"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Wallet, Sparkles, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Props = {
  userEmail?: string
}

export function DashboardHeader({ userEmail }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 glass-strong border-b border-white/[0.08]"
    >
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/40 glow-primary">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary/80" />
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">Budget Wallet</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary/70" />
                AI-Powered Finance Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short", month: "long", day: "numeric", year: "numeric",
              })}
            </div>
            {userEmail && (
              <div className="glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground hidden sm:block">
                {userEmail}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
