import type { Book } from '../types/resonance';
import { generateZettelkastenSerial, formatZettelkastenLink, slugifyTitle } from './zettelkastenSerialPlugin';

export interface PlaybackStats {
  playCount: number;
  totalListeningMinutes: number;
  lastPlayedAt: string;
  skipRatePercent?: number;
  audioBitrate?: string; // e.g. "24-bit/96kHz Lossless FLAC" | "Spotify 320kbps"
  peakResonanceTrack?: string;
  scrobbleSource?: string; // e.g. "Spotify Web API" | "Vinyl Turntable" | "Headless VPS Cron"
}

export interface SpotifyTrackOrAlbum {
  id: string;
  zettelkastenUid: string;
  title: string;
  artist: string;
  album: string;
  releaseYear: number;
  spotifyUri: string;
  spotifyUrl: string;
  coverArtUrl?: string;
  isrc?: string;
  bpm?: number;
  genres: string[];
  physicalFormat: 'Vinyl LP (180g)' | 'Vinyl 45RPM' | 'Lossless FLAC' | 'Audio CD (Jewel Case)' | 'Cassette Tape' | 'Digital Master';
  estimatedValueUsd: number;
  acousticMood?: string;
  playbackStats?: PlaybackStats;
  resonanceNotes: Array<{
    timestamp: string;
    trackName: string;
    note: string;
    category: 'Soundstage' | 'Lyrics' | 'Bass / Mix' | 'Memory / Emotion';
  }>;
}

export const SAMPLE_SPOTIFY_COLLECTION: SpotifyTrackOrAlbum[] = [
  {
    id: 'sp-daft-punk-ram',
    zettelkastenUid: '20260818041501',
    title: 'Touch (feat. Paul Williams)',
    artist: 'Daft Punk',
    album: 'Random Access Memories (10th Anniversary Edition)',
    releaseYear: 2013,
    spotifyUri: 'spotify:track:2ndGQfqHchG3XjRjHk3Fbv',
    spotifyUrl: 'https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa',
    isrc: 'USQX91300109',
    bpm: 112,
    genres: ['Electronic', 'Disco', 'Synth-Funk', 'Orchestral Space Pop'],
    physicalFormat: 'Vinyl LP (180g)',
    estimatedValueUsd: 48.00,
    acousticMood: 'Transcendent Orchestral Melancholy',
    playbackStats: {
      playCount: 42,
      totalListeningMinutes: 248,
      lastPlayedAt: '2026-08-17 21:10',
      skipRatePercent: 0,
      audioBitrate: '24-bit/96kHz Lossless Master',
      peakResonanceTrack: 'Touch (feat. Paul Williams)',
      scrobbleSource: 'Spotify Web API / VPS Cron Scrobbler'
    },
    resonanceNotes: [
      {
        timestamp: '03:14',
        trackName: 'Touch',
        note: 'The analog synthesizer bridge swells into the live brass arrangement with supreme clarity.',
        category: 'Soundstage'
      },
      {
        timestamp: '06:40',
        trackName: 'Touch',
        note: '"Hold on, if love is the answer you\'re home..." Choral breakdown is pure emotional catharsis.',
        category: 'Memory / Emotion'
      }
    ]
  },
  {
    id: 'sp-nujabes-modal-soul',
    zettelkastenUid: '20260818041502',
    title: 'Luv (sic.) Modal Soul Version',
    artist: 'Nujabes feat. Shing02',
    album: 'Modal Soul',
    releaseYear: 2005,
    spotifyUri: 'spotify:track:40kgUomT5qQkXgWwOcv8wz',
    spotifyUrl: 'https://open.spotify.com/album/4Qx9RzS5jK0ZgqR01n5fXh',
    isrc: 'JPTR00500112',
    bpm: 90,
    genres: ['Jazzhop', 'Boom Bap', 'Spiritual Jazz', 'Instrumental Hip-Hop'],
    physicalFormat: 'Vinyl LP (180g)',
    estimatedValueUsd: 110.00,
    acousticMood: 'Warm Rainy Day Nostalgia',
    playbackStats: {
      playCount: 65,
      totalListeningMinutes: 310,
      lastPlayedAt: '2026-08-17 18:45',
      skipRatePercent: 2,
      audioBitrate: 'Vinyl 180g Direct Microline Cartridge',
      peakResonanceTrack: 'Luv (sic.) Modal Soul Version',
      scrobbleSource: 'Vinyl Custody Vault / Scrobble Sync'
    },
    resonanceNotes: [
      {
        timestamp: '01:20',
        trackName: 'Luv (sic.) Modal Soul Version',
        note: 'Classic Rhodes piano loop paired with the crisp vinyl crackle creates an immaculate sanctuary.',
        category: 'Soundstage'
      }
    ]
  },
  {
    id: 'sp-porter-nurture',
    zettelkastenUid: '20260818041503',
    title: 'Look at the Sky',
    artist: 'Porter Robinson',
    album: 'Nurture',
    releaseYear: 2021,
    spotifyUri: 'spotify:track:3zZq47j5WfXgQ8Z0kZ5tXx',
    spotifyUrl: 'https://open.spotify.com/album/45oirr9Xp4e0i1oG4M51w8',
    isrc: 'USUG12004452',
    bpm: 130,
    genres: ['Electropop', 'Indie Electronic', 'Ambient Pop'],
    physicalFormat: 'Lossless FLAC',
    estimatedValueUsd: 22.50,
    acousticMood: 'Hopeful & Resilient Sunlight',
    playbackStats: {
      playCount: 31,
      totalListeningMinutes: 145,
      lastPlayedAt: '2026-08-16 14:20',
      skipRatePercent: 0,
      audioBitrate: 'Lossless FLAC 24-bit',
      peakResonanceTrack: 'Look at the Sky',
      scrobbleSource: 'Spotify Web API'
    },
    resonanceNotes: [
      {
        timestamp: '02:05',
        trackName: 'Look at the Sky',
        note: '"Look at the sky, I\'m still here, I\'ll be alive next year" — ultimate optimism anthem.',
        category: 'Lyrics'
      }
    ]
  }
];

