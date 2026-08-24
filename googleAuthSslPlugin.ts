export interface GoogleAuthSslConfig {
  googleClientId: string;
  googleClientSecret: string;
  allowedEmails: string[];
  httpsDomain: string;
  redirectUri: string;
  sslProvider: 'lets_encrypt' | 'stackcp_autossl' | 'custom_ssl' | 'mtls_client_cert';
  isHttpsEnforced: boolean;
}

export const DEFAULT_GOOGLE_AUTH_SSL_CONFIG: GoogleAuthSslConfig = {
  googleClientId: '891234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
  googleClientSecret: 'GOCSPX-YourGoogleClientSecretHere',
  allowedEmails: ['lorik@artkitty.net', 'wife@artkitty.net', 'family@artkitty.net'],
  httpsDomain: 'https://meow.artkitty.net',
  redirectUri: 'https://meow.artkitty.net/lcmd/',
  sslProvider: 'stackcp_autossl',
  isHttpsEnforced: true
};

export function getSavedGoogleAuthSslConfig(): GoogleAuthSslConfig {
  try {
    const raw = localStorage.getItem('lc_md_google_auth_ssl_config');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load Google Auth SSL config:', err);
  }
  return DEFAULT_GOOGLE_AUTH_SSL_CONFIG;
}

export function saveGoogleAuthSslConfig(config: GoogleAuthSslConfig): void {
  try {
    localStorage.setItem('lc_md_google_auth_ssl_config', JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save Google Auth SSL config:', err);
  }
}

export function generateGoogleCloudConsoleConfig(config: GoogleAuthSslConfig = getSavedGoogleAuthSslConfig()): string {
  return `# Google Cloud Console OAuth 2.0 Credentials Setup (HTTPS SSL Enforced)
# Dashboard: https://console.cloud.google.com/apis/credentials

1. Authorized JavaScript Origins:
   ${config.httpsDomain}

2. Authorized Redirect URIs (HTTPS Required by Google):
   ${config.redirectUri}
   ${config.httpsDomain}/lcmd/auth/google/callback

3. Allowed Family Google Accounts Whitelist:
   ${config.allowedEmails.map(e => `- ${e}`).join('\n   ')}
`;
}

export function generateHttpsEnforcementHtaccess(_config: GoogleAuthSslConfig = getSavedGoogleAuthSslConfig()): string {
  return `# Apache HTTPS / SSL Enforcement + Google OAuth & mTLS Rewrite Rules
# Path: /public_html/meow/lcmd/.htaccess

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Force HTTPS SSL redirect (Required for Google Auth & mTLS)
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  RewriteBase /meow/lcmd/
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /meow/lcmd/index.html [L]
</IfModule>
`;
}
