-- ══════════════════════════════════════════════════
--  Budget Wallet — Full Schema (run in SQL Editor)
-- ══════════════════════════════════════════════════

-- 1. TRANSACTIONS (with user_id for multi-user support)
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount      DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  category    TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions(user_id, date DESC);

-- Row Level Security: users only see their own transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own transactions" ON transactions;
CREATE POLICY "Users manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- 2. BUDGETS (monthly limits per category per user)
CREATE TABLE IF NOT EXISTS budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  monthly_limit DECIMAL(12, 2) NOT NULL CHECK (monthly_limit > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own budgets" ON budgets;
CREATE POLICY "Users manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);
