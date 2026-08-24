export interface CommunitySidecarTemplate {
  id: string;
  title: string;
  category: 'Danmei & Webnovels' | 'TCG Grails' | 'LitRPG' | 'Pop Relics' | 'Wardrobe';
  authorName: string;
  authorAvatar: string;
  downloadsCount: number;
  upvotesCount: number;
  description: string;
  tags: string[];
  markdownPreview: string;
}

export interface CommunityForumThread {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  repliesCount: number;
  upvotesCount: number;
  timestamp: string;
  snippet: string;
  pinned?: boolean;
}

export const COMMUNITY_SIDECAR_TEMPLATES: CommunitySidecarTemplate[] = [
  {
    id: 'tpl-danmei-mxtx',
    title: 'MXTX Danmei Deluxe Companion Sidecar Pack',
    category: 'Danmei & Webnovels',
    authorName: 'DanmeiScholar',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    downloadsCount: 1420,
    upvotesCount: 389,
    description: 'Complete YAML frontmatter & markdown structure for SVSSS, MDZS, and TGCF. Includes System B-Point trackers and character matrices.',
    tags: ['danmei', 'mxtx', 'scum-villain', 'bl', 'xianxia'],
    markdownPreview: `---
title: "The Scum Villain's Self-Saving System"
author: "Mo Xiang Tong Xiu (MXTX)"
format: "dcmd/sidecar"
rel_link_root: "../../"
novel_updates:
  rating: 4.6
  status: "Completed (4 Volumes)"
tags: ["danmei", "bl", "litrpg-system"]
---
# MXTX Danmei Companion Notes
`
  },
  {
    id: 'tpl-tcg-psa10',
    title: 'PSA 10 Holographic TCG Grail Valuation Template',
    category: 'TCG Grails',
    authorName: 'TCG_Collector99',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    downloadsCount: 980,
    upvotesCount: 245,
    description: 'Standardized schema for 1st Edition Charizard, Black Lotus, and PSA/BGS pop reports with market valuation formulas.',
    tags: ['psa-10', 'tcg-grail', 'first-edition', 'charizard', 'black-lotus'],
    markdownPreview: `---
title: "1st Edition Charizard Holographic #4"
author: "Pokémon Base Set (1999)"
format: "dcmd/sidecar"
card_metadata:
  grade: "PSA 10 Gem Mint"
  valuation_usd: 245000
tags: ["psa-10", "first-edition", "tcg-grail"]
---
# TCG Grail Metadata & Sales History
`
  },
  {
    id: 'tpl-litrpg-statblock',
    title: 'LitRPG Stat-Block & Dungeon Core Tracker Schema',
    category: 'LitRPG',
    authorName: 'DungeonMasterCarl',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    downloadsCount: 1850,
    upvotesCount: 512,
    description: 'Formatted stat blocks, spell lists, crafting recipes, and Princess Donut reaction tables for LitRPG novels.',
    tags: ['litrpg', 'stat-block', 'crafting', 'dungeon-core'],
    markdownPreview: `---
title: "The Crafting of Chess"
author: "Kit Falbo"
format: "dcmd/sidecar"
litrpg_stats:
  class: "Chessmaster Crafter"
  level: 45
tags: ["litrpg", "crafting"]
---
# LitRPG Progression Notes
`
  }
];

export const COMMUNITY_FORUM_THREADS: CommunityForumThread[] = [
  {
    id: 'thread-1',
    title: '📢 Welcome to the Sovereign LC-MD Community Hub! Self-Hosting & Sidecar Exchange Guide',
    category: '☁️ Self-Hosting & Midphase',
    authorName: 'SovereignAdmin',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    repliesCount: 48,
    upvotesCount: 156,
    timestamp: '2 hours ago',
    snippet: 'Welcome to our global community section! Share your companion sidecars, discuss LitRPG & Danmei chapters, and swap TCG card valuations.',
    pinned: true
  },
  {
    id: 'thread-2',
    title: '⚔️ Favorite LitRPG System Mechanics? Crafting vs Dungeon Crawler Carl Dungeon AI',
    category: '📚 LitRPG & Webnovel Guild',
    authorName: 'DonutFanatic',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    repliesCount: 32,
    upvotesCount: 89,
    timestamp: '5 hours ago',
    snippet: 'Which LitRPG progression system do you find most satisfying for taking notes in your companion sidecar?'
  },
  {
    id: 'thread-3',
    title: '🃏 PSA 10 Gem Mint Charizard Market Update: Recent eBay Sold Listings Analysis',
    category: '🃏 TCG Grails Exchange',
    authorName: 'CardVaultMaster',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    repliesCount: 19,
    upvotesCount: 64,
    timestamp: '1 day ago',
    snippet: 'Analyzing verified eBay sold listings for 1999 Base Set 1st Edition Charizard #4 and Alpha Black Lotus.'
  }
];

export function getSavedCommunityTemplates(): CommunitySidecarTemplate[] {
  try {
    const raw = localStorage.getItem('lc_md_community_templates');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load community templates:', err);
  }
  return COMMUNITY_SIDECAR_TEMPLATES;
}

export function saveCommunityTemplates(templates: CommunitySidecarTemplate[]): void {
  try {
    localStorage.setItem('lc_md_community_templates', JSON.stringify(templates));
  } catch (err) {
    console.warn('Failed to save community templates:', err);
  }
}
