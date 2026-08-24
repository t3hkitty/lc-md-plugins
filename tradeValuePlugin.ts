import type { Book } from '../types/resonance';

export type CurrencyCode = 'USD' | 'SIMOLEONS' | 'DOGE' | 'RUPEE' | 'GOLD';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  ratePerUsd: number;
  format: (amount: number) => string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    ratePerUsd: 1.0,
    format: (amt: number) => `$${amt.toFixed(2)} USD`
  },
  SIMOLEONS: {
    code: 'SIMOLEONS',
    name: 'Simoleons (Sims)',
    symbol: '§',
    ratePerUsd: 10.0,
    format: (amt: number) => `§${Math.round(amt * 10).toLocaleString()} Simoleons`
  },
  DOGE: {
    code: 'DOGE',
    name: 'Dogecoin',
    symbol: 'Ð',
    ratePerUsd: 8.5,
    format: (amt: number) => `Ð${(amt * 8.5).toFixed(1)} DOGE`
  },
  RUPEE: {
    code: 'RUPEE',
    name: 'Indian Rupee',
    symbol: '₹',
    ratePerUsd: 85.0,
    format: (amt: number) => `₹${Math.round(amt * 85).toLocaleString()} INR`
  },
  GOLD: {
    code: 'GOLD',
    name: 'LitRPG Gold Coins',
    symbol: '🪙',
    ratePerUsd: 5.0,
    format: (amt: number) => `${Math.round(amt * 5).toLocaleString()} 🪙 Gold`
  }
};

export function formatCurrencyValue(usdAmount: number, currency: CurrencyCode = 'USD'): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  return config.format(usdAmount);
}

export interface TradeItem {
  id: string;
  title: string;
  tradeValueUsd: number;
  isAvailableForTrade?: boolean;
  category?: string;
  coverColor?: string;
}

export interface TradeCalculationResult {
  sideATotal: number;
  sideBTotal: number;
  differenceUsd: number;
  valueRatioPercent: number;
  fairnessStatus: 'EQUAL_FAIR' | 'SLIGHT_DISCREPANCY' | 'UNFAIR_DISCREPANCY';
  cashBalanceSuggestion: {
    debtorSide: 'Side A' | 'Side B' | 'None';
    amountUsd: number;
  };
}

export function isBookAvailableForTrade(book: Book): boolean {
  if (typeof book.isAvailableForTrade === 'boolean') {
    return book.isAvailableForTrade;
  }

  // Fallback to YAML frontmatter parsing
  const match = book.sidecarMarkdown.match(/available_for_trade:\s*(true|false)/i);
  if (match && match[1]) {
    return match[1].toLowerCase() === 'true';
  }

  return false;
}

export function toggleBookTradeAvailability(book: Book): Book {
  const current = isBookAvailableForTrade(book);
  const next = !current;

  let updatedSidecar = book.sidecarMarkdown;
  if (updatedSidecar.includes('available_for_trade:')) {
    updatedSidecar = updatedSidecar.replace(/available_for_trade:\s*(true|false)/i, `available_for_trade: ${next}`);
  } else if (updatedSidecar.startsWith('---')) {
    updatedSidecar = updatedSidecar.replace(/^---\n/, `---\navailable_for_trade: ${next}\n`);
  } else {
    updatedSidecar = `---\navailable_for_trade: ${next}\n---\n\n` + updatedSidecar;
  }

  return {
    ...book,
    isAvailableForTrade: next,
    sidecarMarkdown: updatedSidecar
  };
}

export function extractTradeValueFromBook(book: Book): number {
  if (typeof book.tradeValueUsd === 'number' && !isNaN(book.tradeValueUsd)) {
    return parseFloat(book.tradeValueUsd.toFixed(2));
  }

  // Fallback to YAML frontmatter parsing
  const match = book.sidecarMarkdown.match(/trade_value_usd:\s*([0-9.]+)/i);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) return parseFloat(val.toFixed(2));
  }

  // Fallback to price_usd or replacement_valuation_usd
  const priceMatch = book.sidecarMarkdown.match(/(?:price_usd|replacement_valuation_usd|estimated_value_usd):\s*([0-9.]+)/i);
  if (priceMatch && priceMatch[1]) {
    const val = parseFloat(priceMatch[1]);
    if (!isNaN(val)) return parseFloat(val.toFixed(2));
  }

  return 0.00;
}

export function updateBookTradeValue(book: Book, newValue: number): Book {
  const formattedVal = parseFloat(newValue.toFixed(2));
  let updatedSidecar = book.sidecarMarkdown;

  if (updatedSidecar.includes('trade_value_usd:')) {
    updatedSidecar = updatedSidecar.replace(/trade_value_usd:\s*[0-9.]+/i, `trade_value_usd: ${formattedVal.toFixed(2)}`);
  } else if (updatedSidecar.startsWith('---')) {
    updatedSidecar = updatedSidecar.replace(/^---\n/, `---\ntrade_value_usd: ${formattedVal.toFixed(2)}\n`);
  } else {
    updatedSidecar = `---\ntrade_value_usd: ${formattedVal.toFixed(2)}\n---\n\n` + updatedSidecar;
  }

  return {
    ...book,
    tradeValueUsd: formattedVal,
    sidecarMarkdown: updatedSidecar
  };
}

export function calculateTradeBalance(sideA: TradeItem[], sideB: TradeItem[]): TradeCalculationResult {
  const rawSideA = sideA.reduce((sum, item) => sum + (Number(item.tradeValueUsd) || 0), 0);
  const rawSideB = sideB.reduce((sum, item) => sum + (Number(item.tradeValueUsd) || 0), 0);

  const sideATotal = parseFloat(rawSideA.toFixed(2));
  const sideBTotal = parseFloat(rawSideB.toFixed(2));

  const diff = parseFloat(Math.abs(sideATotal - sideBTotal).toFixed(2));
  const maxTotal = Math.max(sideATotal, sideBTotal);
  const minTotal = Math.min(sideATotal, sideBTotal);

  const valueRatioPercent = maxTotal > 0 ? parseFloat(((minTotal / maxTotal) * 100).toFixed(1)) : 100.0;

  let fairnessStatus: 'EQUAL_FAIR' | 'SLIGHT_DISCREPANCY' | 'UNFAIR_DISCREPANCY' = 'EQUAL_FAIR';
  if (diff <= 5.00 || valueRatioPercent >= 95.0) {
    fairnessStatus = 'EQUAL_FAIR';
  } else if (valueRatioPercent >= 80.0) {
    fairnessStatus = 'SLIGHT_DISCREPANCY';
  } else {
    fairnessStatus = 'UNFAIR_DISCREPANCY';
  }

  let debtorSide: 'Side A' | 'Side B' | 'None' = 'None';
  if (sideATotal < sideBTotal) {
    debtorSide = 'Side A';
  } else if (sideBTotal < sideATotal) {
    debtorSide = 'Side B';
  }

  return {
    sideATotal,
    sideBTotal,
    differenceUsd: diff,
    valueRatioPercent,
    fairnessStatus,
    cashBalanceSuggestion: {
      debtorSide,
      amountUsd: diff
    }
  };
}
