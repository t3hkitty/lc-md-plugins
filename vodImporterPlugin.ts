/**
 * Sovereign VOD & Video Stream Companion Plugin
 * Catalogs YouTube, Twitch, Kick, and Live Streams into sovereign markdown companion notes
 * with native 1-click timestamp jump links that open directly in the official player.
 */

import type { Book, ResonanceEntry } from '../types/resonance';
import { generateZettelkastenSerial } from './zettelkastenSerialPlugin';

export type VodPlatform = 'youtube' | 'twitch' | 'kick' | 'vimeo' | 'torbox' | 'direct_stream' | 'local_mp4';

export interface VodChapter {
  timestampSeconds: number;
  timestampFormatted: string; // e.g. "01:24:15"
  title: string;
  notes?: string;
  nativeJumpUrl?: string;
}

export interface VodMetadataInput {
  url: string;
  title: string;
  creator: string;
  platform: VodPlatform;
  durationFormatted?: string;
  resolution?: string;
  thumbnailUrl?: string;
  description?: string;
  rawTimestampsText?: string;
  tags?: string[];
  torboxFileId?: string;
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatSecondsToTimestamp(totalSecs: number): string {
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Parses timestamp string "01:24:15" or "12:30" into total seconds
 */
export function parseTimestampToSeconds(ts: string): number {
  const parts = ts.trim().split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Generates official native deep-link jumping directly to the timestamp on Twitch/YouTube/Kick
 */
export function buildNativeTimestampJumpUrl(baseUrl: string, platform: VodPlatform, totalSeconds: number): string {
  const cleanUrl = baseUrl.trim();
  if (platform === 'twitch') {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const twitchTime = (hours > 0 ? `${hours}h` : '') + (mins > 0 || hours > 0 ? `${mins}m` : '') + `${secs}s`;
    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl.split('?t=')[0].split('&t=')[0]}${separator}t=${twitchTime}`;
  }

  if (platform === 'youtube') {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl.split('?t=')[0].split('&t=')[0]}${separator}t=${totalSeconds}s`;
  }

  return `${cleanUrl}#t=${totalSeconds}`;
}

/**
 * Extracts platform and video ID from common video URLs
 */
export function detectPlatformAndThumbnail(url: string): {
  platform: VodPlatform;
  thumbnailUrl?: string;
  videoId?: string;
  suggestedCreator?: string;
} {
  const clean = url.trim();

  // YouTube
  const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }

  // Twitch VOD or Live Channel
  if (clean.includes('twitch.tv/videos/')) {
    const vId = clean.split('twitch.tv/videos/')[1]?.split('?')[0]?.split('/')[0];
    return {
      platform: 'twitch',
      videoId: vId,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/ttv-static/404_preview-640x360.jpg',
      suggestedCreator: 'undiisclosed'
    };
  }

  if (clean.includes('twitch.tv/')) {
    const channel = clean.split('twitch.tv/')[1]?.split('?')[0]?.split('/')[0];
    return {
      platform: 'twitch',
      videoId: channel,
      thumbnailUrl: 'https://static-cdn.jtvnw.net/ttv-static/404_preview-640x360.jpg',
      suggestedCreator: channel || 'undiisclosed'
    };
  }

  // Kick
  if (clean.includes('kick.com/')) {
    const channel = clean.split('kick.com/')[1]?.split('?')[0]?.split('/')[0];
    return {
      platform: 'kick',
      suggestedCreator: channel || 'Kick Streamer'
    };
  }

  // Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      platform: 'vimeo',
      videoId: vimeoMatch[1]
    };
  }

  // TorBox debrid stream / local mp4
  if (clean.includes('torbox.app') || clean.includes('stream') || clean.endsWith('.mp4') || clean.endsWith('.mkv') || clean.endsWith('.m3u8')) {
    return {
      platform: clean.includes('torbox.app') ? 'torbox' : 'direct_stream'
    };
  }

  return { platform: 'youtube' };
}

/**
 * Parses raw chapter timestamp lines into structured VodChapter[]
 */
export function parseRawTimestampLines(text: string, baseUrl: string = '', platform: VodPlatform = 'youtube'): VodChapter[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const chapters: VodChapter[] = [];

  const timestampRegex = /^(?:\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?)\s*(?:[-–—:]\s*)?(.*)$/;

  for (const line of lines) {
    const match = line.match(timestampRegex);
    if (match) {
      const tsFormatted = match[1];
      const title = match[2] ? match[2].trim() : `Chapter ${chapters.length + 1}`;
      const secs = parseTimestampToSeconds(tsFormatted);
      const nativeJumpUrl = baseUrl ? buildNativeTimestampJumpUrl(baseUrl, platform, secs) : undefined;

      chapters.push({
        timestampSeconds: secs,
        timestampFormatted: tsFormatted,
        title: title || `Chapter at ${tsFormatted}`,
        nativeJumpUrl
      });
    }
  }

  return chapters;
}

