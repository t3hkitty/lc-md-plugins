import type { MicroTweetEntry } from '../types/plugins';

export function formatMicroTweetToMarkdown(entry: MicroTweetEntry): string {
  const tagList = entry.hashtags || entry.tags || [];
  const hashtagStr = tagList.map(t => `#${t.replace(/^#/, '')}`).join(' ');
  const cfiStr = entry.cfi ? ` \`[${entry.cfi}]\`` : '';
  const progressStr = entry.progressPercent ? ` **[${entry.progressPercent}%]**` : '';
  const dateStr = entry.formattedDate || entry.timestamp || new Date().toLocaleTimeString();
  const textStr = entry.text || entry.content || '';

  return `- 🐥 **[${dateStr}]**${progressStr}${cfiStr} ${textStr} ${hashtagStr}\n`;
}

export function appendMicroTweetToSidecar(markdownContent: string, entry: MicroTweetEntry): string {
  const tweetLine = formatMicroTweetToMarkdown(entry);

  if (!markdownContent.includes('## Micro-Tweets & Visceral Reactions')) {
    return markdownContent + '\n\n## Micro-Tweets & Visceral Reactions\n' + tweetLine;
  }

  return markdownContent.replace(
    '## Micro-Tweets & Visceral Reactions\n',
    `## Micro-Tweets & Visceral Reactions\n${tweetLine}`
  );
}
