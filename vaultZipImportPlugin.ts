import JSZip from 'jszip';
import type { Book, ResonanceEntry } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';

export interface VaultZipImportResult {
  books: Book[];
  manifest?: any;
  importedCount: number;
  mediaRestoredCount: number;
  rawFilenames: string[];
  cloudAccounts?: CloudAccount[];
  isPinProtected?: boolean;
  pinHint?: string;
  lockFileContent?: string;
}

/**
 * Parses markdown frontmatter and resonance stream quotes from a .companion.md file
 */
export function parseCompanionMarkdownToBook(
  markdownContent: string,
  fileName: string,
  mediaMap: Record<string, string> = {}
): Book {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdownContent.match(frontmatterRegex);

  let frontmatter: Record<string, string> = {};
  let body = markdownContent;

  if (match) {
    const rawFm = match[1];
    body = match[2];
    rawFm.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        frontmatter[key] = val;
      }
    });
  }

  const title = frontmatter['title'] || fileName.replace(/\.companion\.md$/i, '').replace(/_/g, ' ') || 'Untitled Vault Item';
  let author = frontmatter['author'] || 'Unknown Author';
  if (author.startsWith('[[') && author.endsWith(']]')) {
    author = author.slice(2, -2);
  }

  const coverImageRef = frontmatter['cover_image'] || frontmatter['cover_image_url'];
  const originalImageRef = frontmatter['original_uncropped_image'] || frontmatter['original_image_url'];

  // Resolve cover image from extracted media map if relative path like ./media/cover_foo.png
  let coverImageUrl = coverImageRef;
  if (coverImageRef) {
    const cleanKey = coverImageRef.replace(/^\.\/media\//, '').replace(/^media\//, '');
    if (mediaMap[cleanKey]) {
      coverImageUrl = mediaMap[cleanKey];
    }
  }

  let originalImageUrl = originalImageRef;
  if (originalImageRef) {
    const cleanKey = originalImageRef.replace(/^\.\/media\//, '').replace(/^media\//, '');
    if (mediaMap[cleanKey]) {
      originalImageUrl = mediaMap[cleanKey];
    }
  }

  // Parse resonance quotes from markdown body
  const resonanceStream: ResonanceEntry[] = [];
  const quoteRegex = /> \[!quote\] \*\*\[(.*?)\s*\|\s*(\d+)%\]\s*\[Category:\s*(.*?)\]\*\*\s*\n>\s*\*(.*?)\*\s*\n(?:>\s*-\s*Locator:\s*`?(.*?)`?\s*\n)?(?:>\s*-\s*Context:\s*"(.*?)"\s*)?/g;

  let qMatch;
  while ((qMatch = quoteRegex.exec(body)) !== null) {
    resonanceStream.push({
      id: `res-${Date.now()}-${resonanceStream.length}`,
      timestamp: new Date().toISOString(),
      formattedDate: qMatch[1] || new Date().toISOString().split('T')[0],
      progressPercent: parseInt(qMatch[2], 10) || 0,
      category: qMatch[3] || 'General',
      rawText: qMatch[4] || '',
      cfi: qMatch[5] || 'epubcfi(/6/2[ch1]!)',
      chapterTitle: 'Vault Record',
      paragraphIndex: 0,
      paragraphSnippet: qMatch[6] || ''
    });
  }

  // Parse standard markdown bullets if no callouts found
  if (resonanceStream.length === 0) {
    const bulletRegex = /- \*\*\[(.*?)\s*\|\s*(\d+)%\]\s*\[Category:\s*(.*?)\]\*\*\s*\*(.*?)\*/g;
    let bMatch;
    while ((bMatch = bulletRegex.exec(body)) !== null) {
      resonanceStream.push({
        id: `res-${Date.now()}-${resonanceStream.length}`,
        timestamp: new Date().toISOString(),
        formattedDate: bMatch[1] || new Date().toISOString().split('T')[0],
        progressPercent: parseInt(bMatch[2], 10) || 0,
        category: bMatch[3] || 'General',
        rawText: bMatch[4] || '',
        cfi: 'epubcfi(/6/2[ch1]!)',
        chapterTitle: 'Vault Record',
        paragraphIndex: 0,
        paragraphSnippet: ''
      });
    }
  }

  const tradeValueUsd = frontmatter['trade_value_usd'] ? parseFloat(frontmatter['trade_value_usd']) : 25.00;
  const isAvailableForTrade = frontmatter['is_available_for_trade'] === 'true' || true;

  return {
    id: `book-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title,
    author,
    coverColor: '#0f172a',
    coverImageUrl,
    originalImageUrl,
    totalChapters: 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    tradeValueUsd,
    isAvailableForTrade,
    sidecarMarkdown: markdownContent,
    resonanceStream,
    chapters: [
      {
        title: 'Chapter 1: Sovereign Vault Record',
        cfiBase: 'epubcfi(/6/2[ch1]!)',
        paragraphs: [body.slice(0, 300) || `Restored from vault archive ${fileName}.`]
      }
    ]
  };
}

/**
 * Imports a full Vault ZIP archive with /Sidecars/ and /media/ folders
 */
export async function importVaultZipArchive(zipFileOrBlob: Blob | File): Promise<VaultZipImportResult> {
  const zip = await JSZip.loadAsync(zipFileOrBlob);
  const mediaMap: Record<string, string> = {};
  const rawFilenames: string[] = [];
  let mediaRestoredCount = 0;

  // 1. Process /media/ folder first to create Object URLs for images
  const mediaEntries: { path: string; file: JSZip.JSZipObject }[] = [];
  zip.forEach((relativePath, file) => {
    rawFilenames.push(relativePath);
    if (!file.dir && (relativePath.startsWith('media/') || relativePath.includes('/media/'))) {
      mediaEntries.push({ path: relativePath, file });
    }
  });

  for (const { path, file } of mediaEntries) {
    try {
      const fileName = path.split('/').pop() || path;
      const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
      const blob = await file.async('blob');
      const typedBlob = new Blob([blob], { type: mimeType });
      
      // Convert to Base64 data URL for durable storage across reloads
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(typedBlob);
      });

      mediaMap[fileName] = dataUrl;
      mediaRestoredCount++;
    } catch (e) {
      console.warn('Failed to extract media item from ZIP:', path, e);
    }
  }

  // 2. Read optional manifest.json
  let manifest: any = null;
  const manifestFile = zip.file('manifest.json');
  if (manifestFile) {
    try {
      const jsonText = await manifestFile.async('text');
      manifest = JSON.parse(jsonText);
    } catch (e) {
      console.warn('Failed to parse manifest.json:', e);
    }
  }

  // 3. Read optional cloud_accounts.json
  let cloudAccounts: CloudAccount[] = [];
  const cloudAccountsFile = zip.file('cloud_accounts.json');
  if (cloudAccountsFile) {
    try {
      const jsonText = await cloudAccountsFile.async('text');
      cloudAccounts = JSON.parse(jsonText);
    } catch (e) {
      console.warn('Failed to parse cloud_accounts.json:', e);
    }
  }

  // 4. Check for optional PIN lockfile (.vault-session.lock)
  let lockFileContent: string | undefined;
  const lockFile = zip.file('.vault-session.lock');
  if (lockFile) {
    try {
      lockFileContent = await lockFile.async('text');
    } catch (e) {
      console.warn('Failed to read .vault-session.lock from ZIP:', e);
    }
  }

  const isPinProtected = Boolean(manifest?.is_pin_protected || lockFileContent);
  const pinHint = manifest?.pin_hint;

  // 5. Process all .companion.md or .md sidecar files
  const books: Book[] = [];
  const sidecarEntries: { path: string; file: JSZip.JSZipObject }[] = [];

  zip.forEach((relativePath, file) => {
    if (!file.dir && (relativePath.endsWith('.md') || relativePath.endsWith('.markdown'))) {
      sidecarEntries.push({ path: relativePath, file });
    }
  });

  for (const { path, file } of sidecarEntries) {
    try {
      const mdContent = await file.async('text');
      const fileName = path.split('/').pop() || path;
      const book = parseCompanionMarkdownToBook(mdContent, fileName, mediaMap);
      books.push(book);
    } catch (e) {
      console.warn('Failed to parse sidecar file:', path, e);
    }
  }

  return {
    books,
    manifest,
    importedCount: books.length,
    mediaRestoredCount,
    rawFilenames,
    cloudAccounts,
    isPinProtected,
    pinHint,
    lockFileContent
  };
}
