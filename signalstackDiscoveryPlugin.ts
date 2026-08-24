/**
 * SignalStack Discovery Engine Plugin
 * - Keyword Subscriptions
 * - One Shade Off Lateral Expansion
 * - Directly generates LCMD Sidecar `.companion.md` data structures
 */

import type { Book } from '../types/resonance';

export interface KeywordSubscription {
  keyword: string;
  tags: string[];
}

export const DEFAULT_KEYWORD_SUBSCRIPTIONS: KeywordSubscription[] = [
  { keyword: "Zettelkasten", tags: ["#pkm", "#zettelkasten", "#lcmd"] },
  { keyword: "Distributed Systems", tags: ["#engineering", "#systems", "#architecture"] },
  { keyword: "Webnovel Archiving", tags: ["#media", "#calibre", "#preservation"] },
  { keyword: "Tactile Audio Synthesis", tags: ["#synth", "#sound-design", "#hardware"] }
];

export const LATERAL_EXPANSION_DICTIONARY: Record<string, string> = {
  "distributed systems": "Cellular Automata & Biological Consensus",
  "zettelkasten": "Spatial Memory & Hypercard Archaeology",
  "webnovel archiving": "Typography Standards in EPUB3 Open Readers",
  "tactile audio synthesis": "Granular Synthesis & Micro-Acoustic Physics"
};

export function getLateralPivot(keyword: string): string {
  return LATERAL_EXPANSION_DICTIONARY[keyword.toLowerCase()] || "Adjacent Domain Exploration";
}

export interface DiscoveryFeedItem {
  title: string;
  source: string;
  url: string;
  content: string;
}

export function processDiscoveryFeedIntoBooks(feed: DiscoveryFeedItem[], subs = DEFAULT_KEYWORD_SUBSCRIPTIONS): Book[] {
  return feed.map((item, idx) => {
    const matchedSub = subs.find(sub => 
      item.title.toLowerCase().includes(sub.keyword.toLowerCase()) ||
      item.content.toLowerCase().includes(sub.keyword.toLowerCase())
    ) || subs[0];

    const lateralTopic = getLateralPivot(matchedSub.keyword);
    const timestamp = new Date().toISOString();
    
    // Create a synthesized LCMD Book/Sidecar object
    return {
      id: `signalstack-${Date.now()}-${idx}`,
      title: item.title,
      author: item.source,
      coverUrl: '', 
      filePath: item.url,
      fileType: 'url',
      genre: "Discovery Feed",
      tags: ["#SignalStack", "#DiscoveryEngine", ...matchedSub.tags],
      dateAdded: timestamp,
      lastRead: timestamp,
      rating: 0,
      readStatus: 'unread',
      isPubliclyShared: false,
      price: 0,
      customMetadata: {
        subscription_keyword: matchedSub.keyword,
        lateral_expansion: lateralTopic,
        snippet: item.content
      }
    };
  });
}