/**
 * Converts VOD metadata input into a sovereign Book/Sidecar object
 */
export function convertVodToVaultItem(
  input: VodMetadataInput
): Book {
  const serial = generateZettelkastenSerial();
  const detected = detectPlatformAndThumbnail(input.url);
  const platform = input.platform || detected.platform;
  const thumbnailUrl = input.thumbnailUrl || detected.thumbnailUrl || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80';

  const chapters = parseRawTimestampLines(input.rawTimestampsText || '', input.url, platform);
  const nowIso = new Date().toISOString();
  const dateStr = nowIso.split('T')[0];

  // Convert chapters to Resonance Entries
  const resonanceStream: ResonanceEntry[] = chapters.map((ch, idx) => ({
    id: `res-vod-${Date.now()}-${idx}`,
    timestamp: nowIso,
    formattedDate: dateStr,
    progressPercent: chapters.length > 1 ? Math.round((idx / (chapters.length - 1)) * 100) : 0,
    category: 'VOD & Stream Archive',
    rawText: `[${ch.timestampFormatted}] ${ch.title}`,
    cfi: `cfi:vod:${ch.timestampSeconds}`,
    chapterTitle: ch.title,
    paragraphIndex: idx,
    paragraphSnippet: ch.notes || `Direct timestamp jump link: ${ch.nativeJumpUrl || input.url}`,
    intensityScore: 4,
    reactionImageUrl: thumbnailUrl,
    reactionGifCaption: `Chapter: ${ch.title} (${ch.timestampFormatted})`,
    emojiReactions: ['🎬', '🔥', '📺']
  }));

  // If no chapters provided, add initial overview entry
  if (resonanceStream.length === 0) {
    resonanceStream.push({
      id: `res-vod-${Date.now()}-0`,
      timestamp: nowIso,
      formattedDate: dateStr,
      progressPercent: 0,
      category: 'VOD & Stream Archive',
      rawText: `Stream Recording & Archive: ${input.title}`,
      cfi: 'cfi:vod:0',
      chapterTitle: 'Overview',
      paragraphIndex: 0,
      paragraphSnippet: `Sovereign VOD companion cataloged for ${platform.toUpperCase()}. Direct native link: ${input.url}`,
      intensityScore: 5,
      reactionImageUrl: thumbnailUrl,
      reactionGifCaption: input.title,
      emojiReactions: ['🎬', '⚡']
    });
  }

  const sidecarMarkdown = `---
title: "${input.title.replace(/"/g, '\\"')}"
creator: "${input.creator.replace(/"/g, '\\"')}"
media_type: "vod"
platform: "${platform}"
stream_url: "${input.url}"
duration: "${input.durationFormatted || 'N/A'}"
resolution: "${input.resolution || '1080p60'}"
serial_code: "${serial}"
tags: [${['vod', platform, ...(input.tags || [])].map(t => `"${t}"`).join(', ')}]
date_cataloged: "${nowIso}"
---

# 🎬 ${input.title}

> **Platform:** \`${platform.toUpperCase()}\` &bull; **Creator:** **${input.creator}** &bull; **Duration:** \`${input.durationFormatted || 'N/A'}\`
> ↗ **Native Stream:** [Open Directly on ${platform.toUpperCase()}](${input.url})

---

## 📑 Timestamp Jump Anchors

${chapters.length > 0
  ? chapters.map(ch => `- ⏱️ **[\`[${ch.timestampFormatted}]\` ${ch.title}](${ch.nativeJumpUrl || input.url})**`).join('\n')
  : `*Direct Link:* [Watch on ${platform.toUpperCase()}](${input.url})`
}

---

## 📝 Break Notes & Synthesis

${input.description || 'Sovereign companion sidecar cataloged with direct timestamp jump links.'}
`;

  return {
    id: `vod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: input.title,
    author: input.creator,
    coverColor: '#ef4444',
    coverImageUrl: thumbnailUrl,
    externalReaderUri: input.url,
    totalChapters: chapters.length || 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    sidecarMarkdown,
    resonanceStream,
    chapters: chapters.length > 0
      ? chapters.map(ch => ({
          title: ch.title,
          cfiBase: `cfi:vod:${ch.timestampSeconds}`,
          paragraphs: [`Timestamp: ${ch.timestampFormatted}`, ch.title, ch.nativeJumpUrl || input.url]
        }))
      : [{ title: 'Full Stream Recording', cfiBase: 'cfi:vod:0', paragraphs: [`Stream URL: ${input.url}`] }]
  };
}
