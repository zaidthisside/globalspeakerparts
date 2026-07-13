"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (priceStr: string) => string;
}

const DEFAULT_RATES: ExchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  CNY: 7.25,
  JPY: 155.0,
  AUD: 1.50,
  CAD: 1.37
};

const CURRENCY_DETAILS = {
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
  INR: { symbol: "₹", locale: "en-IN" },
  CNY: { symbol: "¥", locale: "zh-CN" },
  JPY: { symbol: "¥", locale: "ja-JP" },
  AUD: { symbol: "A$", locale: "en-AU" },
  CAD: { symbol: "C$", locale: "en-CA" }
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedCurrency = localStorage.getItem("gsp_currency");
      if (storedCurrency && CURRENCY_DETAILS[storedCurrency as keyof typeof CURRENCY_DETAILS]) {
        return storedCurrency;
      }
    }
    return "USD";
  });
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);

  // Load live rates on mount
  useEffect(() => {

    // Fetch live currency rates from free public api
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(res => {
        if (!res.ok) throw new Error("API response error");
        return res.json();
      })
      .then(data => {
        if (data && data.rates) {
          setRates(prev => ({
            ...prev,
            ...data.rates
          }));
        }
      })
      .catch(err => {
        console.warn("Could not fetch live currency rates, using stable fallbacks.", err);
      });
  }, []);

  const setCurrency = (newCurrency: string) => {
    if (CURRENCY_DETAILS[newCurrency as keyof typeof CURRENCY_DETAILS]) {
      setCurrencyState(newCurrency);
      if (typeof window !== "undefined") {
        localStorage.setItem("gsp_currency", newCurrency);
      }
    }
  };

  const convertPrice = (priceStr: string): string => {
    if (!priceStr) return priceStr;
    
    // Extract numerical part (including optional decimals)
    const numMatch = priceStr.match(/[\d.]+/);
    if (!numMatch) return priceStr;
    
    const numUSD = parseFloat(numMatch[0]);
    if (isNaN(numUSD)) return priceStr;
    
    // Calculate rate
    const rate = rates[currency] || DEFAULT_RATES[currency] || 1.0;
    const convertedNum = numUSD * rate;
    
    // Get details
    const details = CURRENCY_DETAILS[currency as keyof typeof CURRENCY_DETAILS] || { symbol: currency, locale: "en-US" };
    
    // Format converted value
    const formattedNum = new Intl.NumberFormat(details.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedNum);
    
    // Reconstruct string keeping original suffix (like " / unit")
    const numIndex = priceStr.indexOf(numMatch[0]);
    const suffix = priceStr.substring(numIndex + numMatch[0].length);
    
    return `${details.symbol}${formattedNum}${suffix}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
