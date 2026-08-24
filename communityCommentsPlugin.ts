export interface CommunityComment {
  id: string;
  targetId: string; // Artwork or Book ID
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  badge?: string; // 🎨 Masterpiece, ✨ Inspiring, 🔥 Insta-Buy, 💖 Favorite
  content: string;
  timestamp: string;
  upvotesCount: number;
}

export const INITIAL_COMMUNITY_COMMENTS: CommunityComment[] = [
  {
    id: 'cmt-1',
    targetId: 'art-1',
    authorName: 'Wife (Dawn & Piplup Fan 🐧)',
    authorHandle: '@wife_piplup',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    badge: '🎨 Masterpiece',
    content: '💖 Oh my goodness, the Piplup Bubble Beam lighting effects are stunning! Best Sinnoh contest fanart ever!',
    timestamp: '15 minutes ago',
    upvotesCount: 12
  },
  {
    id: 'cmt-2',
    targetId: 'art-1',
    authorName: 'DanmeiScholar',
    authorHandle: '@danmei_scholar',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    badge: '✨ Inspiring',
    content: 'Love the ocean sapphire color palette! Added to my favorite community showcase.',
    timestamp: '1 hour ago',
    upvotesCount: 8
  },
  {
    id: 'cmt-3',
    targetId: 'art-2',
    authorName: 'SovereignAdmin',
    authorHandle: '@lorik',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    badge: '🔥 Insta-Buy',
    content: 'The traditional watercolor texture on Qing Jing Peak is incredible! Commissioning a companion piece soon.',
    timestamp: '2 hours ago',
    upvotesCount: 15
  }
];

export function getSavedCommunityComments(): CommunityComment[] {
  try {
    const raw = localStorage.getItem('lc_md_community_comments');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load community comments:', err);
  }
  return INITIAL_COMMUNITY_COMMENTS;
}

export function saveCommunityComments(comments: CommunityComment[]): void {
  try {
    localStorage.setItem('lc_md_community_comments', JSON.stringify(comments));
  } catch (err) {
    console.warn('Failed to save community comments:', err);
  }
}
