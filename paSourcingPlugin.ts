import type { Book } from '../types/resonance';
import type { MediaItem } from '../types/mediaTypes';

export interface PASourcingItem {
  id: string;
  title: string;
  creatorOrAuthor: string;
  category: string; // e.g. "TCG Card", "Funko Pop / Wishlist", "Book Hardcover", "Wardrobe"
  targetMaxBudgetUSD?: number;
  notes?: string;
  sourcingLinks: { label: string; url: string }[];
}

export function buildPASourcingGroceryItems(books: Book[], mediaItems: MediaItem[]): PASourcingItem[] {
  const items: PASourcingItem[] = [];

  // 1. Digital Only Dreamlist Unacquired Items & Collectibles
  mediaItems.filter(i => i.isDigitalOnlyDreamlist || i.isDigitalOnlyWishlist || i.notes?.toLowerCase().includes('dreamlist') || i.notes?.toLowerCase().includes('wishlist') || i.notes?.toLowerCase().includes('green')).forEach(i => {
    const query = encodeURIComponent(`${i.title} ${i.creator}`);
    items.push({
      id: i.id,
      title: i.title,
      creatorOrAuthor: i.creator,
      category: '✨ Dreamlist Unacquired Collectible',
      targetMaxBudgetUSD: i.tcgInfo?.currentValuation || 150,
      notes: i.notes || 'Unacquired target item on Dreamlist for physical acquisition',
      sourcingLinks: [
        { label: 'eBay Auction Search', url: `https://www.ebay.com/sch/i.html?_nkw=${query}` },
        { label: 'Facebook Marketplace', url: `https://www.facebook.com/marketplace/search/?query=${query}` },
        { label: 'Nextdoor Yard Sales', url: `https://nextdoor.com/for_sale_and_free/?query=${query}` }
      ]
    });
  });

  // 2. TCG Cards Wanted or For Trade
  mediaItems.filter(i => i.mediaType === 'tcg').forEach(i => {
    const query = encodeURIComponent(`${i.title} ${i.tcgInfo?.grading || ''}`);
    items.push({
      id: i.id,
      title: i.title,
      creatorOrAuthor: i.creator,
      category: `🃏 TCG Card (${i.tcgInfo?.grading || 'Raw NM'})`,
      targetMaxBudgetUSD: i.tcgInfo?.currentValuation || 500,
      notes: `Holder: ${i.tcgInfo?.tcgStorage.toUpperCase()} | Status: ${i.tcgInfo?.tradeStatus.toUpperCase()}`,
      sourcingLinks: [
        { label: 'eBay Live Card Search', url: `https://www.ebay.com/sch/i.html?_nkw=${query}` },
        { label: 'Newegg Tech Marketplace', url: `https://www.newegg.com/p/pl?d=${query}` }
      ]
    });
  });

  // 3. Books & Ebooks
  books.forEach(b => {
    const query = encodeURIComponent(`${b.title} ${b.author}`);
    items.push({
      id: b.id,
      title: b.title,
      creatorOrAuthor: b.author,
      category: '📚 Hardcover / Ebook Acquisition',
      targetMaxBudgetUSD: 45,
      notes: `Chapters: ${b.chapters.length} | Sidecar: ./${b.title.toLowerCase().replace(/\s+/g, '_')}.md`,
      sourcingLinks: [
        { label: 'Amazon Kindle Store', url: `https://www.amazon.com/s?k=${query}&i=digital-text` },
        { label: 'Libby Public Library Search', url: `https://libbyapp.com/search/library/search?query=${query}` },
        { label: 'Project Gutenberg EPUB', url: `https://www.gutenberg.org/ebooks/search/?query=${query}` }
      ]
    });
  });

  return items;
}

export function generatePAGroceryListMarkdown(books: Book[], mediaItems: MediaItem[]): string {
  const sourcingItems = buildPASourcingGroceryItems(books, mediaItems);

  let md = `# 📋 Executive PA & Assistant Acquisition Grocery List\n`;
  md += `> **Generated with Sovereign Library Companion MD v3.8**\n\n`;
  md += `--- \n\n`;
  md += `## 🎯 Target Acquisitions Checklist (${sourcingItems.length} Items)\n\n`;

  sourcingItems.forEach((item, idx) => {
    md += `### ${idx + 1}. [ ] ${item.title} — ${item.creatorOrAuthor}\n`;
    md += `- **Category**: ${item.category}\n`;
    if (item.targetMaxBudgetUSD) {
      md += `- **Target Max Budget**: $${item.targetMaxBudgetUSD.toLocaleString()} USD\n`;
    }
    if (item.notes) {
      md += `- **Notes / Specs**: ${item.notes}\n`;
    }
    md += `- **Direct PA Sourcing Links**:\n`;
    item.sourcingLinks.forEach(link => {
      md += `  - [${link.label}](${link.url})\n`;
    });
    md += `\n`;
  });

  md += `---\n*Please mark items as [x] once acquired and update target serial locations.*`;
  return md;
}

export function generatePAGroceryListHtml(books: Book[], mediaItems: MediaItem[]): string {
  const sourcingItems = buildPASourcingGroceryItems(books, mediaItems);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive PA Sourcing & Acquisition Grocery List</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; }
    .card-dark { background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(51, 65, 85, 0.8); }
  </style>
</head>
<body class="p-6 md:p-12 min-h-screen">
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="p-6 rounded-3xl card-dark shadow-2xl flex items-center justify-between border-amber-500/40">
      <div>
        <h1 class="text-2xl font-extrabold text-amber-300 flex items-center space-x-2">
          <span>📋 Executive PA Sourcing Grocery List</span>
        </h1>
        <p class="text-xs text-slate-400 font-mono mt-1">Generated by Sovereign Library Companion MD &bull; ${sourcingItems.length} Target Items</p>
      </div>
      <span class="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
        PA SOURCING READY
      </span>
    </header>

    <div class="space-y-4">
      ${sourcingItems.map(item => `
        <div class="p-5 rounded-2xl card-dark space-y-3">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-bold text-base text-slate-100">${item.title}</h3>
              <p class="text-xs text-slate-400 font-mono">${item.creatorOrAuthor} &bull; ${item.category}</p>
            </div>
            ${item.targetMaxBudgetUSD ? `<span class="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">Max Budget: $${item.targetMaxBudgetUSD.toLocaleString()} USD</span>` : ''}
          </div>

          ${item.notes ? `<p class="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl font-mono border border-slate-800">${item.notes}</p>` : ''}

          <div class="pt-2 border-t border-slate-800 flex items-center space-x-2 flex-wrap gap-y-2">
            <span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mr-2">Sourcing Links:</span>
            ${item.sourcingLinks.map(link => `
              <a href="${link.url}" target="_blank" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-sky-300 font-bold text-xs transition-colors">
                ${link.label} ↗
              </a>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
}
