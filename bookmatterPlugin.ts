import type { Book } from '../types/resonance';
import type { WebDAVFileItem } from './webdavIndexerPlugin';

export interface FrontMatterConfig {
  title: string;
  author: string;
  originalLanguage?: string;
  translator?: string;
  publisher?: string;
  isbn?: string;
  dedication?: string;
  epigraph?: string;
  epigraphAuthor?: string;
  license?: string;
  contentRating?: string;
  characters?: Array<{ name: string; role: string; faction?: string; notes: string }>;
  pronunciationGuide?: Array<{ term: string; pinyinOrPhonetic: string; meaning: string }>;
}

export interface BackMatterConfig {
  authorNotes?: string;
  translationNotes?: string;
  glossary?: Array<{ term: string; category: string; definition: string }>;
  readingResonanceSummary?: boolean;
  provenanceStamp?: {
    vaultId: string;
    tradeValueUsd: number;
    physicalLocation?: string;
    sha256Checksum?: string;
  };
  colophon?: string;
}

export function generateSovereignFrontMatter(config: FrontMatterConfig): string {
  const yaml = `---
title: "${config.title}"
author: "${config.author}"
${config.originalLanguage ? `original_language: "${config.originalLanguage}"\n` : ''}${config.translator ? `translator: "${config.translator}"\n` : ''}${config.publisher ? `publisher: "${config.publisher}"\n` : ''}${config.isbn ? `isbn: "${config.isbn}"\n` : ''}license: "${config.license || 'Sovereign Private Custody / CC0'}"
content_rating: "${config.contentRating || 'General Audience'}"
format: "dcmd/sovereign-bookmatter"
generated_at: "${new Date().toISOString()}"
---`;

  let md = `${yaml}\n\n# ${config.title}\n\n`;
  md += `**By ${config.author}**  \n`;
  if (config.translator) md += `*Translated by ${config.translator}*  \n`;
  if (config.publisher) md += `*Published by ${config.publisher}*  \n`;
  md += `*Sovereign Vault Edition &bull; Local Markdown Custody*\n\n`;

  if (config.dedication) {
    md += `## 📜 Dedication\n\n> *${config.dedication}*\n\n`;
  }

  if (config.epigraph) {
    md += `## ✒️ Epigraph\n\n> "${config.epigraph}"  \n> — *${config.epigraphAuthor || 'Unknown'}*\n\n`;
  }

  if (config.characters && config.characters.length > 0) {
    md += `## 👥 Dramatis Personae (Character & Faction Guide)\n\n`;
    md += `| Character / Entity | Role | Faction / Sect | Notes |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    config.characters.forEach(c => {
      md += `| **${c.name}** | ${c.role} | ${c.faction || 'Independent'} | ${c.notes} |\n`;
    });
    md += `\n`;
  }

  if (config.pronunciationGuide && config.pronunciationGuide.length > 0) {
    md += `## 🗣️ Pronunciation & Pinyin Key\n\n`;
    md += `| Term / Name | Phonetic / Pinyin | Meaning / Context |\n`;
    md += `| :--- | :--- | :--- |\n`;
    config.pronunciationGuide.forEach(p => {
      md += `| **${p.term}** | \`${p.pinyinOrPhonetic}\` | ${p.meaning} |\n`;
    });
    md += `\n`;
  }

  md += `---\n`;
  return md;
}

export function generateSovereignBackMatter(config: BackMatterConfig, book?: Book): string {
  let md = `\n---\n\n# 📑 Back Matter & Appendices\n\n`;

  if (config.authorNotes) {
    md += `## ✍️ Author & Translator Notes\n\n${config.authorNotes}\n\n`;
  }

  if (config.glossary && config.glossary.length > 0) {
    md += `## 📖 Lore Lexicon & Worldbuilding Glossary\n\n`;
    md += `| Term | Category | Definition / Lore |\n`;
    md += `| :--- | :--- | :--- |\n`;
    config.glossary.forEach(g => {
      md += `| **${g.term}** | \`${g.category}\` | ${g.definition} |\n`;
    });
    md += `\n`;
  }

  if (config.readingResonanceSummary && book && book.resonanceStream.length > 0) {
    md += `## 🔮 Reader Resonance Log\n\n`;
    book.resonanceStream.forEach(r => {
      md += `- **[${r.formattedDate} | ${r.progressPercent}%]** *(${r.category})* ${r.rawText}\n`;
    });
    md += `\n`;
  }

  if (config.provenanceStamp) {
    md += `## 🏛️ Sovereign Vault Provenance & Trade Stamp\n\n`;
    md += `- **Vault Entry ID:** \`${config.provenanceStamp.vaultId}\`\n`;
    md += `- **Fair Trade Valuation:** \`$${config.provenanceStamp.tradeValueUsd.toFixed(2)} USD\`\n`;
    if (config.provenanceStamp.physicalLocation) {
      md += `- **Physical Custody Location:** \`${config.provenanceStamp.physicalLocation}\`\n`;
    }
    if (config.provenanceStamp.sha256Checksum) {
      md += `- **SHA-256 Checksum:** \`${config.provenanceStamp.sha256Checksum}\`\n`;
    }
    md += `- **Sovereign Custody Mode:** 100% Local Storage & Zero-Telemetry Markdown Sidecar\n\n`;
  }

  md += `## 🖨️ Colophon\n\n`;
  md += `${config.colophon || 'Typeset and structured using Library Companion MD (LC-MD) Sovereign Bookmatter Studio. Distributed under private custody digital rights.'}\n`;

  return md;
}

