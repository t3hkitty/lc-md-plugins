import type { Book } from '../types/resonance';

export function exportVaultToGoogleSheetsCsv(books: Book[]): string {
  const headers = [
    'Item ID',
    'Title',
    'Author / Brand',
    'Media Category',
    'Valuation (USD)',
    'Chapters / Parts',
    'Resonance Notes',
    'ISBN / Serial',
    'LoC Classification',
    'Tags',
    'Web Only'
  ];

  const getItemValuation = (book: Book): number => {
    if (book.title.includes('Charizard')) return 245000;
    if (book.title.includes('Black Lotus')) return 380000;
    if (book.title.includes('Crafting of Chess')) return 120;
    if (book.title.includes('Scum Villain')) return 85;
    if (book.title.includes('Dungeon Crawler')) return 45;
    return 15;
  };

  const rows = books.map(b => {
    const tagsMatch = b.sidecarMarkdown.match(/tags:\s*\[(.*?)\]/);
    const tags = tagsMatch ? tagsMatch[1].replace(/["']/g, '') : 'sovereign, webdav';
    const isbnMatch = b.sidecarMarkdown.match(/isbn13:\s*["']?(.*?)["']?\n/);
    const locMatch = b.sidecarMarkdown.match(/loc_classification:\s*["']?(.*?)["']?\n/);

    return [
      `"${b.id}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.title.includes('Charizard') || b.title.includes('Lotus') ? 'TCG Grail' : b.title.includes('Loki') ? 'Pop Relic' : 'Ebook / Webnovel'}"`,
      getItemValuation(b),
      b.chapters.length,
      b.resonanceStream.length,
      `"${isbnMatch ? isbnMatch[1] : 'N/A'}"`,
      `"${locMatch ? locMatch[1] : 'N/A'}"`,
      `"${tags}"`,
      b.isWebPresenceOnly ? 'TRUE' : 'FALSE'
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
