import type { PluginManifest, PluginState } from '../types/plugins';

export type ThemeId = 'midnight' | 'sepia' | 'nord' | 'dracula' | 'e-ink' | 'piplup-dawn';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bg: string;
  text: string;
  cardBg: string;
  border: string;
  accent: string;
  badgeBg: string;
  description: string;
}

export const THEME_PRESETS: Record<ThemeId, ThemeConfig> = {
  'piplup-dawn': {
    id: 'piplup-dawn',
    name: '🐧 Piplup & Dawn (Sinnoh Sapphire & Ice Pearl)',
    bg: 'bg-[#0c192c]',
    text: 'text-[#e0f2fe]',
    cardBg: 'bg-[#162a45]',
    border: 'border-[#0284c7]',
    accent: '#38bdf8',
    badgeBg: 'bg-sky-500/20 text-sky-200 border-sky-400/50',
    description: 'Sinnoh Pokemon Contest Pearl & Ocean Sapphire theme featuring Piplup Bubble Beam blue, Dawn Pink Ribbon accents & Penguin Beak Amber!'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Sovereign (Dark)',
    bg: 'bg-[#0f172a]',
    text: 'text-slate-100',
    cardBg: 'bg-slate-900',
    border: 'border-slate-800',
    accent: '#6366f1',
    badgeBg: 'bg-indigo-500/20 text-indigo-300',
    description: 'Deep midnight indigo with warm amber highlights.'
  },
  sepia: {
    id: 'sepia',
    name: 'Solarized Sepia (Warm)',
    bg: 'bg-[#fbf0d9]',
    text: 'text-[#433422]',
    cardBg: 'bg-[#f4e4c1]',
    border: 'border-[#e6d0a7]',
    accent: '#b45309',
    badgeBg: 'bg-amber-500/20 text-amber-800',
    description: 'Classic warm paper theme designed for extended reading sessions.'
  },
  nord: {
    id: 'nord',
    name: 'Nord Aurora (Cool)',
    bg: 'bg-[#2e3440]',
    text: 'text-[#eceff4]',
    cardBg: 'bg-[#3b4252]',
    border: 'border-[#4c566a]',
    accent: '#88c0d0',
    badgeBg: 'bg-cyan-500/20 text-cyan-200',
    description: 'Arctic ice palette for calm visual focus.'
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula Dark (Vivid)',
    bg: 'bg-[#282a36]',
    text: 'text-[#f8f8f2]',
    cardBg: 'bg-[#44475a]',
    border: 'border-[#6272a4]',
    accent: '#ff79c6',
    badgeBg: 'bg-pink-500/20 text-pink-300',
    description: 'High contrast dark theme with vibrant neon highlights.'
  },
  'e-ink': {
    id: 'e-ink',
    name: 'E-Ink Paper (Monochrome)',
    bg: 'bg-[#f5f5f5]',
    text: 'text-[#111111]',
    cardBg: 'bg-[#e5e5e5]',
    border: 'border-[#cccccc]',
    accent: '#000000',
    badgeBg: 'bg-black/10 text-black',
    description: 'Zero distraction high contrast black & white reading mode.'
  }
};

