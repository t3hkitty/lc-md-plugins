import type { MetadataSearchResult, SelectiveMetadataSelection } from '../types/plugins';

export async function searchOpenLibraryMetadata(query: string): Promise<MetadataSearchResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://openlibrary.org/search.json?q=${encoded}&limit=5`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.docs || []).map((doc: any, idx: number) => {
      const coverId = doc.cover_i;
      const coverUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400';

      return {
        id: doc.key || `ol-${idx}`,
        title: doc.title || query,
        author: Array.isArray(doc.author_name) ? doc.author_name[0] : doc.author_name || 'Unknown Author',
        coverUrl,
        isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : undefined,
        publisher: Array.isArray(doc.publisher) ? doc.publisher[0] : undefined,
        publishYear: doc.first_publish_year || undefined,
        description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : 'Narrative masterpiece.',
        genres: doc.subject ? doc.subject.slice(0, 4) : ['Fiction', 'Literature']
      };
    });
  } catch (err) {
    console.warn('Open Library search failed, using fallback:', err);
    return [];
  }
}

export function mergeSelectedMetadata(
  original: any,
  scraped: MetadataSearchResult,
  selection: SelectiveMetadataSelection
): any {
  return {
    ...original,
    title: selection.title ? scraped.title : original.title,
    author: selection.author ? scraped.author : original.author,
    coverUrl: selection.coverUrl ? scraped.coverUrl : original.coverUrl,
    isbn: selection.isbn ? scraped.isbn : original.isbn,
    publisher: selection.publisher ? scraped.publisher : original.publisher,
    publishYear: selection.publishYear ? scraped.publishYear : original.publishYear,
    description: selection.description ? scraped.description : original.description,
    genres: selection.genres ? scraped.genres : original.genres,
  };
}
