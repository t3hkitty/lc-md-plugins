import type { Book } from '../types/resonance';
import type { MediaItem } from '../types/mediaTypes';
import type { WebDAVConfig } from '../types/plugins';

export function generateStandaloneShowcaseHtml(
  books: Book[],
  mediaItems: MediaItem[],
  siteTitle = 'Sovereign Grand Library & TCG Vault'
): string {
  const totalValuation = mediaItems.reduce((acc, item) => {
    if (item.tcgInfo) return acc + (item.tcgInfo.currentValuation || 0);
    return acc + 250;
  }, 0);

  const tcgCount = mediaItems.filter(i => i.mediaType === 'tcg').length;

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #090d16; color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
    .card-glass { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.6); }
    .badge-gold { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4); }
    .badge-emerald { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }
  </style>
</head>
<body class="min-h-screen p-6 md:p-12">
  <div class="max-w-6xl mx-auto space-y-8">
    
    <!-- Grand Showcase Header -->
    <header class="p-8 rounded-3xl card-glass shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-3">
          <span>📖 ${siteTitle}</span>
          <span class="text-xs px-3 py-1 rounded-full badge-gold font-mono font-bold">Self-Hosted Showcase</span>
        </h1>
        <p className="text-sm text-slate-400 font-mono mt-1">
          Published with LC-MD v3.8 &bull; ${books.length} Books &bull; ${mediaItems.length} Physical / TCG Items
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right font-mono">
        <span class="text-xs text-slate-500 uppercase tracking-widest block">Total Vault Valuation</span>
        <span class="text-2xl font-extrabold text-emerald-400">$${totalValuation.toLocaleString()} USD</span>
        <span class="text-[10px] text-amber-400 block mt-0.5">₿ ${(totalValuation / 85000).toFixed(4)} BTC &bull; £ ${(totalValuation * 0.8).toLocaleString()} GBP</span>
      </div>
    </header>

    <!-- TCG & Physical Collectibles Showcase Section -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-amber-300 font-mono flex items-center space-x-2">
          <span>🃏 TCG Cards & Rare Collectibles Showcase (${mediaItems.length})</span>
        </h2>
        <span class="text-xs text-slate-400 font-mono">${tcgCount} TCG Slabs & Binders</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${mediaItems.map(item => `
          <div class="p-6 rounded-3xl card-glass space-y-4 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg">
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="font-extrabold text-base text-slate-100">${item.title}</h3>
                  <p class="text-xs text-slate-400">${item.creator}</p>
                </div>
                ${item.tcgInfo?.isVaultedInSafe ? '<span class="px-2 py-0.5 rounded-full badge-gold text-[10px] font-mono font-bold">🔒 VAULTED</span>' : ''}
                ${item.isDigitalOnlyWishlist ? '<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">📱 WISHLIST</span>' : ''}
              </div>

              ${item.tcgInfo ? `
                <div class="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-xs font-mono space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Grading: <strong class="text-amber-300">${item.tcgInfo.grading || 'Raw NM'}</strong></span>
                    <span class="text-emerald-400 font-bold">$${item.tcgInfo.currentValuation.toLocaleString()} USD</span>
                  </div>
                  <div class="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Holder: ${item.tcgInfo.tcgStorage.toUpperCase()}</span>
                    <span>Status: ${item.tcgInfo.tradeStatus.toUpperCase()}</span>
                  </div>
                </div>
              ` : ''}

              <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1">
                <span class="text-slate-500 block text-[10px]">Location: ${item.location.room} &bull; ${item.location.bookshelfRack}</span>
                <span class="text-amber-300 font-bold text-[11px] block">Serial: ${item.serialCode}</span>
              </div>

              ${item.provenanceLinks && item.provenanceLinks.length > 0 ? `
                <div class="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] font-mono space-y-1">
                  <span class="text-amber-300 font-bold block text-[10px]">📜 Provenance Verified (${item.provenanceLinks.length}):</span>
                  ${item.provenanceLinks.map(p => `
                    <a href="${p.url}" target="_blank" class="text-sky-300 hover:underline block truncate text-[10px]">&bull; ${p.title}</a>
                  `).join('')}
                </div>
              ` : ''}

              ${item.notes ? `<p class="text-xs text-slate-400 italic">${item.notes}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Books & Literature Section -->
    <section class="space-y-4 pt-6 border-t border-slate-800">
      <h2 class="text-xl font-bold text-indigo-300 font-mono">📚 Books & Companion Sidecars (${books.length})</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${books.map(b => `
          <div class="p-5 rounded-2xl card-glass flex items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-14 rounded-xl shadow flex items-center justify-center text-white font-bold text-lg" style="background-color: ${b.coverColor || '#0284c7'}">📖</div>
              <div>
                <h4 class="font-bold text-sm text-slate-100">${b.title}</h4>
                <p class="text-xs text-slate-400">${b.author} &bull; ${b.chapters.length} Chapters</p>
                <span class="text-[10px] font-mono text-amber-300">Sidecar: ./${b.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Footer -->
    <footer class="pt-8 text-center text-xs text-slate-500 font-mono border-t border-slate-800">
      Generated with Sovereign Library Companion MD v3.8 &bull; 100% Free & Open Source (FOSS)
    </footer>

  </div>
</body>
</html>`;
}

export async function publishHtmlToWebDAV(
  htmlContent: string,
  config: WebDAVConfig,
  remoteFilename = 'library_showcase.html'
): Promise<{ success: boolean; publicUrl: string; error?: string }> {
  if (!config.serverUrl || !config.token) {
    return {
      success: false,
      publicUrl: '',
      error: 'WebDAV Server URL and Access Token are required in Cloud Accounts.'
    };
  }

  const targetUrl = config.serverUrl.endsWith('/')
    ? `${config.serverUrl}${remoteFilename}`
    : `${config.serverUrl}/${remoteFilename}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'text/html; charset=utf-8'
      },
      body: htmlContent
    });

    if (response.ok || response.status === 201 || response.status === 204) {
      return {
        success: true,
        publicUrl: targetUrl
      };
    } else {
      return {
        success: false,
        publicUrl: targetUrl,
        error: `Server responded with HTTP status ${response.status} ${response.statusText}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      publicUrl: targetUrl,
      error: err?.message || 'Failed to connect to self-hosted WebDAV server.'
    };
  }
}
