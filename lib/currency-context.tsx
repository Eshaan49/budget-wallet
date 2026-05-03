"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export const CURRENCIES = [
{ code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN" },
{ code: "USD", name: "US Dollar", symbol: "$", locale: "en-US" },
{ code: "EUR", name: "Euro", symbol: "€", locale: "de-DE" },
{ code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB" },
{ code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
{ code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE" },
{ code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
{ code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU" },

// Added currencies
{ code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
{ code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
{ code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN" },
{ code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", locale: "en-HK" },
{ code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR" },
{ code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR" },
{ code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA" },
{ code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", locale: "en-NZ" },
{ code: "SEK", name: "Swedish Krona", symbol: "kr", locale: "sv-SE" },
{ code: "NOK", name: "Norwegian Krone", symbol: "kr", locale: "nb-NO" },
{ code: "DKK", name: "Danish Krone", symbol: "kr", locale: "da-DK" },
] as const

export type Currency = typeof CURRENCIES[number]["code"]

type CurrencyContextType = {
currency: Currency
setCurrency: (c: Currency) => void
fmt: (n: number) => string
symbol: string
}

const CurrencyContext = createContext<CurrencyContextType>({
currency: "INR",
setCurrency: () => {},
fmt: (n) => `₹${n}`,
symbol: "₹",
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
const [currency, setCurrencyState] = useState<Currency>("INR")

useEffect(() => {
fetch("/api/profile")
.then((r) => r.json())
.then((data) => {
if (data.currency) setCurrencyState(data.currency as Currency)
})
.catch(() => {})
}, [])

const setCurrency = async (c: Currency) => {
setCurrencyState(c)
await fetch("/api/profile", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ currency: c }),
})
}

const currencyInfo =
CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]

const fmt = (n: number) =>
new Intl.NumberFormat(currencyInfo.locale, {
style: "currency",
currency: currencyInfo.code,
maximumFractionDigits: ["JPY", "KRW"].includes(currency) ? 0 : 2,
}).format(n)

return (
<CurrencyContext.Provider
value={{ currency, setCurrency, fmt, symbol: currencyInfo.symbol }}
>
{children}
</CurrencyContext.Provider>
)
}

export const useCurrency = () => useContext(CurrencyContext)
