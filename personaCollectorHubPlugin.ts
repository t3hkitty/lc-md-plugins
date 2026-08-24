/**
 * Persona, Feed Engine & Collector Tools Plugin
 * Anxiety Reducer (Calm Mode), Preference/Suffering Ledger, Person Slugs ([Contact:Name]),
 * Piplup Cameo Finder & Plushie Cubbies with Build-A-Bear Wardrobe Tracking.
 */

export interface PreferenceSufferingItem {
  id: string;
  type: 'hard-like' | 'hard-dislike' | 'sensory-trigger' | 'friction-point';
  title: string;
  description: string;
  mitigationStrategy?: string;
  intensity: 1 | 2 | 3 | 4 | 5; // 5 = severe sensory trigger
  tags: string[];
}

export interface PersonContactSlug {
  id: string;
  contactSlug: string; // e.g. '[Contact:Alex]'
  name: string;
  relationship: 'Friend' | 'Family' | 'Doctor' | 'Colleague' | 'Creative Collaborator';
  communicationPreference: 'Async Text Only' | 'Phone Call OK' | 'Discord DM' | 'Email';
  birthdayOrSpecialDate?: string;
  giftPreferences: string[];
  sensitiveTopicsToAvoid: string[];
  recentNotes: string[];
  color: string;
}

export interface PiplupCameoItem {
  id: string;
  title: string;
  sourceType: 'Official TCG' | 'Anime Cameo' | 'Plush Grail' | 'Fan Art Highlight' | 'Merch Drop' | 'Japanese Promo';
  artistOrStudio: string;
  releaseYear: number;
  marketPriceUsd: number;
  imageUrl: string;
  rarityTier: 'Common Cute' | 'Holo Rare' | 'Secret Rare Grail' | 'Japanese Promo';
  loreSnippet: string;
  verifiedLink: string;
}

export interface PlushieItem {
  id: string;
  name: string;
  brand: 'Build-A-Bear' | 'Sanrio' | 'Squishmallows' | 'Pokémon Center' | 'Custom Art Doll';
  cubbyLocation: string; // e.g. "Cubby #1 (Top Shelf)"
  speciesOrCharacter: string;
  acquisitionDate: string;
  scentTag?: string; // e.g. "Cotton Candy Scent Disc"
  soundChip?: string; // e.g. "Piplup Pip-Pip Cry"
  apparelItems: Array<{
    id: string;
    itemName: string;
    category: 'Shirt' | 'Hoodie' | 'Pants' | 'Footwear' | 'Headwear' | 'Accessory';
    color: string;
  }>;
  imageUrl: string;
  estimatedValueUsd: number;
}

export const DEFAULT_PREFERENCE_SUFFERING: PreferenceSufferingItem[] = [
  {
    id: 'ps-1',
    type: 'sensory-trigger',
    title: 'Unexpected Fluorescent / Overhead White Lighting',
    description: 'Harsh 5000K overhead light triggers rapid cognitive fatigue and eye strain.',
    mitigationStrategy: 'Wear amber-tinted blue blockers and switch to 1800K warm desk lamps.',
    intensity: 5,
    tags: ['lighting', 'sensory', 'migraine-trigger']
  },
  {
    id: 'ps-2',
    type: 'friction-point',
    title: 'Ambiguous Open-Ended Instructions Without Checklists',
    description: 'Vague prompts generate executive function freeze.',
    mitigationStrategy: 'Route task through "No Bad Days" Goblin decomposition engine into 2-minute steps.',
    intensity: 4,
    tags: ['audhd', 'executive-function', 'task-freeze']
  },
  {
    id: 'ps-3',
    type: 'hard-like',
    title: 'Cold Mineral Electrolyte Hydration & Fresh Bananas',
    description: 'Instant baseline energy restoration with zero chewing friction.',
    mitigationStrategy: 'Keep counter stocked with fresh organic bananas.',
    intensity: 1,
    tags: ['fuel', 'routine', 'comfort']
  },
  {
    id: 'ps-4',
    type: 'hard-like',
    title: 'Tactile Mechanical Keyboards with Lubricated Linear Switches',
    description: 'Rhythmic typing cadence lowers anxiety and grounds attention.',
    mitigationStrategy: 'Stationed on mahogany desk with cat resting pad beside keyboard.',
    intensity: 1,
    tags: ['tactile', 'focus', 'keyboard']
  }
];

export const DEFAULT_PERSON_CONTACTS: PersonContactSlug[] = [
  {
    id: 'cont-1',
    contactSlug: '[Contact:Alex]',
    name: 'Alex Rivera',
    relationship: 'Creative Collaborator',
    communicationPreference: 'Async Text Only',
    birthdayOrSpecialDate: 'October 14',
    giftPreferences: ['Specialty Genmaicha Tea', 'Fountain Pen Inks', 'Piplup Enamel Pins'],
    sensitiveTopicsToAvoid: ['Unscheduled impromptu phone calls'],
    recentNotes: ['Co-drafting Chapter 4 of the Danmei fantasy novel.'],
    color: '#6366f1'
  },
  {
    id: 'cont-2',
    contactSlug: '[Contact:Mom]',
    name: 'Mom',
    relationship: 'Family',
    communicationPreference: 'Phone Call OK',
    birthdayOrSpecialDate: 'May 22',
    giftPreferences: ['Lavender bath salts', 'Cozy botanical cardigans', 'Framed family photos'],
    sensitiveTopicsToAvoid: ['Work crunch hours before 10 AM'],
    recentNotes: ['Shared photos of the cat sleeping on the enter key.'],
    color: '#ec4899'
  }
];

