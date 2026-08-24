import type { DistributionChannel } from '../types/mediaTypes';

export interface DistributionProviderPlugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  generateChannelUrl: (workTitle: string, handleOrStore?: string) => DistributionChannel;
}

export const DISTRIBUTION_PLUGINS: DistributionProviderPlugin[] = [
  {
    id: 'artstation-behance',
    name: 'ArtStation & Behance Portfolio',
    description: 'Public portfolio channel for concept art, 3D models, and digital illustration.',
    icon: '🎨',
    generateChannelUrl: (title: string, handle = 'artist') => ({
      id: 'artstation',
      channelName: 'ArtStation Portfolio',
      icon: '🎨',
      url: `https://www.artstation.com/${handle}/artwork/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`,
      isPublic: true
    })
  },
  {
    id: 'etsy-shop',
    name: 'Etsy Handcrafted Shop',
    description: 'Etsy storefront distribution channel for physical crafts, prints, and original art.',
    icon: '🛍️',
    generateChannelUrl: (title: string, shop = 'myshop') => ({
      id: 'etsy',
      channelName: 'Etsy Store Listing',
      icon: '🛍️',
      url: `https://www.etsy.com/shop/${shop}?search_query=${encodeURIComponent(title)}`,
      isPublic: true
    })
  },
  {
    id: 'gumroad-itch',
    name: 'Gumroad & Itch.io Digital Store',
    description: 'Digital distribution channel for 3D assets, e-books, brushes, and game dev packs.',
    icon: '📦',
    generateChannelUrl: (title: string, handle = 'creator') => ({
      id: 'gumroad',
      channelName: 'Gumroad Digital Product',
      icon: '📦',
      url: `https://${handle}.gumroad.com/l/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`,
      isPublic: true
    })
  },
  {
    id: 'amazon-kdp',
    name: 'Amazon KDP Self-Publishing',
    description: 'Kindle Direct Publishing ASIN distribution channel for self-published authors.',
    icon: '📚',
    generateChannelUrl: (title: string) => ({
      id: 'kdp',
      channelName: 'Amazon KDP Storefront',
      icon: '📚',
      url: `https://www.amazon.com/dp/s?k=${encodeURIComponent(title)}`,
      isPublic: true
    })
  },
  {
    id: 'opensea-nft',
    name: 'OpenSea / Foundation NFT Provenance',
    description: 'Blockchain provenance and digital certificate distribution channel.',
    icon: '🖼️',
    generateChannelUrl: (title: string, wallet = '0x123...') => ({
      id: 'opensea',
      channelName: 'OpenSea NFT Certificate',
      icon: '🖼️',
      url: `https://opensea.io/assets/${wallet}/${encodeURIComponent(title)}`,
      isPublic: true
    })
  }
];
