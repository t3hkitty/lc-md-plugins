import type { Book } from '../types/resonance';
import { cleanSovereignFilename, buildCompanionSidecarHeader } from '../utils/pathResolver';

export interface CalibreBookMetadata {
  title: string;
  authors: string | string[];
  tags?: string[];
  comments?: string;
  isbn?: string;
  pubdate?: string;
}

export function parseCalibreJsonImport(jsonText: string, relLinkRoot: string = './Library'): Book[] {
  try {
    const rawData = JSON.parse(jsonText);
    const items: CalibreBookMetadata[] = Array.isArray(rawData) ? rawData : [rawData];

    return items.map((item, idx) => {
      const cleanTitle = cleanSovereignFilename(item.title || `Calibre Import ${idx + 1}`);
      const cleanAuthor = cleanSovereignFilename(
        Array.isArray(item.authors) ? item.authors[0] : item.authors || 'Unknown Author'
      );

      const sidecarHeader = buildCompanionSidecarHeader(cleanTitle, cleanAuthor, relLinkRoot, {
        calibre_imported: 'true',
        tags: item.tags || ['Calibre', 'Imported'],
        isbn: item.isbn || ''
      });

      return {
        id: `calibre-${idx}-${Date.now()}`,
        title: cleanTitle,
        author: cleanAuthor,
        coverColor: '#f59e0b',
        totalChapters: 2,
        currentChapterIndex: 0,
        currentParagraphIndex: 0,
        resonanceStream: [],
        sidecarMarkdown: sidecarHeader + `## Reader Resonance Stream\n`,
        chapters: [
          {
            title: 'Chapter 1: Calibre Imported Text',
            cfiBase: `epubcfi(/6/${(idx + 1) * 4}[calibre0${idx + 1}]!`,
            paragraphs: [
              item.comments || `Imported from Calibre library: ${cleanTitle} by ${cleanAuthor}.`,
              'All parenthetical numbers stripped for sovereign mobile path portability.'
            ]
          }
        ]
      };
    });
  } catch (err) {
    console.error('Failed to parse Calibre JSON import:', err);
    return [];
  }
}
