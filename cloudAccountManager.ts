import type { CloudProviderPreset, CloudAccount } from '../types/cloudAccounts';

export const CLOUD_PROVIDER_PRESETS: CloudProviderPreset[] = [
  {
    id: 'filejump',
    name: 'Filejump Cloud Storage (WebDAV)',
    description: 'Official Filejump WebDAV server endpoint for sovereign cloud storage.',
    icon: '🚀',
    defaultServerUrl: 'https://uploads.filejump.com/dav/',
    requiresAppPassword: true,
    helpDocUrl: 'https://filejump.com/help'
  },
  {
    id: 'torbox',
    name: 'TorBox Debrid & Cloud Drive (REST API v1)',
    description: 'Official TorBox REST API v1 with Bearer Token auth for debrid downloads, torrents, and cloud storage.',
    icon: '⚡',
    defaultServerUrl: 'https://api.torbox.app/v1/api/',
    requiresApiKey: true,
    helpDocUrl: 'https://torbox.app/settings'
  },
  {
    id: 'koofr',
    name: 'Koofr Cloud Storage (WebDAV)',
    description: 'Official Koofr WebDAV endpoint with app password support.',
    icon: '📦',
    defaultServerUrl: 'https://app.koofr.net/dav/Koofr/',
    requiresAppPassword: true,
    helpDocUrl: 'https://koofr.eu/help/webdav'
  },
  {
    id: 'nextcloud',
    name: 'Nextcloud / ownCloud WebDAV',
    description: 'Self-hosted or hosted Nextcloud WebDAV instance.',
    icon: '☁️',
    defaultServerUrl: 'https://cloud.example.com/remote.php/webdav/',
    requiresAppPassword: true
  },
  {
    id: 'pcloud',
    name: 'pCloud WebDAV Drive',
    description: 'Official pCloud WebDAV server endpoint.',
    icon: '🌩️',
    defaultServerUrl: 'https://webdav.pcloud.com/',
    requiresAppPassword: false
  },
  {
    id: 'google-drive',
    name: 'Google Drive Bridge (rclone / WebDAV)',
    description: 'Pre-configured endpoint for Google Drive via rclone serve webdav proxy.',
    icon: '🟢',
    defaultServerUrl: 'http://localhost:8080/gdrive/',
    requiresAppPassword: false
  },
  {
    id: 'dropbox',
    name: 'Dropbox Bridge (rclone / WebDAV)',
    description: 'Pre-configured endpoint for Dropbox via rclone serve webdav proxy.',
    icon: '🔹',
    defaultServerUrl: 'http://localhost:8080/dropbox/',
    requiresAppPassword: false
  },
  {
    id: 'custom-webdav',
    name: 'Custom WebDAV Server',
    description: 'Arbitrary WebDAV protocol server URL and credentials.',
    icon: '🔌',
    defaultServerUrl: 'https://webdav.yourserver.com/library/',
    requiresAppPassword: false
  }
];

export const INITIAL_CLOUD_ACCOUNTS: CloudAccount[] = [
  {
    id: 'acc-filejump-default',
    name: 'My Filejump Vault',
    presetId: 'filejump',
    serverUrl: 'https://uploads.filejump.com/dav/',
    username: 'reader@example.com',
    tokenOrPassword: '',
    remoteRootFolder: '/md_library',
    isActive: true,
    autoSyncSidecars: true,
    accessMode: 'read-write',
    configStorageLocation: 'remote-cloud',
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: 'acc-torbox-default',
    name: 'TorBox Sovereign Library',
    presetId: 'torbox',
    serverUrl: 'https://webdav.torbox.app/',
    username: 'torbox_user',
    tokenOrPassword: '',
    apiKey: 'tb_live_94820a1f8b2c',
    remoteRootFolder: '/md_library',
    isActive: false,
    autoSyncSidecars: true,
    accessMode: 'read-write',
    configStorageLocation: 'remote-cloud',
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: 'acc-koofr-default',
    name: 'My Koofr Drive',
    presetId: 'koofr',
    serverUrl: 'https://app.koofr.net/dav/Koofr/',
    username: 'reader@koofr.app',
    tokenOrPassword: '',
    remoteRootFolder: '/md_library',
    isActive: false,
    autoSyncSidecars: true,
    accessMode: 'read-write',
    configStorageLocation: 'local',
    lastSyncedAt: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'lc_md_cloud_accounts_v3';

export function loadSavedCloudAccounts(): CloudAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load cloud accounts from localStorage:', err);
  }
  return INITIAL_CLOUD_ACCOUNTS;
}

export function saveCloudAccounts(accounts: CloudAccount[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Failed to save cloud accounts to localStorage:', err);
  }
}

export function buildRelLinkRootForAccount(account: CloudAccount): string {
  const providerName = CLOUD_PROVIDER_PRESETS.find(p => p.id === account.presetId)?.name.split(' ')[0] || 'Cloud';
  return `cloud://${providerName}${account.remoteRootFolder}`;
}

export function normalizeCloudServerUrl(rawUrl: string, presetId: string): string {
  let trimmed = (rawUrl || '').trim();

  // If empty, supply default for preset
  if (!trimmed) {
    if (presetId === 'google-drive') return 'https://www.googleapis.com/drive/v3';
    if (presetId === 'dropbox') return 'https://api.dropboxapi.com/2';
    if (presetId === 'torbox') return 'https://webdav.torbox.app/';
    return 'https://uploads.filejump.com/dav/';
  }

  // Handle drive.google.com folder share links
  if (trimmed.includes('drive.google.com')) {
    return 'https://www.googleapis.com/drive/v3';
  }

  // Auto-prepend protocol if missing
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1') || trimmed.startsWith('192.168.')) {
      trimmed = `http://${trimmed}`;
    } else {
      trimmed = `https://${trimmed}`;
    }
  }

  // Ensure trailing slash unless API query
  if (!trimmed.endsWith('/') && !trimmed.includes('?') && !trimmed.endsWith('/v3')) {
    trimmed = `${trimmed}/`;
  }

  return trimmed;
}
