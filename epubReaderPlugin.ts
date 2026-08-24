import JSZip from 'jszip';
import type { Book } from '../types/resonance';
import { cleanSovereignFilename, buildCompanionSidecarHeader } from '../utils/pathResolver';

export async function parseEpubFile(file: File, relLinkRoot: string = './Library'): Promise<Book> {
  const zip = await JSZip.loadAsync(file);
  
  // 1. Locate container.xml
  const containerFile = zip.file('META-INF/container.xml');
  let opfPath = 'OEBPS/content.opf';

  if (containerFile) {
    const containerXml = await containerFile.async('text');
    const match = containerXml.match(/full-path="([^"]+)"/);
    if (match && match[1]) {
      opfPath = match[1];
    }
  }

  // 2. Read OPF
  const opfFile = zip.file(opfPath);
  let title = file.name.replace(/\.epub$/i, '');
  let author = 'Unknown Author';
  let coverColor = '#6366f1';

  if (opfFile) {
    const opfXml = await opfFile.async('text');
    
    const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
    if (titleMatch && titleMatch[1]) {
      title = cleanSovereignFilename(titleMatch[1]);
    }

    const creatorMatch = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
    if (creatorMatch && creatorMatch[1]) {
      author = cleanSovereignFilename(creatorMatch[1]);
    }
  }

  // 3. Extract text chapters from html/xhtml files inside zip
  const htmlFiles = Object.keys(zip.files).filter(f => /\.xhtml$|\.html$|\.htm$/i.test(f));
  const chapters: { title: string; cfiBase: string; paragraphs: string[] }[] = [];

  for (let i = 0; i < Math.min(htmlFiles.length, 5); i++) {
    const filePath = htmlFiles[i];
    const htmlText = await zip.file(filePath)?.async('text');
    if (!htmlText) continue;

    // Strip HTML tags to get raw paragraph text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;

    const pElements = Array.from(tempDiv.querySelectorAll('p, div.paragraph, article'));
    const rawParagraphs = pElements
      .map(p => p.textContent?.trim())
      .filter((t): t is string => Boolean(t && t.length > 15));

    if (rawParagraphs.length > 0) {
      const chapterTitle = `Chapter ${i + 1}: ${filePath.split('/').pop()?.replace(/\.\w+$/, '') || 'Section'}`;
      chapters.push({
        title: chapterTitle,
        cfiBase: `epubcfi(/6/${(i + 1) * 4}[chap0${i + 1}]!`,
        paragraphs: rawParagraphs.slice(0, 10)
      });
    }
  }

  // Fallback chapter if no HTML extracted
  if (chapters.length === 0) {
    chapters.push({
      title: 'Chapter 1: Opening Narrative',
      cfiBase: 'epubcfi(/6/4[chap01]!',
      paragraphs: [
        `Extracted from sovereign file ${file.name}.`,
        'The journey begins with raw unfiltered reader resonance.'
      ]
    });
  }

  const bookId = `epub-${Date.now()}`;
  const sidecarHeader = buildCompanionSidecarHeader(title, author, relLinkRoot);

  return {
    id: bookId,
    title,
    author,
    coverColor,
    totalChapters: chapters.length,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    resonanceStream: [],
    sidecarMarkdown: sidecarHeader + `## Reader Resonance Stream\n`,
    chapters
  };
}
