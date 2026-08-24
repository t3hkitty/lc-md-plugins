import type { Book } from '../types/resonance';
import { SAMPLE_BOOKS } from '../data/sampleBooks';

export type VaultMode = 'personal' | 'sandbox';

const PERSONAL_VAULT_KEY = 'lc_md_books_personal_v3';
const SANDBOX_VAULT_KEY = 'lc_md_books_sandbox_v3';
const ACTIVE_VAULT_MODE_KEY = 'lc_md_active_vault_mode_v3';

/**
 * Gets the saved active vault mode from localStorage
 */
export function getSavedVaultMode(): VaultMode {
  if (typeof window === 'undefined') return 'sandbox';
  const saved = localStorage.getItem(ACTIVE_VAULT_MODE_KEY);
  return (saved === 'personal' || saved === 'sandbox') ? saved : 'sandbox';
}

/**
 * Saves the active vault mode to localStorage
 */
export function saveVaultMode(mode: VaultMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_VAULT_MODE_KEY, mode);
}

/**
 * Loads books for the specified vault mode
 */
export function loadBooksForVault(mode: VaultMode): Book[] {
  if (typeof window === 'undefined') return SAMPLE_BOOKS;
  
  const key = mode === 'personal' ? PERSONAL_VAULT_KEY : SANDBOX_VAULT_KEY;
  const raw = localStorage.getItem(key);
  
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }

  // If loading sandbox vault for first time, initialize with rich sample collection
  if (mode === 'sandbox') {
    saveBooksForVault('sandbox', SAMPLE_BOOKS);
    return SAMPLE_BOOKS;
  }

  return [];
}

/**
 * Saves books for the specified vault mode
 */
export function saveBooksForVault(mode: VaultMode, books: Book[]): void {
  if (typeof window === 'undefined') return;
  const key = mode === 'personal' ? PERSONAL_VAULT_KEY : SANDBOX_VAULT_KEY;
  localStorage.setItem(key, JSON.stringify(books));
}

/**
 * Resets the Sandbox Demo Vault back to default examples including Green Day album,
 * sample LitRPG/Danmei books, memes, and TCG treasures.
 */
export function resetSandboxVault(): Book[] {
  saveBooksForVault('sandbox', SAMPLE_BOOKS);
  return SAMPLE_BOOKS;
}
