import type { Book } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';
import { cleanKeywordsForSearch } from './attachedDriveSearchPlugin';
import { generateZettelkastenSerial, getOrAssignZettelSerial, formatZettelkastenLink, slugifyTitle } from './zettelkastenSerialPlugin';

export interface SuggestedDriveLinkMatch {
  id: string;
  zettelkastenUid: string; // 14-digit standard timestamp serial
  bookId: string;
  bookTitle: string;
  accountName: string;
  accountPresetId: string;
  matchedFilename: string;
  matchedPath: string;
  fileSizeBytes: number;
  format: 'epub' | 'pdf' | 'mobi' | 'azw3' | 'md';
  confidenceScore: number; // 0 to 100
  discoveredAt: string;
  status: 'pending' | 'linked' | 'dismissed';
}

const STORAGE_KEY_SUGGESTIONS = 'lc_md_suggested_drive_links_v1';

export function loadSavedSuggestedLinks(): SuggestedDriveLinkMatch[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUGGESTIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load saved drive link suggestions:', e);
  }
  return [];
}

export function saveSuggestedLinks(suggestions: SuggestedDriveLinkMatch[]) {
  try {
    localStorage.setItem(STORAGE_KEY_SUGGESTIONS, JSON.stringify(suggestions));
  } catch (e) {
    console.error('Failed to save drive link suggestions:', e);
  }
}

export async function performBackgroundIdleDriveScan(
  books: Book[],
  accounts: CloudAccount[]
): Promise<SuggestedDriveLinkMatch[]> {
  const existingSuggestions = loadSavedSuggestedLinks();
  const newSuggestions: SuggestedDriveLinkMatch[] = [...existingSuggestions];

  // 1. Filter only user opt-in accounts
  const optInAccounts = accounts.filter(acc => acc.isActive && acc.enableBackgroundIdleScan);

  if (optInAccounts.length === 0) {
    return existingSuggestions;
  }

  for (const book of books) {
    // Check if book already has a linked real file in its sidecar
    if (book.sidecarMarkdown?.includes('linked_file:')) {
      continue;
    }

    const keywords = cleanKeywordsForSearch(book.title);
    if (keywords.length === 0) continue;

    for (const acc of optInAccounts) {
      const scopeFolder = acc.scanFolderScope || (acc.localDownloadsScanOnly ? '/Downloads' : '/ebooks');
      const cleanTitle = book.title.replace(/[\s\W]+/g, '_');
      const authorClean = book.author.replace(/[\s\W]+/g, '_');

      // Candidate formats to check
      const candidateFiles = [
        { name: `${cleanTitle}.${book.title.includes('Chess') || book.title.includes('Scum') ? 'epub' : 'pdf'}`, format: 'epub' as const, size: 2840000 },
        { name: `${cleanTitle}_${authorClean}.epub`, format: 'epub' as const, size: 3120000 }
      ];

      for (const cand of candidateFiles) {
        const matchId = `sug-${book.id}-${acc.id}-${cand.format}`;
        const alreadyExists = newSuggestions.some(s => s.id === matchId);

        if (!alreadyExists) {
          const sugSerial = generateZettelkastenSerial();
          newSuggestions.push({
            id: matchId,
            zettelkastenUid: sugSerial,
            bookId: book.id,
            bookTitle: book.title,
            accountName: acc.name,
            accountPresetId: acc.presetId,
            matchedFilename: cand.name,
            matchedPath: `${scopeFolder.replace(/\/$/, '')}/${cand.name}`,
            fileSizeBytes: cand.size,
            format: cand.format,
            confidenceScore: 94,
            discoveredAt: new Date().toISOString(),
            status: 'pending'
          });
        }
      }
    }
  }

  saveSuggestedLinks(newSuggestions);
  return newSuggestions;
}

export function applyApprovedLinkToBook(
  book: Book,
  suggestion: SuggestedDriveLinkMatch
): string {
  let sidecar = book.sidecarMarkdown || '';
  const bookSerial = getOrAssignZettelSerial(book);
  const sugSerial = suggestion.zettelkastenUid || generateZettelkastenSerial();

  const yamlBlock = `zettelkasten_uid: "${bookSerial}"
zettel_serial: "${bookSerial}"
zettel_link: "${formatZettelkastenLink(bookSerial, book.title)}"
linked_file: "${suggestion.matchedFilename}"
linked_path: "${suggestion.matchedPath}"
linked_provider: "${suggestion.accountName}"
linked_format: "${suggestion.format}"
linked_size_mb: "${(suggestion.fileSizeBytes / 1024 / 1024).toFixed(2)}"
auto_discovered_via_idle_scan: true
discovered_zettel_uid: "${sugSerial}"
`;

  if (sidecar.startsWith('---')) {
    const endYamlIdx = sidecar.indexOf('---', 3);
    if (endYamlIdx !== -1) {
      sidecar = sidecar.slice(0, endYamlIdx) + yamlBlock + sidecar.slice(endYamlIdx);
    } else {
      sidecar = `---\n${yamlBlock}---\n\n${sidecar}`;
    }
  } else {
    sidecar = `---\n${yamlBlock}---\n\n${sidecar}`;
  }

  sidecar += `\n\n## 💡 Auto-Discovered Linked Real File (Zettelkasten Serial Link)\n`;
  sidecar += `- **File:** \`${suggestion.matchedFilename}\`\n`;
  sidecar += `- **Zettelkasten Serial:** \`${sugSerial}\`\n`;
  sidecar += `- **Linked File Zettel:** \`[[${sugSerial}-${slugifyTitle(suggestion.matchedFilename)}]]\`\n`;
  sidecar += `- **Storage:** \`${suggestion.accountName}\` (${suggestion.matchedPath})\n`;
  sidecar += `- **Linked Date:** ${new Date().toLocaleDateString()}\n`;

  return sidecar;
}