export const DEFAULT_PIPLUP_CAMEOS: PiplupCameoItem[] = [
  {
    id: 'pip-1',
    title: 'Dawn & Piplup Character Rare (VMAX Climax CHR)',
    sourceType: 'Official TCG',
    artistOrStudio: 'Yuu Nishida',
    releaseYear: 2021,
    marketPriceUsd: 28.50,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
    rarityTier: 'Secret Rare Grail',
    loreSnippet: 'Dawn lovingly cradling Piplup after winning the Sinnoh Grand Festival ribbon.',
    verifiedLink: 'https://www.pokemon.com/us/pokemon-tcg/'
  },
  {
    id: 'pip-2',
    title: 'Piplup Diamond & Pearl Japanese Promo Holo',
    sourceType: 'Japanese Promo',
    artistOrStudio: 'Ken Sugimori Studio',
    releaseYear: 2006,
    marketPriceUsd: 110.00,
    imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500',
    rarityTier: 'Secret Rare Grail',
    loreSnippet: 'Classic Sinnoh starter promo illustration with glowing blue ice sparkles.',
    verifiedLink: 'https://jp.pokemontcg.com'
  },
  {
    id: 'pip-3',
    title: 'Build-A-Bear Piplup with Winter Parka & Poké Ball Hoodie',
    sourceType: 'Plush Grail',
    artistOrStudio: 'Build-A-Bear Workshop',
    releaseYear: 2018,
    marketPriceUsd: 95.00,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
    rarityTier: 'Holo Rare',
    loreSnippet: 'Full sized 15-inch plush with authentic 6-in-1 sound box and custom winter parka.',
    verifiedLink: 'https://www.buildabear.com'
  }
];

export const DEFAULT_PLUSHIE_CUBBIES: PlushieItem[] = [
  {
    id: 'plush-1',
    name: 'Captain Piplup (Winter Edition)',
    brand: 'Build-A-Bear',
    cubbyLocation: 'Cubby #1 (Top Shelf Center)',
    speciesOrCharacter: 'Piplup (Penguin Pokémon)',
    acquisitionDate: '2023-11-20',
    scentTag: 'Marshmallow Dream Disc',
    soundChip: 'Piplup 6-in-1 Voice Box',
    apparelItems: [
      { id: 'app-1', itemName: 'Cerulean Winter Parka', category: 'Hoodie', color: '#0284c7' },
      { id: 'app-2', itemName: 'Miniature Snow Boots', category: 'Footwear', color: '#334155' },
      { id: 'app-3', itemName: 'Sinnoh Ribbon Badge', category: 'Accessory', color: '#f59e0b' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
    estimatedValueUsd: 95.00
  },
  {
    id: 'plush-2',
    name: 'Cinnamoroll Pastel Cloud',
    brand: 'Sanrio',
    cubbyLocation: 'Cubby #2 (Middle Left)',
    speciesOrCharacter: 'Cinnamoroll',
    acquisitionDate: '2024-03-15',
    apparelItems: [
      { id: 'app-4', itemName: 'Pastel Blue Bowtie', category: 'Accessory', color: '#38bdf8' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
    estimatedValueUsd: 45.00
  }
];

export const PREF_STORAGE_KEY = 'lc_md_pref_suffering_v1';
export const CONTACTS_STORAGE_KEY = 'lc_md_person_contacts_v1';
export const PIPLUP_STORAGE_KEY = 'lc_md_piplup_cameos_v1';
export const PLUSHIE_STORAGE_KEY = 'lc_md_plushie_cubbies_v1';

export function loadPreferenceSuffering(): PreferenceSufferingItem[] {
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load preferences:', err);
  }
  return DEFAULT_PREFERENCE_SUFFERING;
}

export function savePreferenceSuffering(items: PreferenceSufferingItem[]): void {
  try {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save preferences:', err);
  }
}

export function loadPersonContacts(): PersonContactSlug[] {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load contacts:', err);
  }
  return DEFAULT_PERSON_CONTACTS;
}

export function savePersonContacts(contacts: PersonContactSlug[]): void {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Failed to save contacts:', err);
  }
}

export function loadPiplupCameos(): PiplupCameoItem[] {
  try {
    const raw = localStorage.getItem(PIPLUP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load Piplup cameos:', err);
  }
  return DEFAULT_PIPLUP_CAMEOS;
}

export function savePiplupCameos(items: PiplupCameoItem[]): void {
  try {
    localStorage.setItem(PIPLUP_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save Piplup cameos:', err);
  }
}

export function loadPlushieCubbies(): PlushieItem[] {
  try {
    const raw = localStorage.getItem(PLUSHIE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load plushies:', err);
  }
  return DEFAULT_PLUSHIE_CUBBIES;
}

export function savePlushieCubbies(items: PlushieItem[]): void {
  try {
    localStorage.setItem(PLUSHIE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save plushies:', err);
  }
}
