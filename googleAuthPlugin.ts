export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  familyRole: 'Admin / Host' | 'Family Member' | 'Guest';
}

export interface GoogleAuthConfig {
  clientId: string;
  allowedEmails: string[];
  autoSyncGoogleDrive: boolean;
  midphaseDomain: string;
}

export const MOCK_GOOGLE_FAMILY_MEMBERS: GoogleUserProfile[] = [
  {
    googleId: 'g-1092837419283',
    email: 'lorik.family@gmail.com',
    name: 'Lorik (Host)',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    familyRole: 'Admin / Host'
  },
  {
    googleId: 'g-8273641092834',
    email: 'family.reader@gmail.com',
    name: 'Family Member 1',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    familyRole: 'Family Member'
  }
];

export function getSavedGoogleAuthConfig(): GoogleAuthConfig {
  try {
    const raw = localStorage.getItem('lc_md_google_auth_config');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load Google Auth Config:', err);
  }
  return {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    allowedEmails: ['lorik.family@gmail.com', 'family.reader@gmail.com'],
    autoSyncGoogleDrive: true,
    midphaseDomain: 'https://library.yourdomain.com'
  };
}

export function saveGoogleAuthConfig(cfg: GoogleAuthConfig): void {
  try {
    localStorage.setItem('lc_md_google_auth_config', JSON.stringify(cfg));
  } catch (err) {
    console.warn('Failed to save Google Auth Config:', err);
  }
}
