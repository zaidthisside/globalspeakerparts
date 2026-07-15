"use client";

import { useCurrency } from "@/context/CurrencyContext";

interface ProductPriceBadgeProps {
  startingPrice: string;
  label?: string;
}

export default function ProductPriceBadge({ startingPrice, label = "Starting At" }: ProductPriceBadgeProps) {
  const { convertPrice } = useCurrency();

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 border border-black rounded-lg bg-white">
      <span className="text-xs text-[#5C5C63] uppercase tracking-wider font-medium">{label}</span>
      <span className="font-display font-black text-lg text-[#0F0F10]">{convertPrice(startingPrice)}</span>
    </div>
  );
}
