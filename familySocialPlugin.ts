export interface FamilyFriend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  relationship: 'Wife' | 'Husband' | 'Sibling' | 'Parent' | 'Child' | 'Friend';
  favoritePokemon?: string;
  themePreference: string;
  isFollowing: boolean;
  isFriend: boolean;
  currentlyReading: string;
  lastActive: string;
}

export interface FamilyActivityItem {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  action: 'started_book' | 'added_quote' | 'completed_book' | 'changed_theme';
  bookTitle: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; reactedBy: string[] }[];
}

export const INITIAL_FAMILY_FRIENDS: FamilyFriend[] = [
  {
    id: 'friend-wife',
    name: 'Wife (Dawn & Piplup Fan 🐧)',
    email: 'wife.piplup@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    relationship: 'Wife',
    favoritePokemon: '🐧 Piplup (Penguin Pokemon)',
    themePreference: 'piplup-dawn',
    isFollowing: true,
    isFriend: true,
    currentlyReading: 'The Scum Villain\'s Self-Saving System (SVSSS)',
    lastActive: '5 minutes ago'
  },
  {
    id: 'friend-brother',
    name: 'Brother (Sinnoh Champion)',
    email: 'bro.sinnoh@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    relationship: 'Sibling',
    favoritePokemon: '🔥 Infernape',
    themePreference: 'dracula',
    isFollowing: true,
    isFriend: true,
    currentlyReading: 'Dungeon Crawler Carl',
    lastActive: '2 hours ago'
  }
];

export const INITIAL_FAMILY_FEED: FamilyActivityItem[] = [
  {
    id: 'act-1',
    friendId: 'friend-wife',
    friendName: 'Wife (Dawn & Piplup Fan 🐧)',
    friendAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    action: 'added_quote',
    bookTitle: 'The Scum Villain\'s Self-Saving System',
    content: '✨ "System B-Points restored! Piplup Bubble Beam approved quote in Chapter 3!"',
    timestamp: '10 minutes ago',
    reactions: [
      { emoji: '🐧', count: 4, reactedBy: ['Lorik'] },
      { emoji: '💦', count: 2, reactedBy: ['Lorik'] },
      { emoji: '✨', count: 3, reactedBy: ['Brother'] }
    ]
  },
  {
    id: 'act-2',
    friendId: 'friend-brother',
    friendName: 'Brother (Sinnoh Champion)',
    friendAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    action: 'completed_book',
    bookTitle: 'The Crafting of Chess',
    content: '🎉 Finished reading all chapters! Rated 5/5 stars on sovereign sidecar!',
    timestamp: '1 hour ago',
    reactions: [
      { emoji: '👑', count: 2, reactedBy: ['Wife'] },
      { emoji: '🔥', count: 5, reactedBy: ['Lorik'] }
    ]
  }
];

export function getSavedFamilyFriends(): FamilyFriend[] {
  try {
    const raw = localStorage.getItem('lc_md_family_friends');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load family friends:', err);
  }
  return INITIAL_FAMILY_FRIENDS;
}

export function saveFamilyFriends(friends: FamilyFriend[]): void {
  try {
    localStorage.setItem('lc_md_family_friends', JSON.stringify(friends));
  } catch (err) {
    console.warn('Failed to save family friends:', err);
  }
}
