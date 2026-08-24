export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarEmoji: string;
  bio: string;
  role: 'Admin / Vault Owner' | 'Family Member' | 'Curator & Artist' | 'Guest Reader';
  favoriteGenres: string[];
  joinedDate: string;
  inviteCodeUsed: string;
  customLinks?: {
    storeUrl?: string;
    affiliateTag?: string;
  };
  sslFingerprint?: string;
}

export function getSovereignInviteCode(): string {
  try {
    const custom = localStorage.getItem('lc_md_custom_invite_code');
    if (custom && custom.trim()) return custom.trim();
  } catch (err) {
    console.warn('Failed to load custom invite code:', err);
  }
  return (import.meta as any).env?.VITE_INVITE_CODE || 'meow';
}

export function setSovereignInviteCode(newCode: string): void {
  try {
    const cleaned = newCode.trim().toLowerCase();
    if (cleaned) {
      localStorage.setItem('lc_md_custom_invite_code', cleaned);
    }
  } catch (err) {
    console.warn('Failed to save custom invite code:', err);
  }
}

export const SOVEREIGN_INVITE_CODE = getSovereignInviteCode();

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user-lorik-admin',
    username: 'lorik_admin',
    displayName: 'Lorik (Sovereign Admin)',
    avatarEmoji: '🐱',
    bio: 'Architect of LC-MD & Black Box Site ecosystem. LitRPG enthusiast, PC builder, and sovereign vault curator.',
    role: 'Admin / Vault Owner',
    favoriteGenres: ['LitRPG & Cultivation', 'Danmei / SVSSS', 'TCG Grails', 'PC Rig Builds'],
    joinedDate: '2026-08-17',
    inviteCodeUsed: 'meow',
    customLinks: {
      storeUrl: 'https://meow.artkitty.net',
      affiliateTag: 'artkitty-20'
    },
    sslFingerprint: 'SHA256:8F:A2:4B:91:C3:E7:01:29:FF:42:01...'
  },
  {
    id: 'user-wife-piplup',
    username: 'wife_piplup',
    displayName: 'Wife (Piplup & Dawn Reader 🐧)',
    avatarEmoji: '🐧',
    bio: 'Sinnoh Sapphire champion, cozy reader, and digital art connoisseur.',
    role: 'Family Member',
    favoriteGenres: ['Cozy Fantasy', 'Piplup & Pokémon Art', 'Romance & Danmei', 'Cute Collectibles'],
    joinedDate: '2026-08-17',
    inviteCodeUsed: 'meow',
    customLinks: {
      storeUrl: 'https://www.redbubble.com/people/artkitty/shop'
    },
    sslFingerprint: 'SHA256:4C:19:D8:E2:04:A1:77:88:B3:99...'
  }
];

export function getSavedProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem('lc_md_user_profiles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load user profiles:', err);
  }
  return DEFAULT_PROFILES;
}

export function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem('lc_md_user_profiles', JSON.stringify(profiles));
  } catch (err) {
    console.warn('Failed to save user profiles:', err);
  }
}

export function getActiveProfile(): UserProfile {
  try {
    const activeId = localStorage.getItem('lc_md_active_profile_id');
    const profiles = getSavedProfiles();
    if (activeId) {
      const found = profiles.find(p => p.id === activeId);
      if (found) return found;
    }
    return profiles[0] || DEFAULT_PROFILES[0];
  } catch (err) {
    console.warn('Failed to get active profile:', err);
    return DEFAULT_PROFILES[0];
  }
}

export function setActiveProfileId(profileId: string): void {
  try {
    localStorage.setItem('lc_md_active_profile_id', profileId);
  } catch (err) {
    console.warn('Failed to set active profile id:', err);
  }
}

export interface RegisterResult {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

export function registerNewUser(
  username: string,
  displayName: string,
  avatarEmoji: string,
  bio: string,
  role: UserProfile['role'],
  favoriteGenres: string[],
  inviteCode: string
): RegisterResult {
  const currentMasterCode = getSovereignInviteCode();
  const normalizedCode = inviteCode.trim().toLowerCase();
  if (normalizedCode !== currentMasterCode.toLowerCase()) {
    return {
      success: false,
      message: `Invalid invite code. Access is restricted. Secret invite code '${currentMasterCode}' is required to register on this sovereign node.`
    };
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!cleanUsername) {
    return { success: false, message: 'Please provide a valid username.' };
  }

  const profiles = getSavedProfiles();
  if (profiles.some(p => p.username.toLowerCase() === cleanUsername)) {
    return { success: false, message: `Username @${cleanUsername} is already registered.` };
  }

  const newProfile: UserProfile = {
    id: `user-${cleanUsername}-${Date.now()}`,
    username: cleanUsername,
    displayName: displayName.trim() || cleanUsername,
    avatarEmoji: avatarEmoji || '🐱',
    bio: bio.trim() || 'Sovereign library member.',
    role: role || 'Family Member',
    favoriteGenres: favoriteGenres.length > 0 ? favoriteGenres : ['LitRPG & Cultivation', 'Cozy Fantasy'],
    joinedDate: new Date().toISOString().split('T')[0],
    inviteCodeUsed: normalizedCode,
    sslFingerprint: `SHA256:${Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':')}... (mTLS X.509)`
  };

  const updatedProfiles = [...profiles, newProfile];
  saveProfiles(updatedProfiles);
  setActiveProfileId(newProfile.id);

  return {
    success: true,
    message: `Welcome @${cleanUsername}! Account registered with invite code '${currentMasterCode}'.`,
    profile: newProfile
  };
}

export function updateExistingProfile(updatedProfile: UserProfile): void {
  const profiles = getSavedProfiles();
  const index = profiles.findIndex(p => p.id === updatedProfile.id);
  if (index !== -1) {
    profiles[index] = updatedProfile;
    saveProfiles(profiles);
  }
}