/**
 * Generates rich Black Box companion markdown for Spotify music collection items with full playback stats
 */
export function generateSpotifyCompanionMarkdown(item: SpotifyTrackOrAlbum): string {
  const serial = item.zettelkastenUid || generateZettelkastenSerial();
  const stats = item.playbackStats || {
    playCount: 1,
    totalListeningMinutes: 5,
    lastPlayedAt: new Date().toISOString(),
    skipRatePercent: 0,
    audioBitrate: 'Lossless Digital Master',
    peakResonanceTrack: item.title,
    scrobbleSource: 'Black Box Direct Ingest'
  };

  let md = `---
zettelkasten_uid: "${serial}"
zettel_serial: "${serial}"
zettel_link: "${formatZettelkastenLink(serial, `${item.artist} - ${item.album}`)}"
title: "${item.artist} - ${item.album}"
artist: "[[${item.artist}]]"
album: "${item.album}"
featured_track: "${item.title}"
release_year: ${item.releaseYear}
spotify_uri: "${item.spotifyUri}"
spotify_url: "${item.spotifyUrl}"
isrc: "${item.isrc || 'N/A'}"
bpm: ${item.bpm || 120}
format: "dcmd/music-album"
physical_format: "${item.physicalFormat}"
fair_trade_valuation_usd: "${item.estimatedValueUsd.toFixed(2)}"
play_count: ${stats.playCount}
total_listening_minutes: ${stats.totalListeningMinutes}
last_played_at: "${stats.lastPlayedAt}"
audio_bitrate: "${stats.audioBitrate || '320kbps'}"
scrobble_source: "${stats.scrobbleSource || 'Spotify Web Player'}"
genres: [${item.genres.map(g => `"${g}"`).join(', ')}]
tags: [music, blackbox-link, spotify, vinyl, zettelkasten, ${item.genres.map(g => slugifyTitle(g)).join(', ')}]
---

# 🎵 ${formatZettelkastenLink(serial, `${item.artist} - ${item.album}`)}

> [!abstract] Black Box Linked Album Record [ZK: \`${serial}\`]
> **Artist:** [[${item.artist}]]
> **Album:** *${item.album}*
> **Featured Track:** \`${item.title}\` (${item.releaseYear})
> **Physical Format:** \`${item.physicalFormat}\` &bull; **Valuation:** $${item.estimatedValueUsd.toFixed(2)} USD
> **Spotify Direct:** [Open in Spotify Web Player](${item.spotifyUrl})

---

## 📊 Playback Statistics & Acoustic Telemetry

| Metric | Recorded Value |
| :--- | :--- |
| **Total Play Count** | \`${stats.playCount} plays\` |
| **Total Listening Time** | \`${(stats.totalListeningMinutes / 60).toFixed(1)} hrs\` (${stats.totalListeningMinutes} mins) |
| **Last Played** | \`${stats.lastPlayedAt}\` |
| **Peak Resonance Track** | \`${stats.peakResonanceTrack || item.title}\` |
| **Audio Bitrate / Medium** | \`${stats.audioBitrate || item.physicalFormat}\` |
| **Scrobble Engine** | \`${stats.scrobbleSource || 'Sovereign Scrobble'}\` |
| **Skip Rate** | \`${stats.skipRatePercent || 0}%\` |

---

## 🎧 Sonic Fingerprint & Specs

- **Zettelkasten Serial:** \`${serial}\`
- **Spotify URI:** \`${item.spotifyUri}\`
- **ISRC Registry:** \`${item.isrc || 'N/A'}\`
- **Tempo / Rhythm:** \`${item.bpm || 'N/A'} BPM\`
- **Acoustic Mood:** *${item.acousticMood || 'Eclectic Sovereign Audio'}*
- **Primary Genres:** ${item.genres.map(g => `\`#${g}\``).join(' ')}

