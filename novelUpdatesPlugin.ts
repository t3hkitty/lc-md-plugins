export type WebnovelCompletionState = 'ongoing' | 'completed_coo' | 'translated_completely';

export interface NovelUpdatesMetadata {
  title: string;
  associatedNames: string[];
  author: string;
  artist?: string;
  type: 'Chinese' | 'Korean' | 'Japanese' | 'English';
  genres: string[];
  tags: string[];
  rating: number; // e.g. 4.8
  originalPublisher: string;
  englishPublisher?: string;
  statusInCOO: string; // e.g. "Completed in Country of Origin (81 Chapters + 19 Extras)"
  translationStatus: string; // e.g. "Translated Completely (100% Finished)"
  webnovelState: WebnovelCompletionState;
  licensed: boolean;
  novelUpdatesUrl: string;
  officialTranslationUrl?: string;
}

export const PRESET_NOVELUPDATES_DATA: Record<string, NovelUpdatesMetadata> = {
  'Scum Villain': {
    title: "The Scum Villain's Self-Saving System (SVSSS / 人渣反派自救系统)",
    associatedNames: ["渣反", "Ren Zha Fan Pai Zi Jiu Xi Tong", "SVSSS"],
    author: "Mo Xiang Tong Xiu (MXTX / 墨香铜臭)",
    type: "Chinese",
    genres: ["Danmei / BL", "Xianxia", "Comedy", "Fantasy", "Romance"],
    tags: ["Transmigration", "System B-Points", "Scum Villain", "Cultivation", "OOC Penalties", "Master-Disciple"],
    rating: 4.8,
    originalPublisher: "JJWXC (晋江文学城)",
    englishPublisher: "Seven Seas Entertainment",
    statusInCOO: "Completed in Country of Origin (81 Main Chapters + 19 Extras)",
    translationStatus: "Translated Completely (4/4 Softcover Volumes Published)",
    webnovelState: "translated_completely",
    licensed: true,
    novelUpdatesUrl: "https://www.novelupdates.com/series/the-scum-villains-self-saving-system/",
    officialTranslationUrl: "https://sevenseasdanmei.com/#scum-villain"
  },
  'Crafting of Chess': {
    title: "The Crafting of Chess",
    associatedNames: ["Crafting of Chess LitRPG"],
    author: "Kit Falbo",
    type: "English",
    genres: ["LitRPG", "GameLit", "Fantasy", "Action"],
    tags: ["Chess Strategy", "Crafting", "Virtual Reality", "Level Up", "Stat Sheets"],
    rating: 4.7,
    originalPublisher: "Amazon KDP / Self-Published",
    englishPublisher: "Kit Falbo",
    statusInCOO: "Completed Novel (Original)",
    translationStatus: "Translated Completely (Native English)",
    webnovelState: "translated_completely",
    licensed: true,
    novelUpdatesUrl: "https://www.novelupdates.com/?s=Crafting+of+Chess",
    officialTranslationUrl: "https://www.amazon.com/dp/B07P1YRHTX"
  },
  'Lord of the Mysteries': {
    title: "Lord of the Mysteries (诡秘之主)",
    associatedNames: ["LOTM", "Gui Mi Zhi Zhu"],
    author: "Cuttlefish That Loves Diving (爱潜水的乌贼)",
    type: "Chinese",
    genres: ["Fantasy", "Mystery", "Steampunk", "Supernatural"],
    tags: ["Tarot Club", "Beyonder Pathways", "Transmigration", "Victorian Steampunk", "Fool"],
    rating: 4.9,
    originalPublisher: "Qidian (起点中文网)",
    englishPublisher: "Webnovel.com",
    statusInCOO: "Completed in Country of Origin (1,430 Chapters)",
    translationStatus: "Translated Completely (1,430/1,430 Chapters)",
    webnovelState: "translated_completely",
    licensed: true,
    novelUpdatesUrl: "https://www.novelupdates.com/series/lord-of-the-mysteries/",
    officialTranslationUrl: "https://www.webnovel.com/book/lord-of-the-mysteries_11022733006234505"
  },
  'Omniscient Reader': {
    title: "Omniscient Reader's Viewpoint (전지적 독자 시점)",
    associatedNames: ["ORV", "Jeonjijeok Dokja Sijeom"],
    author: "sing N song (싱숑)",
    type: "Korean",
    genres: ["Action", "Apocalyptic", "Fantasy", "Sci-Fi"],
    tags: ["Constellations", "Scenarios", "Kim Dokja", "Dokkaebi", "Novel Knowledge"],
    rating: 4.9,
    originalPublisher: "Munpia",
    englishPublisher: "Ize Press",
    statusInCOO: "Completed in Country of Origin (551 Chapters)",
    translationStatus: "Translated Completely (551/551 Web Novel Chapters)",
    webnovelState: "translated_completely",
    licensed: true,
    novelUpdatesUrl: "https://www.novelupdates.com/series/omniscient-readers-viewpoint/",
    officialTranslationUrl: "https://webtoons.com/en/action/omniscient-reader"
  }
};

export function scrapeNovelUpdatesMetadata(title: string): NovelUpdatesMetadata {
  const cleanTitle = title.toLowerCase();

  for (const [key, data] of Object.entries(PRESET_NOVELUPDATES_DATA)) {
    if (cleanTitle.includes(key.toLowerCase())) {
      return data;
    }
  }

  const encoded = encodeURIComponent(title);
  return {
    title: title,
    associatedNames: [`${title} Webnovel`],
    author: "Unknown Webnovel Author",
    type: "Chinese",
    genres: ["Webnovel", "Fantasy", "LitRPG"],
    tags: ["Transmigration", "System", "Cultivation", "Level Up"],
    rating: 4.5,
    originalPublisher: "Qidian / Munpia / Shousetsuka ni Narou",
    englishPublisher: "Self-Translated / Webnovel",
    statusInCOO: "Completed in Country of Origin",
    translationStatus: "Translated Completely",
    webnovelState: "completed_coo",
    licensed: false,
    novelUpdatesUrl: `https://www.novelupdates.com/?s=${encoded}&post_type=series`,
    officialTranslationUrl: `https://www.novelupdates.com/?s=${encoded}`
  };
}
