import type { Book } from '../types/resonance';

export interface PcComponentItem {
  category: 'CPU' | 'GPU' | 'Motherboard' | 'RAM' | 'Storage' | 'Power Supply' | 'Cooler' | 'Case' | 'Accessory';
  partName: string;
  priceUsd: number;
  neweggPartUrl?: string;
  wattage: number;
  specsSnippet: string;
}

export interface PcRigBuildCollection {
  id: string;
  rigTitle: string;
  buildPurpose: 'AI Workstation & LLM Server' | '4K Ultra Gaming Rig' | 'Sovereign Homelab NAS' | 'Compact SFF Portable Rig';
  estimatedWattage: number;
  totalCostUsd: number;
  components: PcComponentItem[];
  createdDate: string;
  tags: string[];
}

export const SAMPLE_PC_RIG_BUILDS: PcRigBuildCollection[] = [
  {
    id: `rig-ai-workstation-${Date.now()}`,
    rigTitle: 'Sovereign AI Deep Learning & 4K Workstation 2026',
    buildPurpose: 'AI Workstation & LLM Server',
    estimatedWattage: 950,
    totalCostUsd: 4850,
    createdDate: '2026-08-17',
    tags: ['pc-build', 'ai-workstation', 'rtx-5090', 'homelab', 'newegg-list'],
    components: [
      { category: 'CPU', partName: 'AMD Ryzen 9 9950X 16-Core / 32-Thread', priceUsd: 649, wattage: 170, specsSnippet: '4.3 GHz Base / 5.7 GHz Boost AM5' },
      { category: 'GPU', partName: 'NVIDIA GeForce RTX 5090 32GB GDDR7', priceUsd: 1999, wattage: 575, specsSnippet: '32GB GDDR7 512-bit DLSS 4.0' },
      { category: 'Motherboard', partName: 'ASUS ROG Crosshair X670E Hero', priceUsd: 629, wattage: 50, specsSnippet: 'PCIe 5.0, Wi-Fi 6E, Dual USB4' },
      { category: 'RAM', partName: 'G.SKILL Trident Z5 RGB 64GB (2x32GB) DDR5-6400', priceUsd: 219, wattage: 15, specsSnippet: 'CL32-39-39-102 1.40V' },
      { category: 'Storage', partName: 'SAMSUNG 990 PRO 4TB PCIe 4.0 NVMe SSD', priceUsd: 329, wattage: 10, specsSnippet: '7450 MB/s Read, 6900 MB/s Write' },
      { category: 'Power Supply', partName: 'CORSAIR HX1500i 1500W 80 PLUS Platinum', priceUsd: 399, wattage: 0, specsSnippet: 'Fully Modular ATX 3.0 PCIe 5.0' },
      { category: 'Cooler', partName: 'NZXT Kraken Elite 360 RGB AIO Liquid Cooler', priceUsd: 279, wattage: 20, specsSnippet: '360mm Radiator, LCD Display' },
      { category: 'Case', partName: 'LIAN LI O11 Dynamic EVO XL Black', priceUsd: 349, wattage: 0, specsSnippet: 'Full Tower E-ATX Tempered Glass' }
    ]
  },
  {
    id: `rig-sinnoh-piplup-${Date.now()}`,
    rigTitle: 'Piplup Sapphire 4K Gaming & Streaming Rig',
    buildPurpose: '4K Ultra Gaming Rig',
    estimatedWattage: 750,
    totalCostUsd: 2850,
    createdDate: '2026-08-17',
    tags: ['pc-build', 'gaming-pc', 'piplup-sapphire', '4k-gaming', 'custom-rig'],
    components: [
      { category: 'CPU', partName: 'AMD Ryzen 7 9800X3D 8-Core 3D V-Cache', priceUsd: 479, wattage: 120, specsSnippet: 'Second-Gen 3D V-Cache Technology' },
      { category: 'GPU', partName: 'NVIDIA GeForce RTX 4080 Super 16GB', priceUsd: 999, wattage: 320, specsSnippet: '16GB GDDR6X 256-bit DLSS 3.5' },
      { category: 'Motherboard', partName: 'MSI MAG B650 Tomahawk WiFi', priceUsd: 219, wattage: 40, specsSnippet: 'AM5, DDR5 Boost, PCIe 4.0' },
      { category: 'RAM', partName: 'CORSAIR Vengeance RGB 32GB (2x16GB) DDR5-6000', priceUsd: 129, wattage: 10, specsSnippet: 'CL30-36-36-76 AMD EXPO' },
      { category: 'Storage', partName: 'Crucial T700 2TB PCIe 5.0 NVMe SSD', priceUsd: 249, wattage: 10, specsSnippet: '12400 MB/s Read Speed' },
      { category: 'Power Supply', partName: 'Seasonics Vertex GX-1000 1000W 80+ Gold', priceUsd: 229, wattage: 0, specsSnippet: 'ATX 3.0 & PCIe 5.0 Ready' },
      { category: 'Cooler', partName: 'ARCTIC Liquid Freezer III 360 A-RGB', priceUsd: 139, wattage: 15, specsSnippet: '360mm AIO, VRM Fan' },
      { category: 'Case', partName: 'HYTE Y70 Touch Snow White Display Case', priceUsd: 389, wattage: 16, specsSnippet: 'Dual Chamber 4K Touchscreen Case' }
    ]
  }
];

