import type { ShareActionHandler } from '../types/readerPlugins';
import type { ResonanceEntry } from '../types/resonance';

export const PLUGGABLE_SHARE_HANDLERS: ShareActionHandler[] = [
  {
    id: 'system-share',
    name: 'System Web Share API',
    description: 'Share directly via mobile OS share dialog (iOS/Android/Windows).',
    icon: '📱',
    execute: async (entry: ResonanceEntry, bookTitle: string) => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Reader Reaction: ${bookTitle}`,
            text: `[${entry.category}] "${entry.rawText}" (${entry.progressPercent}% read)`,
            url: window.location.href,
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },
  {
    id: 'moonplus-intent',
    name: 'Moon+ Reader Android Intent',
    description: 'Launch Moon+ Reader at exact paragraph CFI location (moonreader://open).',
    icon: '🌙',
    execute: async (entry: ResonanceEntry, bookTitle: string) => {
      const intentUrl = `moonreader://open?file=${encodeURIComponent(bookTitle)}.epub&position=${encodeURIComponent(entry.cfi)}`;
      window.open(intentUrl, '_blank');
      return true;
    }
  },
  {
    id: 'obsidian-uri',
    name: 'Obsidian Advanced URI',
    description: 'Open or append reaction in Obsidian Vault via obsidian://advanced-uri.',
    icon: '💜',
    execute: async (entry: ResonanceEntry, bookTitle: string) => {
      const obsidianUrl = `obsidian://advanced-uri?vault=Reading&filepath=${encodeURIComponent(bookTitle)}&data=${encodeURIComponent(entry.rawText)}`;
      window.open(obsidianUrl, '_blank');
      return true;
    }
  },
  {
    id: 'markdown-copy',
    name: 'Copy Sovereign Markdown Snippet',
    description: 'Copy formatted markdown line to clipboard.',
    icon: '📋',
    execute: async (entry: ResonanceEntry) => {
      const mdLine = `- **[${entry.formattedDate} | ${entry.progressPercent}%] [Category: ${entry.category}]** *${entry.rawText}* \`[${entry.cfi}]\``;
      await navigator.clipboard.writeText(mdLine);
      return true;
    }
  }
];
