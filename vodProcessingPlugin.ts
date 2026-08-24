import type { Book } from '../types/resonance';
import type { BreakStreamPlatform } from './tcgBreakFeedPlugin';

export interface VodPullMarker {
  id: string;
  timestampStr: string; // e.g. "01:14:30" or "00:45:10"
  seconds: number;
  cardTitle: string;
  estimatedTradeValueUsd: number;
  packNumber?: number;
  condition?: string;
  notes?: string;
}

export interface VodProcessingJob {
  vodUrl: string;
  platform: BreakStreamPlatform;
  streamerName: string;
  streamTitle: string;
  boxSerial: string;
  breakType: string;
  markers: VodPullMarker[];
}

export function parseTimestampToSeconds(ts: string): number {
  const parts = ts.trim().split(':').map(p => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

export function formatSecondsToTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function generateTimestampUrl(vodUrl: string, seconds: number, platform: BreakStreamPlatform): string {
  const cleanUrl = vodUrl.split('?')[0];
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (platform === 'twitch') {
    const timeParam = h > 0 ? `${h}h${m}m${s}s` : `${m}m${s}s`;
    return `${cleanUrl}?t=${timeParam}`;
  } else if (platform === 'youtube') {
    return `${cleanUrl}?t=${seconds}s`;
  }
  return `${cleanUrl}#t=${seconds}`;
}

export function generateFfmpegClipCommand(vodUrl: string, marker: VodPullMarker, outputFilename: string): string {
  const startSec = Math.max(0, marker.seconds - 15);
  const duration = 45; // 45 second clip
  const safeFilename = outputFilename.replace(/[^a-zA-Z0-9_-]/g, '_');

  return `# Download and extract clean 45-second pull proof clip via yt-dlp & FFmpeg
yt-dlp --download-sections "*${formatSecondsToTimestamp(startSec)}-${formatSecondsToTimestamp(startSec + duration)}" "${vodUrl}" -o "${safeFilename}.mp4"`;
}

export function convertVodMarkersToBooks(job: VodProcessingJob, baseCoverColor = '#e11d48'): Book[] {
  return job.markers.map((marker, index) => {
    const clipUrl = generateTimestampUrl(job.vodUrl, marker.seconds, job.platform);
    const bookId = `tcg-vod-${Date.now()}-${index}`;

    const sidecarMarkdown = `---
title: "${marker.cardTitle}"
format: "dcmd/tcg-grail"
category: "TCG Grail"
trade_value_usd: ${marker.estimatedTradeValueUsd.toFixed(2)}
available_for_trade: true
break_feed:
  stream_platform: "${job.platform}"
  streamer_name: "${job.streamerName}"
  stream_url: "${job.vodUrl}"
  clip_timestamp_url: "${clipUrl}"
  pull_timestamp: "${new Date().toISOString().replace('T', ' ').substring(0, 19)}"
  break_type: "${job.breakType}"
  box_serial: "${job.boxSerial}"
---

# ${marker.cardTitle}

- **Streamer:** ${job.streamerName}
- **VOD Timestamp:** ${marker.timestampStr} ([Watch Pull Clip](${clipUrl}))
- **Box Serial:** \`${job.boxSerial}\`
- **Break Type:** ${job.breakType}
${marker.packNumber ? `- **Pack #:** ${marker.packNumber}` : ''}
${marker.condition ? `- **Observed Condition:** ${marker.condition}` : ''}
${marker.notes ? `- **Notes:** ${marker.notes}` : ''}

### 🎥 Pull Clip Proof
Verified live pull extracted from VOD broadcast: [${clipUrl}](${clipUrl})
`;

    return {
      id: bookId,
      title: marker.cardTitle,
      author: `${job.streamerName} (${job.breakType})`,
      coverColor: baseCoverColor,
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      tradeValueUsd: marker.estimatedTradeValueUsd,
      isAvailableForTrade: true,
      sidecarMarkdown,
      resonanceStream: [
        {
          id: `res-${bookId}-1`,
          timestamp: new Date().toISOString(),
          formattedDate: new Date().toLocaleDateString(),
          progressPercent: 100,
          category: 'VOD Pull Proof',
          rawText: `Pulled live on ${job.platform} stream at timestamp ${marker.timestampStr}. Estimated trade value: $${marker.estimatedTradeValueUsd.toFixed(2)} USD.`,
          cfi: `timestamp:${marker.timestampStr}`,
          chapterTitle: `Pack Opening: ${marker.timestampStr}`,
          paragraphIndex: 0,
          paragraphSnippet: marker.notes || 'Verified live VOD pull.'
        }
      ],
      chapters: [
        {
          title: `VOD Clip: ${marker.timestampStr}`,
          cfiBase: `vod:${marker.timestampStr}`,
          paragraphs: [
            `Pulled on ${job.platform} live stream by ${job.streamerName}.`,
            `VOD Clip Link: ${clipUrl}`,
            marker.notes || 'Pack-fresh pull.'
          ]
        }
      ]
    };
  });
}
