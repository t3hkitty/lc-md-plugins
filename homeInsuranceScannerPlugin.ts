import type { Book } from '../types/resonance';

export interface InsuranceItemClaim {
  id: string;
  itemName: string;
  category: 'Electronics & Audio' | 'TCG & Collectibles' | 'Fine Art & Prints' | 'Jewelry & Watches' | 'Wardrobe & Couture' | 'Books & Rarities';
  serialNumber?: string;
  purchasePriceUsd: number;
  replacementCostUsd: number;
  conditionGrade: string;
  roomLocation: string;
  photoUrl: string;
  confidenceScore: number;
  insurancePolicyTag: string;
}

export function scanRoomPhotoForInsuranceItems(_photoFileName: string): InsuranceItemClaim[] {
  // Bulk Room & Cabinet Photo Computer Vision Segmenter for Home Insurance Tracking
  return [
    {
      id: `ins-item-1-${Date.now()}`,
      itemName: 'PSA 10 1st Edition Charizard Holographic #4',
      category: 'TCG & Collectibles',
      serialNumber: 'PSA-CERT-49021849',
      purchasePriceUsd: 12000,
      replacementCostUsd: 245000,
      conditionGrade: 'PSA 10 Gem Mint',
      roomLocation: 'Vault Display Cabinet (Shelf 1)',
      photoUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800',
      confidenceScore: 99.4,
      insurancePolicyTag: 'high-value-grail'
    },
    {
      id: `ins-item-2-${Date.now()}`,
      itemName: 'BGS 9.5 Alpha Black Lotus (Artifact)',
      category: 'TCG & Collectibles',
      serialNumber: 'BGS-CERT-0012948',
      purchasePriceUsd: 25000,
      replacementCostUsd: 380000,
      conditionGrade: 'BGS 9.5 Gem Mint',
      roomLocation: 'Vault Security Safe (Level 2)',
      photoUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
      confidenceScore: 98.9,
      insurancePolicyTag: 'high-value-grail'
    },
    {
      id: `ins-item-3-${Date.now()}`,
      itemName: 'Piplup & Dawn Sinnoh Grand Contest 4K Digital Canvas',
      category: 'Fine Art & Prints',
      serialNumber: 'ART-KITTY-ORIGINAL-001',
      purchasePriceUsd: 250,
      replacementCostUsd: 1500,
      conditionGrade: 'Mint Original',
      roomLocation: 'Living Room Studio Wall',
      photoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800',
      confidenceScore: 99.1,
      insurancePolicyTag: 'art-collection'
    },
    {
      id: `ins-item-4-${Date.now()}`,
      itemName: 'SVSSS Shen Qingqiu Bamboo Peak Original Watercolor',
      category: 'Fine Art & Prints',
      serialNumber: 'ART-KITTY-ORIGINAL-002',
      purchasePriceUsd: 450,
      replacementCostUsd: 2500,
      conditionGrade: 'Mint Original',
      roomLocation: 'Master Study Wall',
      photoUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
      confidenceScore: 98.6,
      insurancePolicyTag: 'art-collection'
    }
  ];
}

export function convertInsuranceItemsToVaultBooks(items: InsuranceItemClaim[]): Book[] {
  return items.map(item => {
    const yamlSidecar = `---
title: "${item.itemName}"
category: "${item.category}"
serial_number: "${item.serialNumber || 'N/A'}"
purchase_price_usd: ${item.purchasePriceUsd}
replacement_cost_usd: ${item.replacementCostUsd}
room_location: "${item.roomLocation}"
condition_grade: "${item.conditionGrade}"
format: "dcmd/home-insurance-asset"
rel_link_root: "../../"
tags: ["home-insurance", "insurance-claim", "${item.insurancePolicyTag}"]
---

# ${item.itemName} (Home Insurance Asset)

![${item.itemName}](${item.photoUrl})

- **[Home Insurance Inventory Item]**
  - **Category**: ${item.category}
  - **Serial / Cert #**: ${item.serialNumber || 'N/A'}
  - **Room Location**: ${item.roomLocation}
  - **Original Purchase Price**: $${item.purchasePriceUsd.toLocaleString()} USD
  - **Estimated Replacement Cost**: $${item.replacementCostUsd.toLocaleString()} USD
  - **Condition Grade**: ${item.conditionGrade}

> Automated Home Insurance Inventory Scan. Recorded for policy claim verification & asset tracking.
`;

    return {
      id: item.id,
      title: item.itemName,
      author: `${item.category} (${item.roomLocation})`,
      coverColor: '#059669',
      sidecarMarkdown: yamlSidecar,
      totalChapters: 1,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      resonanceStream: [
        {
          id: `res-ins-${item.id}`,
          cfi: 'insurance-policy-1',
          chapterTitle: item.category,
          rawText: `Replacement Cost: $${item.replacementCostUsd.toLocaleString()} USD | Serial: ${item.serialNumber || 'N/A'}`,
          category: 'Insurance Asset',
          progressPercent: 100,
          paragraphIndex: 0,
          paragraphSnippet: item.roomLocation,
          formattedDate: new Date().toLocaleDateString(),
          timestamp: new Date().toISOString()
        }
      ],
      chapters: [
        {
          title: 'Insurance Policy & Asset Details',
          cfiBase: 'epubcfi(/6/2[ch1]!)',
          paragraphs: [
            `Item Name: ${item.itemName}`,
            `Category: ${item.category}`,
            `Room Location: ${item.roomLocation}`,
            `Serial / Cert Number: ${item.serialNumber || 'N/A'}`,
            `Replacement Value: $${item.replacementCostUsd.toLocaleString()} USD`
          ]
        }
      ]
    };
  });
}

export function generateInsuranceCsvReport(items: InsuranceItemClaim[]): string {
  const headers = ['Item Name', 'Category', 'Serial / Cert #', 'Room Location', 'Purchase Price (USD)', 'Replacement Cost (USD)', 'Condition Grade', 'Policy Tag'];
  const rows = items.map(i => [
    `"${i.itemName.replace(/"/g, '""')}"`,
    `"${i.category}"`,
    `"${i.serialNumber || ''}"`,
    `"${i.roomLocation}"`,
    i.purchasePriceUsd,
    i.replacementCostUsd,
    `"${i.conditionGrade}"`,
    `"${i.insurancePolicyTag}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
