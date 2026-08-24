import type { AcquisitionProviderPlugin, AcquisitionLink } from '../types/importer';

export const ACQUISITION_PROVIDERS: AcquisitionProviderPlugin[] = [
  {
    id: 'novelupdates-series',
    name: 'NovelUpdates Webnovel Series & Translators',
    description: 'Generates NovelUpdates.com series links for Asian webnovels, chapter feeds, and official translation groups.',
    icon: '🌐',
    generateLinks: (title: string): AcquisitionLink[] => {
      const query = encodeURIComponent(title);
      return [
        {
          providerId: 'novelupdates-search',
          providerName: 'NovelUpdates Series Page',
          icon: '🌐',
          label: 'Find on NovelUpdates.com',
          url: `https://www.novelupdates.com/?s=${query}&post_type=series`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'ebay-marketplace',
    name: 'eBay Auctions & Marketplace',
    description: 'Generates live search links for eBay auctions, TCG cards, rare books, artwork, and physical collectibles.',
    icon: '🏷️',
    generateLinks: (title: string, author: string): AcquisitionLink[] => {
      const query = encodeURIComponent(`${title} ${author}`);
      return [
        {
          providerId: 'ebay-search',
          providerName: 'eBay Live Auctions & Listings',
          icon: '🏷️',
          label: 'Search eBay Auctions & Marketplace',
          url: `https://www.ebay.com/sch/i.html?_nkw=${query}`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'newegg-marketplace',
    name: 'Newegg Tech & Gaming Marketplace',
    description: 'Generates search links for Newegg physical media, retro games, hardware, and tech acquisitions.',
    icon: '💻',
    generateLinks: (title: string): AcquisitionLink[] => {
      const query = encodeURIComponent(title);
      return [
        {
          providerId: 'newegg-search',
          providerName: 'Newegg Electronics & Gaming',
          icon: '💻',
          label: 'Search Newegg Tech Marketplace',
          url: `https://www.newegg.com/p/pl?d=${query}`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'facebook-marketplace',
    name: 'Facebook Local Marketplace',
    description: 'Generates local neighborhood search links for Facebook Marketplace physical items and local pickups.',
    icon: '🏪',
    generateLinks: (title: string): AcquisitionLink[] => {
      const query = encodeURIComponent(title);
      return [
        {
          providerId: 'facebook-marketplace-search',
          providerName: 'Facebook Marketplace',
          icon: '🏪',
          label: 'Search Facebook Local Marketplace',
          url: `https://www.facebook.com/marketplace/search/?query=${query}`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'nextdoor-marketplace',
    name: 'Nextdoor Neighborhood Marketplace',
    description: 'Generates hyper-local neighborhood garage sale and trading links on Nextdoor.',
    icon: '🏘️',
    generateLinks: (title: string): AcquisitionLink[] => {
      const query = encodeURIComponent(title);
      return [
        {
          providerId: 'nextdoor-search',
          providerName: 'Nextdoor Neighborhood Yard Sales',
          icon: '🏘️',
          label: 'Search Nextdoor Neighborhood Marketplace',
          url: `https://nextdoor.com/for_sale_and_free/?query=${query}`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'kindle',
    name: 'Amazon Kindle App & Store',
    description: 'Generates kindle:// App deep-links and Amazon Store links for instant e-reader purchasing or opening.',
    icon: '📦',
    generateLinks: (title: string, author: string, isbn?: string): AcquisitionLink[] => {
      const query = encodeURIComponent(`${title} ${author}`);
      const asinParam = isbn ? `&asin=${isbn}` : '';
      return [
        {
          providerId: 'kindle',
          providerName: 'Kindle App Intent',
          icon: '📱',
          label: 'Open in Kindle App',
          url: `kindle://book?title=${encodeURIComponent(title)}${asinParam}`,
          isAppScheme: true
        },
        {
          providerId: 'kindle-store',
          providerName: 'Amazon Kindle Store',
          icon: '🛒',
          label: 'Find on Kindle Store',
          url: `https://www.amazon.com/s?k=${query}&i=digital-text`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'libby-overdrive',
    name: 'Libby / OverDrive Library Borrowing',
    description: 'Generates Libby App deep-links (libby://) and Web library search links for borrowing ebooks & audiobooks.',
    icon: '📚',
    generateLinks: (title: string, author: string): AcquisitionLink[] => {
      const query = encodeURIComponent(`${title} ${author}`);
      return [
        {
          providerId: 'libby-app',
          providerName: 'Libby App Intent',
          icon: '📖',
          label: 'Borrow on Libby App',
          url: `libby://search/library?query=${query}`,
          isAppScheme: true
        },
        {
          providerId: 'libby-web',
          providerName: 'Libby Library Web Search',
          icon: '🌐',
          label: 'Search Local Public Library (Libby)',
          url: `https://libbyapp.com/search/library/search?query=${query}`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'gutenberg-archive',
    name: 'Project Gutenberg & Internet Archive',
    description: 'Generates direct open-source EPUB download URLs for public domain & open access classics.',
    icon: '🏛️',
    generateLinks: (title: string, author: string): AcquisitionLink[] => {
      const query = encodeURIComponent(`${title} ${author}`);
      return [
        {
          providerId: 'gutenberg',
          providerName: 'Project Gutenberg',
          icon: '📜',
          label: 'Download Free EPUB (Gutenberg)',
          url: `https://www.gutenberg.org/ebooks/search/?query=${query}`,
          isAppScheme: false
        },
        {
          providerId: 'internet-archive',
          providerName: 'Internet Archive Open Library',
          icon: '🏛️',
          label: 'Borrow on Internet Archive',
          url: `https://archive.org/search.php?query=${query}`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'audible-media',
    name: 'Audible & Media Audiobooks',
    description: 'Generates Audible audiobook deep-links for listening sidecars.',
    icon: '🎧',
    generateLinks: (title: string, author: string): AcquisitionLink[] => {
      const query = encodeURIComponent(`${title} ${author}`);
      return [
        {
          providerId: 'audible',
          providerName: 'Audible Audiobooks',
          icon: '🎧',
          label: 'Listen on Audible',
          url: `https://www.audible.com/search?keywords=${query}`,
          isAppScheme: false
        }
      ];
    }
  },
  {
    id: 'webdav-server',
    name: 'Self-Hosted WebDAV / Calibre Server',
    description: 'Generates direct cloud://WebDAV streaming URLs for your personal cloud library.',
    icon: '☁️',
    generateLinks: (title: string, author: string): AcquisitionLink[] => {
      const cleanT = title.replace(/\s+/g, '_');
      const cleanA = author.replace(/\s+/g, '_');
      return [
        {
          providerId: 'webdav-stream',
          providerName: 'Self-Hosted WebDAV Stream',
          icon: '☁️',
          label: 'Stream from WebDAV Storage',
          url: `cloud://WebDAV/Books/${cleanA}/${cleanT}.epub`,
          isAppScheme: true
        }
      ];
    }
  }
];

export function generateAllAcquisitionLinks(title: string, author: string, isbn?: string): AcquisitionLink[] {
  const links: AcquisitionLink[] = [];
  ACQUISITION_PROVIDERS.forEach(provider => {
    links.push(...provider.generateLinks(title, author, isbn));
  });
  return links;
}
