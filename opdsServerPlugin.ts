import type { Book } from '../types/resonance';
import type { OPDSCatalogFeed, OPDSEntry } from '../types/readerPlugins';

export function generateOPDSAtomXml(books: Book[], relLinkRoot: string = './Library'): string {
  const updatedIso = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
  xml += `<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">\n`;
  xml += `  <title>Library Companion MD OPDS Server Feed</title>\n`;
  xml += `  <id>urn:uuid:lc-md-opds-catalog-root</id>\n`;
  xml += `  <updated>${updatedIso}</updated>\n`;
  xml += `  <author><name>LC-MD Sovereign Core</name></author>\n`;
  xml += `  <link rel="self" href="/opds/catalog.xml" type="application/atom+xml;profile=opds-catalog;kind=navigation"/>\n`;
  xml += `  <link rel="start" href="/opds/catalog.xml" type="application/atom+xml;profile=opds-catalog;kind=navigation"/>\n\n`;

  books.forEach((b) => {
    const bookUpdated = updatedIso;
    const cleanTitle = b.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cleanAuthor = b.author.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const bookUrl = `${relLinkRoot}/${encodeURIComponent(cleanAuthor)}/${encodeURIComponent(cleanTitle)}.epub`;
    const sidecarUrl = `${relLinkRoot}/${encodeURIComponent(cleanAuthor)}/${encodeURIComponent(cleanTitle)}.companion.md`;

    xml += `  <entry>\n`;
    xml += `    <title>${cleanTitle}</title>\n`;
    xml += `    <id>urn:uuid:${b.id}</id>\n`;
    xml += `    <updated>${bookUpdated}</updated>\n`;
    xml += `    <author><name>${cleanAuthor}</name></author>\n`;
    xml += `    <summary>Sovereign EPUB with companion .md sidecar. Chapters: ${b.totalChapters}, Reactions: ${b.resonanceStream.length}.</summary>\n`;
    xml += `    <link rel="http://opds-spec.org/acquisition" href="${bookUrl}" type="application/epub+zip"/>\n`;
    xml += `    <link rel="http://opds-spec.org/acquisition/sidecar" href="${sidecarUrl}" type="text/markdown"/>\n`;
    xml += `  </entry>\n\n`;
  });

  xml += `</feed>\n`;
  return xml;
}

export function buildOPDSCatalogFeedObject(books: Book[], relLinkRoot: string): OPDSCatalogFeed {
  const updated = new Date().toISOString();
  const entries: OPDSEntry[] = books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    updated,
    summary: `Sovereign companion book with ${b.resonanceStream.length} micro-log reactions.`,
    epubUrl: `${relLinkRoot}/${b.author}/${b.title}.epub`,
    sidecarUrl: `${relLinkRoot}/${b.author}/${b.title}.companion.md`,
  }));

  return {
    title: 'Library Companion MD OPDS Server',
    id: 'opds-feed-lc-md',
    updated,
    iconUrl: '/favicon.ico',
    entries,
  };
}
