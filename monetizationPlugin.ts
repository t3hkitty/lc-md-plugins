export interface CurationMonetizationConfig {
  amazonAssociateTag: string;
  neweggAffiliateId: string;
  bhPhotoAffiliateId: string;
  microCenterTag: string;
  kindleUnlimitedTag: string;
  bookshopOrgId: string;
  ebayCampaignId: string;
  koboAffiliateId: string;
  redbubbleStoreUrl: string;
  inprntStoreUrl: string;
  etsyStoreUrl: string;
  isMonetizationEnabled: boolean;
}

export const DEFAULT_MONETIZATION_CONFIG: CurationMonetizationConfig = {
  amazonAssociateTag: 'artkitty-20',
  neweggAffiliateId: 'newegg-artkitty-20',
  bhPhotoAffiliateId: 'bh-artkitty-2026',
  microCenterTag: 'mc-artkitty-vault',
  kindleUnlimitedTag: 'artkitty-ku-20',
  bookshopOrgId: 'artkitty-books',
  ebayCampaignId: '5338901234',
  koboAffiliateId: 'rakuten-artkitty',
  redbubbleStoreUrl: 'https://www.redbubble.com/people/artkitty/shop',
  inprntStoreUrl: 'https://www.inprnt.com/gallery/artkitty/',
  etsyStoreUrl: 'https://www.etsy.com/shop/ArtKittyStudio',
  isMonetizationEnabled: true
};

export function getSavedMonetizationConfig(): CurationMonetizationConfig {
  try {
    const raw = localStorage.getItem('lc_md_monetization_config');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load monetization config:', err);
  }
  return DEFAULT_MONETIZATION_CONFIG;
}

export function saveMonetizationConfig(config: CurationMonetizationConfig): void {
  try {
    localStorage.setItem('lc_md_monetization_config', JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save monetization config:', err);
  }
}

export function appendAffiliateTagsToUrl(url: string, config: CurationMonetizationConfig = getSavedMonetizationConfig()): string {
  if (!config.isMonetizationEnabled || !url) return url;

  try {
    const parsed = new URL(url);

    // Newegg Affiliate Tagging
    if (parsed.hostname.includes('newegg.com') && config.neweggAffiliateId) {
      parsed.searchParams.set('cm_mmc', `AFC-C8Junction-_-na-_-na-_-na`);
      parsed.searchParams.set('subid', config.neweggAffiliateId);
      return parsed.toString();
    }

    // Amazon Associates Tagging
    if (parsed.hostname.includes('amazon.com') && config.amazonAssociateTag) {
      parsed.searchParams.set('tag', config.amazonAssociateTag);
      return parsed.toString();
    }

    // B&H Photo Video Tagging
    if (parsed.hostname.includes('bhphotovideo.com') && config.bhPhotoAffiliateId) {
      parsed.searchParams.set('BI', config.bhPhotoAffiliateId);
      return parsed.toString();
    }

    // Micro Center Tagging
    if (parsed.hostname.includes('microcenter.com') && config.microCenterTag) {
      parsed.searchParams.set('storeCode', config.microCenterTag);
      return parsed.toString();
    }

    // Bookshop.org Tagging
    if (parsed.hostname.includes('bookshop.org') && config.bookshopOrgId) {
      parsed.searchParams.set('a', config.bookshopOrgId);
      return parsed.toString();
    }

    // eBay Campaign Tagging
    if (parsed.hostname.includes('ebay.com') && config.ebayCampaignId) {
      parsed.searchParams.set('mkcid', '1');
      parsed.searchParams.set('mkrid', '711-53200-19255-0');
      parsed.searchParams.set('siteid', '0');
      parsed.searchParams.set('campid', config.ebayCampaignId);
      return parsed.toString();
    }
  } catch (_err) {
    // If relative or invalid URL, return original
  }

  return url;
}

export function generateMonetizedShareLink(rigTitle: string, _partsListText?: string, config: CurationMonetizationConfig = getSavedMonetizationConfig()): string {
  const encodedTitle = encodeURIComponent(rigTitle);
  const neweggTag = config.neweggAffiliateId ? `&newegg_tag=${config.neweggAffiliateId}` : '';
  const amazonTag = config.amazonAssociateTag ? `&amazon_tag=${config.amazonAssociateTag}` : '';

  return `https://meow.artkitty.net/lcmd/?share_rig=${encodedTitle}${neweggTag}${amazonTag}`;
}