---

## 🎼 Listening Resonance Stream & Soundstage Notes

`;

  item.resonanceNotes.forEach((res) => {
    md += `> [!quote] **[${res.timestamp}] [${res.category}] ${res.trackName}**\n`;
    md += `> *${res.note}*\n\n`;
  });

  md += `\n---\n*Linked into Sovereign Black Box & Library Companion MD Music Vault with Playback Statistics.*\n`;
  return md;
}

/**
 * Converts a Spotify Track/Album with playback stats into a Book item that renders in the bookshelf
 */
export function linkSpotifyAlbumToVaultBook(item: SpotifyTrackOrAlbum): Book {
  const mdContent = generateSpotifyCompanionMarkdown(item);
  const stats = item.playbackStats || {
    playCount: 1,
    totalListeningMinutes: 5,
    lastPlayedAt: new Date().toISOString()
  };

  return {
    id: item.id || `spotify-${Date.now()}`,
    title: `${item.artist} - ${item.album}`,
    author: item.artist,
    coverColor: '#1db954', // Spotify Green
    totalChapters: item.resonanceNotes.length || 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: true,
    tradeValueUsd: item.estimatedValueUsd,
    isAvailableForTrade: true,
    sidecarMarkdown: mdContent,
    resonanceStream: [
      {
        id: `res-stat-${Date.now()}`,
        timestamp: stats.lastPlayedAt,
        formattedDate: stats.lastPlayedAt.split(' ')[0] || new Date().toISOString().split('T')[0],
        progressPercent: 100,
        category: 'Soundstage',
        rawText: `[Playback Stats] ${stats.playCount} plays (${stats.totalListeningMinutes} mins) • Fidelity: ${stats.audioBitrate || item.physicalFormat}`,
        cfi: `spotify://stats/${item.id}`,
        chapterTitle: item.album,
        paragraphIndex: 0,
        paragraphSnippet: `Playback Stats: ${stats.playCount} plays, ${stats.totalListeningMinutes} mins`
      },
      ...item.resonanceNotes.map((res, i) => ({
        id: `res-spotify-${i}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toISOString().split('T')[0],
        progressPercent: 50 + (i * 20),
        category: res.category,
        rawText: res.note,
        cfi: `spotify://track/${item.spotifyUri}`,
        chapterTitle: item.album,
        paragraphIndex: i + 1,
        paragraphSnippet: `[${res.timestamp}] ${res.trackName}: ${res.note}`
      }))
    ],
    chapters: [
      {
        title: item.album,
        cfiBase: 'spotify:album:1',
        paragraphs: [
          `Featured Track: ${item.title} by ${item.artist}`,
          `Physical Medium: ${item.physicalFormat}`,
          `Spotify URI: ${item.spotifyUri}`,
          `Total Play Count: ${stats.playCount} plays (${stats.totalListeningMinutes} minutes)`,
          ...item.resonanceNotes.map(n => `[${n.timestamp}] ${n.note}`)
        ]
      }
    ]
  };
}

// Backward compatibility alias
export const inkSpotifyAlbumToVaultBook = linkSpotifyAlbumToVaultBook;
