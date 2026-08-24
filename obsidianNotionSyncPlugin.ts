import type { Book } from '../types/resonance';
import { getOrAssignZettelSerial, formatZettelkastenLink, slugifyTitle } from './zettelkastenSerialPlugin';

export function convertToObsidianVaultFormat(book: Book, relLinkRoot: string = ''): string {
  const serial = getOrAssignZettelSerial(book);
  const slug = slugifyTitle(book.title);

  let md = `---\n`;
  md += `zettelkasten_uid: "${serial}"\n`;
  md += `zettel_serial: "${serial}"\n`;
  md += `zettel_link: "${formatZettelkastenLink(serial, book.title)}"\n`;
  md += `title: "${book.title}"\n`;
  md += `author: "[[${book.author}]]"\n`;
  md += `tags: [zettelkasten, book, resonance-stream, calibre-companion-md]\n`;
  if (relLinkRoot) {
    md += `rel_link_root: "${relLinkRoot}"\n`;
  }
  md += `---\n\n`;

  md += `# ${formatZettelkastenLink(serial, book.title)}\n\n`;
  md += `> [!info] Sovereign Companion Sidecar [ZK: \`${serial}\`]\n`;
  md += `> **Author:** [[${book.author}]]\n`;
  md += `> **Zettelkasten Serial:** \`${serial}\`\n`;
  md += `> **File Identifier:** \`${serial}-${slug}.md\`\n`;
  if (relLinkRoot) {
    md += `> **Relative Link Root:** \`${relLinkRoot}\`\n`;
  }
  md += `\n`;

  md += `## Reader Resonance Stream\n\n`;

  book.resonanceStream.forEach((entry) => {
    md += `> [!quote] **[${entry.formattedDate} | ${entry.progressPercent}%] [Category: ${entry.category}]**\n`;
    md += `> *${entry.rawText}*\n`;
    md += `> - Locator: \`${entry.cfi}\`\n`;
    md += `> - Context: "${entry.paragraphSnippet}"\n\n`;
  });

  return md;
}

export function convertToNotionMarkdownFormat(book: Book): string {
  const serial = getOrAssignZettelSerial(book);

  let md = `# [ZK: ${serial}] ${book.title}\n`;
  md += `**Zettelkasten UID:** \`${serial}\`\n`;
  md += `**Author:** ${book.author}\n`;
  md += `**Format:** Companion Sidecar (.md)\n\n`;

  md += `## Reader Resonance Stream\n`;
  book.resonanceStream.forEach((entry) => {
    md += `- **[${entry.formattedDate} | ${entry.progressPercent}%] [Category: ${entry.category}]** *${entry.rawText}*\n`;
  });

  return md;
}
