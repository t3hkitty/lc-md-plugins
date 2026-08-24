import type { Book } from '../types/resonance';

export interface ArtworkPortfolioItem {
  id: string;
  title: string;
  artistName: string;
  artistHandle: string;
  medium: 'Digital Painting' | 'Oil on Canvas' | 'Watercolor' | 'Character Sheet' | '3D Render' | 'Merch Print';
  dimensions: string;
  yearCreated: number;
  priceUsd?: number;
  isCommissionOpen: boolean;
  highResImageUrl: string;
  description: string;
  tags: string[];
  upvotesCount: number;
  commentsCount: number;
  redbubbleUrl?: string;
  inprntUrl?: string;
  etsyUrl?: string;
  society6Url?: string;
}

export const INITIAL_ARTIST_PORTFOLIOS: ArtworkPortfolioItem[] = [
  {
    id: 'art-1',
    title: 'Piplup & Dawn Sinnoh Grand Contest (Digital Painting)',
    artistName: 'ArtKitty (Wife & Lorik Studios)',
    artistHandle: '@artkitty',
    medium: 'Digital Painting',
    dimensions: '3840 x 2160 (4K Canvas)',
    yearCreated: 2026,
    priceUsd: 250,
    isCommissionOpen: true,
    highResImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800',
    description: 'Vibrant ocean sapphire & ice pearl illustration featuring Piplup executing Bubble Beam at the Sinnoh Grand Contest!',
    tags: ['piplup', 'dawn', 'sinnoh', 'digital-painting', 'artkitty-original'],
    upvotesCount: 142,
    commentsCount: 18,
    redbubbleUrl: 'https://www.redbubble.com/people/artkitty/works/piplup-dawn',
    inprntUrl: 'https://www.inprnt.com/gallery/artkitty/piplup-dawn',
    etsyUrl: 'https://www.etsy.com/shop/ArtKittyStudios'
  },
  {
    id: 'art-2',
    title: 'Scum Villain (SVSSS) Shen Qingqiu Bamboo Peak Resonance',
    artistName: 'ArtKitty (Wife & Lorik Studios)',
    artistHandle: '@artkitty',
    medium: 'Watercolor',
    dimensions: '24" x 36" Original Watercolor',
    yearCreated: 2026,
    priceUsd: 450,
    isCommissionOpen: true,
    highResImageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
    description: 'Traditional paper watercolor artwork depicting Shen Qingqiu with Xiu Ya sword on Qing Jing Peak.',
    tags: ['svsss', 'shen-qingqiu', 'danmei-art', 'watercolor', 'bamboo-peak'],
    upvotesCount: 215,
    commentsCount: 29,
    redbubbleUrl: 'https://www.redbubble.com/people/artkitty/works/svsss-bamboo-peak',
    inprntUrl: 'https://www.inprnt.com/gallery/artkitty/svsss-bamboo-peak'
  }
];

export function convertArtworkToVaultBook(art: ArtworkPortfolioItem): Book {
  const yamlSidecar = `---
title: "${art.title}"
artist: "${art.artistName} (${art.artistHandle})"
medium: "${art.medium}"
dimensions: "${art.dimensions}"
year: ${art.yearCreated}
commission_price_usd: ${art.priceUsd || 0}
format: "dcmd/artwork-portfolio"
redbubble_store: "${art.redbubbleUrl || ''}"
inprnt_store: "${art.inprntUrl || ''}"
etsy_store: "${art.etsyUrl || ''}"
rel_link_root: "../../"
tags: [${art.tags.map(t => `"${t}"`).join(', ')}]
---

# ${art.title} by ${art.artistName}

![${art.title}](${art.highResImageUrl})

- **[Artist Portfolio Item]** *Medium: ${art.medium} &bull; Dimensions: ${art.dimensions} &bull; Year: ${art.yearCreated} &bull; Commission Status: ${art.isCommissionOpen ? '🟢 Open' : '🔴 Closed'}*
${art.redbubbleUrl ? `- **[Redbubble Merch]**: [Shop Prints & Stickers](${art.redbubbleUrl})` : ''}
${art.inprntUrl ? `- **[INPRNT Gallery]**: [Order Giclée Prints](${art.inprntUrl})` : ''}
${art.etsyUrl ? `- **[Etsy Shop]**: [Buy Physical Original](${art.etsyUrl})` : ''}

> ${art.description}
`;

  return {
    id: art.id,
    title: art.title,
    author: art.artistName,
    coverColor: '#0284c7',
    sidecarMarkdown: yamlSidecar,
    totalChapters: 1,
    currentChapterIndex: 0,
    currentParagraphIndex: 0,
    resonanceStream: [
      {
        id: `res-art-${Date.now()}`,
        cfi: 'artwork-canvas',
        chapterTitle: 'Artwork Details',
        rawText: art.description,
        category: 'Artist Portfolio',
        progressPercent: 100,
        paragraphIndex: 0,
        paragraphSnippet: art.dimensions,
        formattedDate: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
      }
    ],
    chapters: [
      {
        title: 'Artwork Details & High-Res View',
        cfiBase: 'epubcfi(/6/2[ch1]!)',
        paragraphs: [
          `Title: ${art.title}`,
          `Artist: ${art.artistName} (${art.artistHandle})`,
          `Medium: ${art.medium}`,
          `Dimensions: ${art.dimensions}`,
          `Commission Price: $${art.priceUsd ? art.priceUsd.toLocaleString() : 'N/A'} USD`
        ]
      }
    ]
  };
}
