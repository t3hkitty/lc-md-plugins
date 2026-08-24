/**
 * Sovereign Vault Session Lock & Local Folder PIN Protection Plugin
 * Securely seals and restores session state in a local directory using a PIN-protected lockfile (.vault-session.lock).
 */

export interface VaultLockFilePayload {
  version: '1.0';
  created_at: string;
  vault_name: string;
  salt_hex: string;
  pin_hash_hex: string; // PBKDF2-derived verification hash
  encrypted_session?: string; // AES-GCM encrypted session state
  iv_hex?: string;
  total_books: number;
  active_book_id?: string;
}

export interface RestoredVaultSession {
  books: any[];
  activeBookId?: string;
  vaultName: string;
  restoredAt: string;
}

/**
 * Derives a cryptographic hash from a user PIN using Web Crypto PBKDF2
 */
export async function derivePinKey(pin: string, salt: Uint8Array): Promise<{ hashHex: string; cryptoKey: CryptoKey }> {
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Compute a verification digest
  const exported = await crypto.subtle.exportKey('raw', derivedKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', exported);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return { hashHex, cryptoKey: derivedKey };
}

/**
 * Creates a `.vault-session.lock` payload for a local folder
 */
export async function createVaultLockPayload(
  pin: string,
  sessionData: { books: any[]; activeBookId?: string; vaultName?: string; cloudAccounts?: any[] }
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  const { hashHex, cryptoKey } = await derivePinKey(pin, salt);

  // Encrypt session data with AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

  const encoder = new TextEncoder();
  const rawSessionJson = JSON.stringify(sessionData);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(rawSessionJson)
  );

  const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
  const encryptedHex = encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const lockPayload: VaultLockFilePayload = {
    version: '1.0',
    created_at: new Date().toISOString(),
    vault_name: sessionData.vaultName || 'Sovereign Companion Vault',
    salt_hex: saltHex,
    pin_hash_hex: hashHex,
    encrypted_session: encryptedHex,
    iv_hex: ivHex,
    total_books: sessionData.books.length,
    active_book_id: sessionData.activeBookId
  };

  return JSON.stringify(lockPayload, null, 2);
}

/**
 * Validates a PIN and decrypts session data from a lock file payload
 */
export async function verifyAndUnlockVaultSession(
  lockJson: string,
  pin: string
): Promise<{ success: boolean; sessionData?: any; error?: string }> {
  try {
    const lockPayload: VaultLockFilePayload = JSON.parse(lockJson);

    if (!lockPayload.salt_hex || !lockPayload.pin_hash_hex) {
      return { success: false, error: 'Invalid lockfile format: missing cryptographic verification tokens.' };
    }

    // Convert salt hex to Uint8Array
    const salt = new Uint8Array(
      lockPayload.salt_hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const { hashHex, cryptoKey } = await derivePinKey(pin, salt);

    if (hashHex !== lockPayload.pin_hash_hex) {
      return { success: false, error: 'Incorrect PIN. Session unlock denied.' };
    }

    // If encrypted session data exists, decrypt it
    if (lockPayload.encrypted_session && lockPayload.iv_hex) {
      const iv = new Uint8Array(
        lockPayload.iv_hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      const encryptedBytes = new Uint8Array(
        lockPayload.encrypted_session.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encryptedBytes
      );

      const decoder = new TextDecoder();
      const sessionJson = decoder.decode(decryptedBuffer);
      const sessionData = JSON.parse(sessionJson);

      return { success: true, sessionData };
    }

    return {
      success: true,
      sessionData: {
        totalBooks: lockPayload.total_books,
        activeBookId: lockPayload.active_book_id,
        vaultName: lockPayload.vault_name
      }
    };
  } catch (err: any) {
    return { success: false, error: `Decryption failed: ${err?.message || 'Corrupted lock file.'}` };
  }
}
