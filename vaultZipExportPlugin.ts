import JSZip from 'jszip';
import type { Book } from '../types/resonance';
import type { MediaItem } from '../types/mediaTypes';
import type { CloudAccount } from '../types/cloudAccounts';
import { slugifyTitle } from './zettelkastenSerialPlugin';
import { createVaultLockPayload } from './vaultSessionLockPlugin';

/**
 * Exports the entire Sovereign Vault as a structured ZIP archive
 * with a separate /media/ folder containing all cropped card covers, 
 * uncropped original full-size sheet uploads, reaction attachments,
 * optional cloud accounts configuration, and embedded PIN lockfile.
 */
export async function exportVaultZipWithMedia(
  books: Book[],
  mediaItems: MediaItem[] = [],
  cloudAccounts: CloudAccount[] = [],
  zipPin?: string
): Promise<Blob> {
  const zip = new JSZip();

  const sidecarsFolder = zip.folder('Sidecars') || zip;
  const mediaFolder = zip.folder('media') || zip;

  const manifest = {
    vault_version: '3.8',
    exported_at: new Date().toISOString(),
    total_items: books.length,
    media_count: 0,
    cloud_accounts_count: cloudAccounts.length,
    is_pin_protected: Boolean(zipPin && zipPin.trim()),
    pin_hint: zipPin && zipPin.trim() ? `${zipPin.slice(0, 1)}•••` : undefined,
    items: [] as any[]
  };

  let mediaCount = 0;

  for (const book of books) {
    const slug = slugifyTitle(book.title);
    const mdFileName = `${slug}.companion.md`;

    // 1. Process Cropped Cover Image if present
    let coverRelPath: string | undefined;
    if (book.coverImageUrl) {
      mediaCount++;
      const coverExt = book.coverImageUrl.startsWith('data:image/png') ? 'png' : 'jpg';
      const coverFileName = `cover_${slug}.${coverExt}`;
      coverRelPath = `./media/${coverFileName}`;

      if (book.coverImageUrl.startsWith('data:')) {
        const base64Data = book.coverImageUrl.split(',')[1];
        if (base64Data) {
          mediaFolder.file(coverFileName, base64Data, { base64: true });
        }
      } else {
        // Fetch or create placeholder buffer
        try {
          const resp = await fetch(book.coverImageUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            mediaFolder.file(coverFileName, blob);
          }
        } catch {
          // fallback
        }
      }
    }

    // 2. Process Original Uncropped Image if present
    let originalRelPath: string | undefined;
    if (book.originalImageUrl) {
      mediaCount++;
      const origExt = book.originalImageUrl.startsWith('data:image/png') ? 'png' : 'jpg';
      const origFileName = `uncropped_${slug}.${origExt}`;
      originalRelPath = `./media/${origFileName}`;

      if (book.originalImageUrl.startsWith('data:')) {
        const base64Data = book.originalImageUrl.split(',')[1];
        if (base64Data) {
          mediaFolder.file(origFileName, base64Data, { base64: true });
        }
      } else {
        try {
          const resp = await fetch(book.originalImageUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            mediaFolder.file(origFileName, blob);
          }
        } catch {
          // fallback
        }
      }
    }

    // 3. Inject media paths into markdown frontmatter if not already present
    let finalMarkdown = book.sidecarMarkdown;
    if (coverRelPath && !finalMarkdown.includes('cover_image:')) {
      finalMarkdown = finalMarkdown.replace(
        /---\s*\n/,
        `---\ncover_image: "${coverRelPath}"\n`
      );
    }
    if (originalRelPath && !finalMarkdown.includes('original_uncropped_image:')) {
      finalMarkdown = finalMarkdown.replace(
        /---\s*\n/,
        `---\noriginal_uncropped_image: "${originalRelPath}"\n`
      );
    }

    sidecarsFolder.file(mdFileName, finalMarkdown);

    manifest.items.push({
      id: book.id,
      title: book.title,
      author: book.author,
      sidecar_file: `Sidecars/${mdFileName}`,
      cover_image: coverRelPath,
      original_uncropped_image: originalRelPath,
      trade_value_usd: book.tradeValueUsd,
      is_available_for_trade: book.isAvailableForTrade,
      reactions_count: book.resonanceStream.length
    });
  }

  // Process any external media items if present
  for (const item of mediaItems) {
    if (item.sidecarMdPath) {
      manifest.items.push({
        id: item.id,
        title: item.title,
        creator: item.creator,
        mediaType: item.mediaType,
        serialCode: item.serialCode,
        sidecar_file: item.sidecarMdPath
      });
    }
  }

  manifest.media_count = mediaCount;
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Include Cloud Accounts Configuration
  if (cloudAccounts && cloudAccounts.length > 0) {
    zip.file('cloud_accounts.json', JSON.stringify(cloudAccounts, null, 2));
  }

  // Include PIN-protected session lockfile if PIN specified
  if (zipPin && zipPin.trim()) {
    try {
      const lockPayload = await createVaultLockPayload(zipPin.trim(), {
        books,
        cloudAccounts,
        vaultName: 'Sovereign Vault Archive'
      });
      zip.file('.vault-session.lock', lockPayload);
    } catch (e) {
      console.warn('Failed to embed .vault-session.lock in ZIP:', e);
    }
  }

  // Generate ZIP Blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}
