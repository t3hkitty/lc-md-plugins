import type { Book } from '../types/resonance';
import { scrapeNovelUpdatesMetadata } from './novelUpdatesPlugin';

export interface BackgroundSyncStatus {
  isIdle: boolean;
  isProcessing: boolean;
  totalEnriched: number;
  lastEnrichedTitle?: string;
  pendingCount: number;
}

/**
 * Checks if a book needs background metadata enrichment.
 */
export function needsMetadataEnrichment(book: Book): boolean {
  // If book doesn't have novel_updates rating, or missing word count, or missing completion status
  const hasNovelUpdates = book.sidecarMarkdown.includes('novel_updates:');
  const hasTags = book.sidecarMarkdown.includes('tags:');
  const hasStats = book.sidecarMarkdown.includes('word_count:');
  return !hasNovelUpdates || !hasTags || !hasStats;
}

/**
 * Enriches a single book's sidecar metadata in the background.
 */
export function enrichBookMetadata(book: Book): Book {
  let md = book.sidecarMarkdown;

  // 1. Calculate word count & reading time
  const totalWords = book.chapters.reduce((acc, ch) => {
    return acc + ch.paragraphs.reduce((pAcc, p) => pAcc + p.split(/\s+/).length, 0);
  }, 0);
  const readingTimeMin = Math.ceil(totalWords / 200);

  // 2. Scrape NovelUpdates metadata
  const nuData = scrapeNovelUpdatesMetadata(book.title);

  // 3. Inject missing YAML frontmatter stats
  if (!md.includes('word_count:')) {
    const statsYaml = `word_count: ${totalWords}\nreading_time_minutes: ${readingTimeMin}\n`;
    md = md.replace(/---\n/, `---\n${statsYaml}`);
  }

  if (!md.includes('novel_updates:')) {
    const nuBlock = `novel_updates:\n  rating: ${nuData.rating}\n  publisher: "${nuData.originalPublisher}"\n  coo_status: "${nuData.statusInCOO}"\n  translation_status: "${nuData.translationStatus}"\n  webnovel_state: "${nuData.webnovelState}"\n  url: "${nuData.novelUpdatesUrl}"\n`;
    md = md.replace(/---\n/, `---\n${nuBlock}`);
  }

  // 4. Ensure tags are populated
  if (!md.includes('tags:')) {
    const autoTags = Array.from(new Set(['sovereign', 'webdav', ...nuData.tags]));
    const tagsLine = `tags: [${autoTags.map(t => `"${t}"`).join(', ')}]`;
    md += `\n${tagsLine}\n`;
  }

  return {
    ...book,
    sidecarMarkdown: md,
    isWebPresenceOnly: book.isWebPresenceOnly ?? (nuData.translationStatus === 'Ongoing')
  };
}