export const DEFAULT_PLUGINS: (PluginManifest & { version: string })[] = [
  {
    id: 'library-view',
    name: 'Sovereign Grand Library Bookshelf & YAML Processor',
    version: '1.0.0',
    description: 'Renders the Grand Library Bookshelf View and processes custom YAML frontmatter metadata in sidecars.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'reader'
  },
  {
    id: 'list-view',
    name: 'Library Tabular List View Plugin',
    version: '1.0.0',
    description: 'Detailed list rows view with cover thumbnails, series badges, chapter metrics, and quick action buttons.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'reader'
  },
  {
    id: 'carousel-view',
    name: '3D Interactive Cover Showcase Carousel Plugin',
    version: '1.0.0',
    description: '3D sliding cover flow carousel with active hero card showcase and smooth navigation.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'reader'
  },
  {
    id: 'bookshelf-spines',
    name: 'Realistic Physical Bookshelf & Spines View Plugin',
    version: '1.0.0',
    description: 'Realistic wood-textured mahogany bookshelf with vertical embossed book spines, gold foil titles, and pull-out animations.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'reader'
  },
  {
    id: 'wardrobe-hangers',
    name: 'Wardrobe Closet & Dress Hangers View Plugin',
    version: '1.0.0',
    description: 'Hang your books and media items on wooden dress coat hangers inside a cedar closet rack.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'reader'
  },
  {
    id: 'selective-metadata',
    name: 'Single-Entry Selective Metadata Scraper',
    version: '1.2.0',
    description: 'Scrapes Open Library metadata and presents field-by-field merge pickers.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'metadata'
  },
  {
    id: 'micro-tweets',
    name: 'Live Reaction Micro-Tweet Stream',
    version: '2.0.1',
    description: 'Formats live reader reactions into sovereign #hashtags and CFI Markdown sidecars.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'social'
  },
  {
    id: 'moonplus-rel-root',
    name: 'Moon+ Reader Path Configurator',
    version: '3.0.0',
    description: 'Configures ebook sourcing paths and companion .md (dcmd) sidecar save locations (OPDS works built-in).',
    author: 'LC-MD Core',
    enabledByDefault: false,
    category: 'storage'
  },
  {
    id: 'epub-engine',
    name: 'In-Browser EPUB Metadata & TOC Engine',
    version: '1.0.5',
    description: 'JSZip EPUB parser extracting OPF metadata, TOCs, covers, and HTML chapters.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'reader'
  },
  {
    id: 'calibre-db',
    name: 'Calibre Library JSON Importer',
    version: '1.1.0',
    description: 'Imports Calibre metadata.json and sanitizes folder paths.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'storage'
  },
  {
    id: 'obsidian-notion-sync',
    name: 'Obsidian & Notion Sidecar Exporter',
    version: '2.1.0',
    description: 'Converts sidecars to Obsidian [[wikilinks]] & Notion markdown callouts.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'export'
  },
  {
    id: 'webdav-indexer',
    name: 'WebDAV Cloud Directory Indexer',
    version: '1.4.0',
    description: 'Scans WebDAV cloud directories and generates Markdown index files.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'storage'
  },
  {
    id: 'theme-engine',
    name: '5-Preset Theme & Visual Engine',
    version: '1.0.0',
    description: 'Provides Midnight, Sepia, Nord, Dracula, and E-Ink reading themes.',
    author: 'LC-MD Core',
    enabledByDefault: true,
    category: 'reader'
  },
  {
    id: 'custom-monetizer-plugin',
    name: 'Custom Affiliate & Monetization Tag Manager',
    version: '1.0.0',
    description: 'Sovereign opt-in plugin template: LC-MD uses ZERO monetary or affiliate links by default, but developers can enable this plugin to attach custom referral codes.',
    author: 'Community / Custom Plugin',
    enabledByDefault: false,
    category: 'export'
  }
];

const LOCAL_PLUGIN_STATE_KEY = 'lc_md_plugin_state_v3';

export const INITIAL_PLUGIN_STATE: PluginState = {
  enabledPlugins: {
    'library-view': true,
    'list-view': true,
    'carousel-view': true,
    'bookshelf-spines': true,
    'wardrobe-hangers': true,
    'selective-metadata': true,
    'micro-tweets': true,
    'moonplus-rel-root': false,
    'epub-engine': true,
    'calibre-db': true,
    'obsidian-notion-sync': true,
    'webnovel-reader': true,
    'webdav-indexer': true,
    'theme-engine': true,
    'custom-monetizer-plugin': false,
  },
  relLinkRoot: './Library',
  webdavConfig: {
    serverUrl: 'https://uploads.filejump.com/dav/',
    username: '',
    token: '',
    autoSync: false,
  },
  activeTheme: 'midnight',
  localAccessMode: 'read-write',
  configStorageLocation: 'remote-cloud'
};

export function loadSavedPluginState(): PluginState {
  try {
    const raw = localStorage.getItem(LOCAL_PLUGIN_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.enabledPlugins) {
        if (parsed.enabledPlugins['library-view'] === undefined) parsed.enabledPlugins['library-view'] = true;
        if (parsed.enabledPlugins['list-view'] === undefined) parsed.enabledPlugins['list-view'] = true;
        if (parsed.enabledPlugins['carousel-view'] === undefined) parsed.enabledPlugins['carousel-view'] = true;
        if (parsed.enabledPlugins['bookshelf-spines'] === undefined) parsed.enabledPlugins['bookshelf-spines'] = true;
        if (parsed.enabledPlugins['wardrobe-hangers'] === undefined) parsed.enabledPlugins['wardrobe-hangers'] = true;
        if (parsed.enabledPlugins['custom-monetizer-plugin'] === undefined) parsed.enabledPlugins['custom-monetizer-plugin'] = false;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load plugin state from localStorage:', err);
  }
  return INITIAL_PLUGIN_STATE;
}

export function savePluginState(state: PluginState): void {
  try {
    localStorage.setItem(LOCAL_PLUGIN_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save plugin state to localStorage:', err);
  }
}
