import type { Book } from '../types/resonance';
import { SAMPLE_BOOKS } from '../data/sampleBooks';

export const DEFAULT_SIDECAR_PRICE_KEY = 'library_default_sidecar_price_usd';
export const FALLBACK_DEFAULT_PRICE_USD = 0.01; // 1 cent default ($0.01 USD)

/**
 * Loads the user's configured default price for new sidecars and digital files
 */
export function getDefaultSidecarPrice(): number {
  if (typeof window === 'undefined') return FALLBACK_DEFAULT_PRICE_USD;
  const saved = localStorage.getItem(DEFAULT_SIDECAR_PRICE_KEY);
  if (saved !== null) {
    const val = parseFloat(saved);
    if (!isNaN(val) && val >= 0) return val;
  }
  return FALLBACK_DEFAULT_PRICE_USD;
}

/**
 * Saves the user's configured default sidecar price (e.g. 0.01, 0.05)
 */
export function setDefaultSidecarPrice(price: number): void {
  if (typeof window === 'undefined') return;
  const normalized = Math.max(0, price);
  localStorage.setItem(DEFAULT_SIDECAR_PRICE_KEY, normalized.toString());
}

/**
 * Applies a price to a Book object and updates its YAML frontmatter & markdown
 */
export function applyPriceToBook(book: Book, priceUsd: number): Book {
  const formattedPrice = priceUsd.toFixed(2);
  let updatedMarkdown = book.sidecarMarkdown;

  // Update or insert fair_trade_valuation_usd in YAML frontmatter
  if (updatedMarkdown.includes('fair_trade_valuation_usd:')) {
    updatedMarkdown = updatedMarkdown.replace(
      /fair_trade_valuation_usd:\s*"?[^"\n]+"?/,
      `fair_trade_valuation_usd: "${formattedPrice}"`
    );
  } else if (updatedMarkdown.includes('trade_value_usd:')) {
    updatedMarkdown = updatedMarkdown.replace(
      /trade_value_usd:\s*"?[^"\n]+"?/,
      `trade_value_usd: "${formattedPrice}"`
    );
  } else if (updatedMarkdown.startsWith('---')) {
    // Insert into existing frontmatter
    updatedMarkdown = updatedMarkdown.replace(
      /^---\n/,
      `---\nfair_trade_valuation_usd: "${formattedPrice}"\ndefault_file_price_usd: "${formattedPrice}"\n`
    );
  }

  // Update markdown body price mentions
  if (updatedMarkdown.includes('Replacement & Valuation:') || updatedMarkdown.includes('Trade Valuation:')) {
    updatedMarkdown = updatedMarkdown.replace(
      /(?:Replacement & Valuation|Trade Valuation):\s*\*\*?\$[0-9.,]+\s*USD\*\*?/g,
      `Trade Valuation: **$${formattedPrice} USD**`
    );
  }

  return {
    ...book,
    tradeValueUsd: priceUsd,
    sidecarMarkdown: updatedMarkdown
  };
}

/**
 * Returns a fresh clone of sample books populated with the specified default price
 */
export function getSampleBooksWithPrice(priceUsd: number = getDefaultSidecarPrice()): Book[] {
  return SAMPLE_BOOKS.map(sample => {
    return applyPriceToBook(JSON.parse(JSON.stringify(sample)), priceUsd);
  });
}