export function convertPcRigBuildsToVaultBooks(builds: PcRigBuildCollection[]): Book[] {
  return builds.map(rig => {
    const yamlSidecar = `---
title: "${rig.rigTitle}"
purpose: "${rig.buildPurpose}"
estimated_wattage: ${rig.estimatedWattage}W
total_cost_usd: ${rig.totalCostUsd}
parts_count: ${rig.components.length}
format: "dcmd/pc-rig-build"
rel_link_root: "../../"
tags: [${rig.tags.map(t => `"${t}"`).join(', ')}]
---

# ${rig.rigTitle}

- **[Newegg / PC Builder Collection]**
  - **Purpose**: ${rig.buildPurpose}
  - **Total Estimated Cost**: $${rig.totalCostUsd.toLocaleString()} USD
  - **Power Requirement**: ${rig.estimatedWattage}W
  - **Component Count**: ${rig.components.length} parts

## 🛠️ Parts Breakdown

${rig.components.map(c => `- **${c.category}**: ${c.partName} — *$${c.priceUsd} USD* (${c.specsSnippet})`).join('\n')}

> Saved as Sovereign Companion sidecar library collection.
`;

    return {
      id: rig.id,
      title: rig.rigTitle,
      author: `${rig.buildPurpose} ($${rig.totalCostUsd.toLocaleString()} USD)`,
      coverColor: '#2563eb',
      sidecarMarkdown: yamlSidecar,
      totalChapters: rig.components.length,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      resonanceStream: rig.components.map((c, i) => ({
        id: `res-pc-${rig.id}-${i}`,
        cfi: `part-${i}`,
        chapterTitle: c.category,
        rawText: `${c.partName} ($${c.priceUsd} USD) - ${c.specsSnippet}`,
        category: 'PC Part',
        progressPercent: Math.round(((i + 1) / rig.components.length) * 100),
        paragraphIndex: i,
        paragraphSnippet: c.partName,
        formattedDate: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
      })),
      chapters: [
        {
          title: 'Parts List & Compatibility',
          cfiBase: 'epubcfi(/6/2[ch1]!)',
          paragraphs: rig.components.map(c => `${c.category}: ${c.partName} - $${c.priceUsd} USD`)
        }
      ]
    };
  });
}

export function generatePcPartPickerList(rig: PcRigBuildCollection): string {
  return `[PCPartPicker / Newegg Build List] ${rig.rigTitle}
Purpose: ${rig.buildPurpose} | Total: $${rig.totalCostUsd.toLocaleString()} USD | Est. Wattage: ${rig.estimatedWattage}W

${rig.components.map((c, i) => `${i + 1}. [${c.category}] ${c.partName} -- $${c.priceUsd} USD (${c.specsSnippet})`).join('\n')}
`;
}