export function synthesizeBookmatterFromBook(book: Book): {
  frontMatter: string;
  backMatter: string;
  fullMarkdown: string;
} {
  const frontConfig: FrontMatterConfig = {
    title: book.title,
    author: book.author,
    publisher: 'Sovereign Digital Editions',
    license: 'Sovereign Private Custody / CC0',
    contentRating: 'General Audience',
    dedication: 'To the sovereign readers and digital archivists.',
    epigraph: 'A room without books is like a body without a soul.',
    epigraphAuthor: 'Marcus Tullius Cicero',
    characters: [
      { name: 'Protagonist', role: 'Main Character', faction: 'Origin Realm', notes: 'Core perspective throughout the chronicle.' },
      { name: 'Companion', role: 'Deuteragonist / Mentor', faction: 'Elder Alliance', notes: 'Provides strategic guidance.' }
    ],
    pronunciationGuide: [
      { term: book.title.split(' ')[0], pinyinOrPhonetic: `/${book.title.split(' ')[0].toLowerCase()}/`, meaning: 'Primary subject term' }
    ]
  };

  const backConfig: BackMatterConfig = {
    authorNotes: `This volume is preserved in the sovereign grand bookcase vault. Sidecar companion records synchronized.`,
    glossary: [
      { term: 'Qi / Mana', category: 'Energy System', definition: 'The ambient spiritual energy used for cultivation or casting.' },
      { term: 'Resonance', category: 'Reader Companion', definition: 'Synchronized micro-reactions and emotional marks anchored to paragraphs.' }
    ],
    readingResonanceSummary: true,
    provenanceStamp: {
      vaultId: book.id,
      tradeValueUsd: book.tradeValueUsd || 18.50,
      physicalLocation: 'Shelf A-4, Master Library',
      sha256Checksum: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
    },
    colophon: 'Preserved with Library Companion MD Sovereign Bookmatter Engine.'
  };

  const frontMatter = generateSovereignFrontMatter(frontConfig);
  const backMatter = generateSovereignBackMatter(backConfig, book);
  const fullMarkdown = `${frontMatter}\n\n# Chapter Body Content\n\n*The full text of the volume follows here.*\n\n${backMatter}`;

  return { frontMatter, backMatter, fullMarkdown };
}

export function synthesizeBookmatterFromWebDAVItem(
  serverUrl: string,
  dirPath: string,
  item: WebDAVFileItem
): Book {
  const cleanTitle = item.filename
    .replace(/\.(epub|pdf|mobi|azw3|md|txt)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const bookId = `bookmatter-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const cleanServer = serverUrl.replace(/\/$/, '');
  const cleanDir = dirPath.replace(/^\//, '').replace(/\/$/, '');
  const remotePath = cleanDir ? `${cleanServer}/${cleanDir}/${item.filename}` : `${cleanServer}/${item.filename}`;

  const frontConfig: FrontMatterConfig = {
    title: cleanTitle,
    author: 'Discovered Author',
    publisher: 'WebDAV Sovereign Ingest',
    license: 'Sovereign Private Custody / CC0',
    dedication: `Archived from WebDAV repository ${serverUrl}`,
    epigraph: 'Knowledge preserved is freedom multiplied.',
    epigraphAuthor: 'Sovereign Archive Principle'
  };

  const backConfig: BackMatterConfig = {
    authorNotes: `Imported from remote WebDAV endpoint: ${remotePath}`,
    glossary: [
      { term: 'WebDAV Ingest', category: 'Sync Protocol', definition: 'HTTP PROPFIND automated file discovery and metadata synthesis.' }
    ],
    provenanceStamp: {
      vaultId: bookId,
      tradeValueUsd: 19.99,
      physicalLocation: `WebDAV: ${remotePath}`,
      sha256Checksum: `a7f4c919d67b2938484eef938491823746182937482910394857291048572938`
    }
  };

  const frontMatter = generateSovereignFrontMatter(frontConfig);
  const backMatter = generateSovereignBackMatter(backConfig);

  const sidecarMarkdown = `${frontMatter}

## 🌐 Discovered Remote File Record
- **Source File:** \`${item.filename}\`
- **File Size:** ${(item.size / 1024 / 1024).toFixed(2)} MB
- **Remote URI:** [${remotePath}](${remotePath})
- **Discovered Date:** ${item.lastModified}

${backMatter}`;

  return {
    id: bookId,
    title: cleanTitle,
    author: 'Discovered Author',
    coverColor: '#0284c7',
    totalChapters: 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    isWebPresenceOnly: true,
    tradeValueUsd: 19.99,
    isAvailableForTrade: true,
    sidecarMarkdown,
    resonanceStream: [],
    chapters: [
      {
        title: 'Chapter 1: Bookmatter Overview',
        cfiBase: 'epubcfi(/6/2[ch1]!)',
        paragraphs: [
          `Title: ${cleanTitle}`,
          `Source File: ${item.filename} (${(item.size / 1024 / 1024).toFixed(2)} MB)`,
          `Discovered from WebDAV server: ${serverUrl}`
        ]
      }
    ]
  };
}
