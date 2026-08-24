import type { Book } from '../types/resonance';

export interface InboundSharePayload {
  title?: string;
  text?: string;
  url?: string;
}

export function parseInboundShareTarget(): InboundSharePayload | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const shareTitle = params.get('share_title') || params.get('title');
  const shareText = params.get('share_text') || params.get('text');
  const shareUrl = params.get('share_url') || params.get('url');

  if (!shareTitle && !shareText && !shareUrl) {
    return null;
  }

  return {
    title: shareTitle || undefined,
    text: shareText || undefined,
    url: shareUrl || undefined
  };
}

export function convertSharePayloadToBook(payload: InboundSharePayload): Book {
  // Extract URL from text if URL param was empty
  let sourceUrl = payload.url || '';
  if (!sourceUrl && payload.text && payload.text.includes('http')) {
    const match = payload.text.match(/https?:\/\/[^\s]+/);
    if (match) sourceUrl = match[0];
  }

  // Derive a clean title
  let title = (payload.title || '').trim();
  if (!title && payload.text) {
    // Take the first line or first sentence
    const cleanText = payload.text.replace(sourceUrl, '').trim();
    title = cleanText.split('\n')[0].split('.')[0].trim();
  }
  if (!title && sourceUrl) {
    // Derive from URL
    try {
      const parsed = new URL(sourceUrl);
      title = parsed.pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || parsed.hostname;
    } catch {
      title = 'Shared Mobile Article';
    }
  }
  if (!title) {
    title = `Mobile Share Intake (${new Date().toLocaleDateString()})`;
  }

  // Capitalize title
  title = title.replace(/\b\w/g, c => c.toUpperCase());

  const isGoodreads = sourceUrl.includes('goodreads.com');
  const isNovelUpdates = sourceUrl.includes('novelupdates.com');
  const format = isGoodreads ? 'dcmd/goodreads' : isNovelUpdates ? 'dcmd/webnovel' : 'dcmd/mobile-share';
  const author = isGoodreads ? 'Goodreads Author' : isNovelUpdates ? 'Webnovel Author' : 'Mobile Web Sourcing';

  const bookId = `mobile-share-${Date.now()}`;

  const sidecarMarkdown = `---
title: "${title}"
author: "${author}"
source_url: "${sourceUrl}"
format: "${format}"
shared_at: "${new Date().toISOString()}"
sovereign_storage: "local"
---

# ${title}

- **Source URL:** [${sourceUrl}](${sourceUrl})
- **Received via:** Mobile Web Share Target PWA
- **Shared Date:** ${new Date().toLocaleDateString()}

### 📝 Shared Notes & Snippets
${payload.text ? `> ${payload.text}` : 'Shared from mobile browser share sheet directly to Sovereign Vault.'}
`;

  return {
    id: bookId,
    title,
    author,
    coverColor: '#0284c7',
    totalChapters: 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: true,
    tradeValueUsd: 15.00,
    isAvailableForTrade: true,
    sidecarMarkdown,
    resonanceStream: [
      {
        id: `res-${bookId}-1`,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString(),
        progressPercent: 100,
        category: 'Mobile Share Sheet',
        rawText: payload.text || `Shared URL: ${sourceUrl}`,
        cfi: 'mobile-share:root',
        chapterTitle: 'Shared Content',
        paragraphIndex: 0,
        paragraphSnippet: payload.text || sourceUrl
      }
    ],
    chapters: [
      {
        title: 'Chapter 1: Shared Web Content',
        cfiBase: 'epubcfi(/6/2[ch1]!)',
        paragraphs: [
          `Title: ${title}`,
          `URL: ${sourceUrl}`,
          payload.text || 'Imported via native Mobile Share Target.'
        ]
      }
    ]
  };
}

export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}
