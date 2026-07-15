"use client";

import { useCurrency } from "@/context/CurrencyContext";

interface PriceValueProps {
  amount: string | number | null;
  fallback?: string;
}

export default function PriceValue({ amount, fallback = "Quote on request" }: PriceValueProps) {
  const { convertPrice } = useCurrency();
  if (amount === null || amount === undefined || amount === "") {
    return <>{fallback}</>;
  }

  const priceStr = typeof amount === "number" ? `$${amount.toFixed(2)}` : amount;
  return <>{convertPrice(priceStr)}</>;
}
