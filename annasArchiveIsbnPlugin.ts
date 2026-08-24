export interface AnnasArchiveIsbnRecord {
  isbn13: string;
  isbn10?: string;
  title: string;
  author: string;
  publisher?: string;
  publishYear?: number;
  locClassification?: string;
  openLibraryId?: string;
  coverUrl?: string;
  sourceDataset: 'Library of Congress (LoC) MARC21' | 'OCLC WorldCat' | 'Open Library' | 'Anna\'s Archive Torrent DB';
}

export function searchAnnasArchiveIsbnDb(queryIsbnOrTitle: string): AnnasArchiveIsbnRecord[] {
  const clean = queryIsbnOrTitle.trim().toLowerCase();

  const mockDb: AnnasArchiveIsbnRecord[] = [
    {
      isbn13: '9781982185658',
      isbn10: '198218565X',
      title: 'The Scum Villain\'s Self-Saving System: Ren Zha Fan Pai Zi Jiu Xi Tong (Vol. 1)',
      author: 'Mo Xiang Tong Xiu (MXTX)',
      publisher: 'Seven Seas Entertainment',
      publishYear: 2021,
      locClassification: 'PL2964.O26 S38 2021',
      openLibraryId: 'OL34291845M',
      sourceDataset: 'Library of Congress (LoC) MARC21'
    },
    {
      isbn13: '9781773840925',
      isbn10: '1773840920',
      title: 'The Crafting of Chess: A LitRPG Novel',
      author: 'Kit Falbo',
      publisher: 'Shadow Alley Press',
      publishYear: 2019,
      locClassification: 'PS3606.A43 C73 2019',
      openLibraryId: 'OL28391048M',
      sourceDataset: 'Anna\'s Archive Torrent DB'
    },
    {
      isbn13: '9780593358368',
      isbn10: '059335836X',
      title: 'Dungeon Crawler Carl',
      author: 'Matt Dinniman',
      publisher: 'Ace / Penguin Random House',
      publishYear: 2023,
      locClassification: 'PS3604.I56 D86 2023',
      openLibraryId: 'OL39102451M',
      sourceDataset: 'OCLC WorldCat'
    }
  ];

  if (!clean) return mockDb;

  return mockDb.filter(r =>
    r.isbn13.includes(clean) ||
    (r.isbn10 && r.isbn10.toLowerCase().includes(clean)) ||
    r.title.toLowerCase().includes(clean) ||
    r.author.toLowerCase().includes(clean)
  );
}
