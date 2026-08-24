import type { Book } from '../types/resonance';

export type GiftResponseRating = 'loved_it' | 'enjoyed' | 'neutral' | 'hated_it';

export interface GiftRecord {
  id: string;
  recipientName: string;
  recipientRelationship: string;
  giftTitle: string;
  occasion: string;
  priceUsd: number;
  datePurchased: string;
  responseRating: GiftResponseRating;
  reactionNotes: string;
  suggestedFollowUpGifts: string[];
}

export const SAMPLE_GIFT_RECORDS: GiftRecord[] = [
  {
    id: `gift-1-${Date.now()}`,
    recipientName: 'Wife (Piplup Fan 🐧)',
    recipientRelationship: 'Spouse',
    giftTitle: 'Pokémon Center Limited Edition Piplup Plushie & Dawn Scarf',
    occasion: 'Birthday 2025',
    priceUsd: 45,
    datePurchased: '2025-11-14',
    responseRating: 'loved_it',
    reactionNotes: 'She squealed with joy and placed it right on her primary desk setup! Wore the Dawn scarf all winter.',
    suggestedFollowUpGifts: [
      'Piplup & Dawn Sinnoh Grand Contest 4K Canvas Print',
      'Pokémon Brilliant Diamond / Shining Pearl Collector Art Book',
      'Custom Sapphire Blue Mechanical Keyboard Wrist Rest'
    ]
  },
  {
    id: `gift-2-${Date.now()}`,
    recipientName: 'Brother (Tech & PC Builder)',
    recipientRelationship: 'Sibling',
    giftTitle: 'LIAN LI O11 Dynamic EVO XL PC Case (Black)',
    occasion: 'Christmas 2025',
    priceUsd: 349,
    datePurchased: '2025-12-20',
    responseRating: 'loved_it',
    reactionNotes: 'Loved it! Transferred his entire 4K gaming build into it the same weekend.',
    suggestedFollowUpGifts: [
      'NVIDIA RTX 5090 Custom Cable Extension Kit (Sleeved Black)',
      'iFixit Pro Tech Toolkit for PC Assembly',
      'CORSAIR Platinum 1500W Modular Power Supply'
    ]
  },
  {
    id: `gift-3-${Date.now()}`,
    recipientName: 'Mom (Cozy Fantasy Reader)',
    recipientRelationship: 'Parent',
    giftTitle: 'The Very Secret Society of Witches Hardcover Collector Edition',
    occasion: 'Mother\'s Day 2025',
    priceUsd: 30,
    datePurchased: '2025-05-10',
    responseRating: 'enjoyed',
    reactionNotes: 'Finished reading it in 3 days. Loved the cozy teahouse magical atmosphere.',
    suggestedFollowUpGifts: [
      'Legends & Lattes Special Illustrated Edition by Travis Baldree',
      'House in the Cerulean Sea Hardcover Box Set',
      'Custom Ceramic Bookish Tea Mug'
    ]
  }
];

export function getSavedGiftRecords(): GiftRecord[] {
  try {
    const raw = localStorage.getItem('lc_md_gift_records');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load gift records:', err);
  }
  return SAMPLE_GIFT_RECORDS;
}

export function saveGiftRecords(gifts: GiftRecord[]): void {
  try {
    localStorage.setItem('lc_md_gift_records', JSON.stringify(gifts));
  } catch (err) {
    console.warn('Failed to save gift records:', err);
  }
}

export function convertGiftsToVaultBooks(gifts: GiftRecord[]): Book[] {
  return gifts.map(gift => {
    const yamlSidecar = `---
title: "Gift: ${gift.giftTitle}"
recipient: "${gift.recipientName}"
relationship: "${gift.recipientRelationship}"
occasion: "${gift.occasion}"
price_usd: ${gift.priceUsd}
date_purchased: "${gift.datePurchased}"
response_rating: "${gift.responseRating}"
format: "dcmd/gift-tracker"
rel_link_root: "../../"
tags: ["gift-tracker", "recipient-${gift.recipientName.toLowerCase().replace(/[^a-z0-9]/g, '')}", "response-${gift.responseRating}"]
---

# Gift Record: ${gift.giftTitle}

- **[Gift Logged for ${gift.recipientName}]**
  - **Occasion**: ${gift.occasion}
  - **Date Purchased**: ${gift.datePurchased}
  - **Price**: $${gift.priceUsd} USD
  - **Reaction Rating**: ${gift.responseRating.toUpperCase().replace('_', ' ')}

> **Reaction Notes**: "${gift.reactionNotes}"

## 💡 Suggested Follow-Up Gift Ideas
${gift.suggestedFollowUpGifts.map(s => `- **Recommended**: ${s}`).join('\n')}
`;

    return {
      id: gift.id,
      title: `Gift: ${gift.giftTitle} (${gift.recipientName})`,
      author: `${gift.occasion} - Rating: ${gift.responseRating.toUpperCase()}`,
      coverColor: gift.responseRating === 'loved_it' ? '#ec4899' : gift.responseRating === 'enjoyed' ? '#10b981' : '#64748b',
      sidecarMarkdown: yamlSidecar,
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      resonanceStream: [
        {
          id: `res-gift-${gift.id}`,
          cfi: 'gift-1',
          chapterTitle: gift.occasion,
          rawText: `Recipient: ${gift.recipientName} | Rating: ${gift.responseRating} | Price: $${gift.priceUsd} USD`,
          category: 'Gift Record',
          progressPercent: 100,
          paragraphIndex: 0,
          paragraphSnippet: gift.reactionNotes,
          formattedDate: gift.datePurchased,
          timestamp: new Date().toISOString()
        }
      ],
      chapters: [
        {
          title: 'Gift Details & Reaction',
          cfiBase: 'epubcfi(/6/2[ch1]!)',
          paragraphs: [
            `Gift Name: ${gift.giftTitle}`,
            `Recipient: ${gift.recipientName}`,
            `Occasion: ${gift.occasion}`,
            `Reaction: ${gift.responseRating.toUpperCase()}`,
            `Notes: ${gift.reactionNotes}`
          ]
        }
      ]
    };
  });
}
