import type { ImportedBookItem, ImportSourceType } from '../types/importer';
import { generateAllAcquisitionLinks } from './acquisitionPlugins';

export function parseReadingListContent(
  content: string,
  sourceType: ImportSourceType = 'auto'
): ImportedBookItem[] {
  let detectedType = sourceType;

  // Auto-detect format if set to 'auto'
  if (detectedType === 'auto') {
    if (content.includes('Book Id') && content.includes('Title') && content.includes('Author')) {
      detectedType = 'goodreads-csv';
    } else if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
      detectedType = 'json-opds';
    } else if (content.includes('<html') || content.includes('<li') || content.includes('<tr')) {
      detectedType = 'html-list';
    } else {
      detectedType = 'markdown-list';
    }
  }

  switch (detectedType) {
    case 'goodreads-csv':
      return parseGoodreadsCsv(content);
    case 'json-opds':
      return parseJsonOpdsReadingList(content);
    case 'html-list':
      return parseHtmlReadingList(content);
    case 'markdown-list':
    default:
      return parseMarkdownTextReadingList(content);
  }
}

function parseGoodreadsCsv(csvText: string): ImportedBookItem[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
  const titleIdx = headers.findIndex(h => /title/i.test(h));
  const authorIdx = headers.findIndex(h => /author/i.test(h));
  const isbnIdx = headers.findIndex(h => /isbn/i.test(h));
  const ratingIdx = headers.findIndex(h => /rating/i.test(h));
  const dateReadIdx = headers.findIndex(h => /date read/i.test(h));
  const shelvesIdx = headers.findIndex(h => /shelves|bookshelves/i.test(h));

  const items: ImportedBookItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parser handling quotes
    const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanCols = cols.map(c => c.replace(/^["']|["']$/g, '').trim());

    const title = titleIdx >= 0 && cleanCols[titleIdx] ? cleanCols[titleIdx] : `Imported Book ${i}`;
    const author = authorIdx >= 0 && cleanCols[authorIdx] ? cleanCols[authorIdx] : 'Unknown Author';
    const isbn = isbnIdx >= 0 ? cleanCols[isbnIdx] : undefined;
    const rating = ratingIdx >= 0 ? parseInt(cleanCols[ratingIdx], 10) || undefined : undefined;
    const dateRead = dateReadIdx >= 0 ? cleanCols[dateReadIdx] : undefined;
    const shelves = shelvesIdx >= 0 && cleanCols[shelvesIdx] ? cleanCols[shelvesIdx].split(',').map(s => s.trim()) : ['goodreads-import'];

    const links = generateAllAcquisitionLinks(title, author, isbn);

    items.push({
      id: `goodreads-${i}-${Date.now()}`,
      title,
      author,
      isbn,
      rating,
      dateRead,
      tags: shelves,
      readingStatus: dateRead ? 'completed' : 'to-read',
      confidenceScore: 95,
      selected: true,
      acquisitionLinks: links
    });
  }

  return items;
}

function parseMarkdownTextReadingList(text: string): ImportedBookItem[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const items: ImportedBookItem[] = [];

  lines.forEach((line, idx) => {
    let clean = line.replace(/^[\s*\-\d\.\:\(\)\[\]xX]+/, '').trim();
    if (!clean) return;

    let title = clean;
    let author = 'Unknown Author';

    if (clean.includes(' by ')) {
      const parts = clean.split(' by ');
      title = parts[0].trim();
      author = parts[1].trim();
    } else if (clean.includes(' - ')) {
      const parts = clean.split(' - ');
      author = parts[0].trim();
      title = parts[1].trim();
    }

    const isCompleted = line.includes('[x]') || line.includes('[X]');
    const links = generateAllAcquisitionLinks(title, author);

    items.push({
      id: `md-list-${idx}-${Date.now()}`,
      title,
      author,
      tags: ['markdown-list-import'],
      readingStatus: isCompleted ? 'completed' : 'to-read',
      confidenceScore: 85,
      selected: true,
      acquisitionLinks: links
    });
  });

  return items;
}

function parseJsonOpdsReadingList(jsonText: string): ImportedBookItem[] {
  try {
    const raw = JSON.parse(jsonText);
    const list = Array.isArray(raw) ? raw : raw.books || raw.entries || [raw];

    return list.map((item: any, idx: number) => {
      const title = item.title || item.name || `Imported Ebook ${idx + 1}`;
      const author = item.author || item.creator || 'Unknown Author';
      const links = generateAllAcquisitionLinks(title, author, item.isbn);

      return {
        id: `json-${idx}-${Date.now()}`,
        title,
        author,
        isbn: item.isbn,
        rating: item.rating,
        tags: item.tags || ['json-import'],
        readingStatus: 'to-read',
        confidenceScore: 90,
        selected: true,
        acquisitionLinks: links
      };
    });
  } catch {
    return [];
  }
}

function parseHtmlReadingList(htmlText: string): ImportedBookItem[] {
  const temp = document.createElement('div');
  temp.innerHTML = htmlText;

  const listElements = Array.from(temp.querySelectorAll('li, tr, div.book-item, div.title'));
  const items: ImportedBookItem[] = [];

  listElements.forEach((el, idx) => {
    const text = el.textContent?.trim();
    if (!text || text.length < 5) return;

    let title = text;
    let author = 'Unknown Author';

    if (text.includes(' by ')) {
      const parts = text.split(' by ');
      title = parts[0].trim();
      author = parts[1].trim();
    }

    const links = generateAllAcquisitionLinks(title, author);

    items.push({
      id: `html-${idx}-${Date.now()}`,
      title,
      author,
      tags: ['html-import'],
      readingStatus: 'to-read',
      confidenceScore: 80,
      selected: true,
      acquisitionLinks: links
    });
  });

  return items;
}
