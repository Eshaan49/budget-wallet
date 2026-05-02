"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { PieChart, Pie, Cell, Legend } from "recharts"

type Props = {
  expensesByCategory: Record<string, number>
}

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n)

export function SpendingChart({ expensesByCategory }: Props) {
  const data = Object.entries(expensesByCategory).map(([name, value], i) => ({
    name,
    value,
    fill: COLORS[i % COLORS.length],
  }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  const chartConfig = data.reduce(
    (acc, item, i) => ({
      ...acc,
      [item.name]: { label: item.name, color: COLORS[i % COLORS.length] },
    }),
    {} as ChartConfig
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">Spending by Category</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {data.length === 0 ? "No expenses recorded yet" : `Total: ${fmt(total)} this month`}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground px-6">
          Add some expenses to see your spending breakdown
        </div>
      ) : (
        <div className="px-4 pb-5">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[260px]">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span>{name}</span>
                        <span className="font-mono font-medium">{fmt(value as number)}</span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                formatter={(v) => (
                  <span className="text-xs text-muted-foreground">{v}</span>
                )}
              />
            </PieChart>
          </ChartContainer>

          <div className="mt-2 space-y-2">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{((item.value / total) * 100).toFixed(1)}%</span>
                  <span className="font-mono font-medium text-foreground">{fmt(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
