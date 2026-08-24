import type { Book } from '../types/resonance';

export type BreakStreamPlatform = 'whatnot' | 'twitch' | 'youtube' | 'tiktok' | 'kick' | 'loupe' | 'custom';

export interface TcgBreakFeedEntry {
  id: string;
  cardTitle: string;
  streamerName: string;
  platform: BreakStreamPlatform;
  streamUrl: string;
  clipTimestampUrl?: string;
  pullTimestamp: string;
  breakType: 'Vintage Box Break' | 'Case Break' | 'Personal Pack' | 'Team Random' | 'Bounty Hunt';
  boxSerial?: string;
  isLiveNow?: boolean;
  notes?: string;
}

export const SAMPLE_BREAK_FEEDS: TcgBreakFeedEntry[] = [
  {
    id: 'break-1',
    cardTitle: '1st Edition Shadowless Charizard Holo #4',
    streamerName: '@GrailRipKits',
    platform: 'twitch',
    streamUrl: 'https://twitch.tv/grailripkits',
    clipTimestampUrl: 'https://twitch.tv/videos/189283749?t=01h34m12s',
    pullTimestamp: '2026-08-17 14:22:00',
    breakType: 'Vintage Box Break',
    boxSerial: 'WOTC-BOX-99120',
    isLiveNow: true,
    notes: 'Pulled live from pack #18 on stream! Gem Mint pack-fresh centering.'
  },
  {
    id: 'break-2',
    cardTitle: 'Black Lotus (Beta Edition) BGS 9.5',
    streamerName: '@VintageManaBreaks',
    platform: 'whatnot',
    streamUrl: 'https://whatnot.com/live/vintagemanabreaks',
    clipTimestampUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=45s',
    pullTimestamp: '2026-08-16 20:10:00',
    breakType: 'Case Break',
    boxSerial: 'MTG-BETA-CASE-004',
    isLiveNow: false,
    notes: 'Historic pull! Verified on stream live.'
  },
  {
    id: 'break-3',
    cardTitle: 'Pikachu Illustrator Promo (CoroCoro)',
    streamerName: '@TokyoCardHub',
    platform: 'youtube',
    streamUrl: 'https://youtube.com/@TokyoCardHub/live',
    clipTimestampUrl: 'https://youtube.com/watch?v=sample123&t=12m30s',
    pullTimestamp: '2026-08-17 18:00:00',
    breakType: 'Bounty Hunt',
    boxSerial: 'CORO-JAP-98',
    isLiveNow: true,
    notes: 'Live stream bounty claim with 12,000 live viewers.'
  }
];

export function extractBreakFeedFromBook(book: Book): TcgBreakFeedEntry | null {
  const match = book.sidecarMarkdown.match(/break_feed:\s*\n([\s\S]*?)(?=\n[a-z_]+:|\n---|\n##|$)/i);
  if (!match || !match[1]) return null;

  const block = match[1];
  const streamer = block.match(/streamer_name:\s*["']?([^"'\n]+)["']?/i)?.[1] || '@LiveBreaker';
  const platform = (block.match(/stream_platform:\s*["']?([^"'\n]+)["']?/i)?.[1] || 'twitch') as BreakStreamPlatform;
  const streamUrl = block.match(/stream_url:\s*["']?([^"'\n]+)["']?/i)?.[1] || '';
  const clipUrl = block.match(/clip_timestamp_url:\s*["']?([^"'\n]+)["']?/i)?.[1] || '';
  const pullTime = block.match(/pull_timestamp:\s*["']?([^"'\n]+)["']?/i)?.[1] || new Date().toISOString();
  const breakType = (block.match(/break_type:\s*["']?([^"'\n]+)["']?/i)?.[1] || 'Vintage Box Break') as TcgBreakFeedEntry['breakType'];
  const boxSerial = block.match(/box_serial:\s*["']?([^"'\n]+)["']?/i)?.[1] || '';

  return {
    id: `break-${book.id}`,
    cardTitle: book.title,
    streamerName: streamer,
    platform,
    streamUrl,
    clipTimestampUrl: clipUrl,
    pullTimestamp: pullTime,
    breakType,
    boxSerial,
    isLiveNow: false
  };
}

export function attachBreakFeedToBook(book: Book, feed: TcgBreakFeedEntry): Book {
  const yamlBreak = `break_feed:
  stream_platform: "${feed.platform}"
  streamer_name: "${feed.streamerName}"
  stream_url: "${feed.streamUrl}"
  clip_timestamp_url: "${feed.clipTimestampUrl || ''}"
  pull_timestamp: "${feed.pullTimestamp}"
  break_type: "${feed.breakType}"
  box_serial: "${feed.boxSerial || ''}"`;

  let updatedSidecar = book.sidecarMarkdown;

  if (updatedSidecar.includes('break_feed:')) {
    updatedSidecar = updatedSidecar.replace(/break_feed:\s*\n[\s\S]*?(?=\n[a-z_]+:|\n---|\n##|$)/i, yamlBreak);
  } else if (updatedSidecar.startsWith('---')) {
    updatedSidecar = updatedSidecar.replace(/^---\n/, `---\n${yamlBreak}\n`);
  } else {
    updatedSidecar = `---\n${yamlBreak}\n---\n\n` + updatedSidecar;
  }

  return {
    ...book,
    sidecarMarkdown: updatedSidecar
  };
}
