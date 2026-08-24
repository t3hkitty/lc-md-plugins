export interface SovereignSslAccount {
  username: string;
  displayName: string;
  email: string;
  certFingerprint: string;
  serialNumber: string;
  issuerCN: string;
  validDays: number;
  createdTimestamp: string;
  isAdmin: boolean;
}

export const INITIAL_SSL_ACCOUNTS: SovereignSslAccount[] = [
  {
    username: 'lorik_admin',
    displayName: 'Lorik (Sovereign Admin)',
    email: 'lorik@artkitty.net',
    certFingerprint: 'SHA256:8F:A2:4B:91:C3:E7:01:29:FF:42:01... (mTLS X.509)',
    serialNumber: '0x7F91B243C88E',
    issuerCN: 'Sovereign-Local-CA-2026',
    validDays: 365,
    createdTimestamp: '2026-08-17',
    isAdmin: true
  },
  {
    username: 'wife_piplup',
    displayName: 'Wife (Piplup & Dawn Reader 🐧)',
    email: 'wife@artkitty.net',
    certFingerprint: 'SHA256:4C:19:D8:E2:04:A1:77:88:B3:99... (mTLS X.509)',
    serialNumber: '0x3D11A990E41B',
    issuerCN: 'Sovereign-Local-CA-2026',
    validDays: 365,
    createdTimestamp: '2026-08-17',
    isAdmin: false
  }
];

export function getSavedSslAccounts(): SovereignSslAccount[] {
  try {
    const raw = localStorage.getItem('lc_md_ssl_accounts');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load SSL accounts:', err);
  }
  return INITIAL_SSL_ACCOUNTS;
}

export function saveSslAccounts(accounts: SovereignSslAccount[]): void {
  try {
    localStorage.setItem('lc_md_ssl_accounts', JSON.stringify(accounts));
  } catch (err) {
    console.warn('Failed to save SSL accounts:', err);
  }
}

export function generateSslClientCert(username: string, _email?: string): { certPem: string; keyPem: string; fingerprint: string; serial: string } {
  const serial = '0x' + Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).toUpperCase();
  const hash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':');
  
  const certPem = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIU${serial}MA0GCSqGSIb3DQEBCwUAMEUx
CzAJBgNVBAYTAlVTMQwwCgYDVQQIDANPQ0ExFjAUBgNVBAoMDVNvdmVyZWlnbiBM
YWIxFDASBgNVBAMMC1NvdmVyZWlnbiBDQTAeFw0yNjA4MTcwMDAwMDBaFw0yNzA4
MTcwMDAwMDBaMEUxCzAJBgNVBAYTAlVTMQwwCgYDVQQIDANPQ0ExFjAUBgNVBAoM
DVNvdmVyZWlnbiBMYWIxFDASBgNVBAMMC${username.toUpperCase()}MB4XDTI2MDgxNzAw
MDAwMFoXDTI3MDgxNzAwMDAwMFowRzELMAkGA1UEBhMCVVMxDDAKBgNVBAgMA09D
QTEWMBQGA1UECgwNU292ZXJlaWduIExhYjEVMBMGA1UEAwwM${username.toUpperCase()}
-----END CERTIFICATE-----`;

  const keyPem = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC78J9v...
${username.toUpperCase()}_RSA_4096_PRIVATE_KEY_SNIPPET
-----END PRIVATE KEY-----`;

  return { certPem, keyPem, fingerprint: `SHA256:${hash} (X.509 mTLS)`, serial };
}

export function generateApacheMtlsHtaccess(): string {
  return `# Apache Mutual TLS (mTLS) Client Certificate Enforcement (.htaccess)
# Path: /public_html/meow/lcmd/.htaccess

<IfModule mod_ssl.c>
  SSLVerifyClient require
  SSLVerifyDepth 2
  SSLOptions +StrictRequire +ExportCertData
  
  # Allow access only if client certificate SSL_CLIENT_S_DN_CN is registered
  SSLRequire %{SSL_CLIENT_S_DN_CN} in {"lorik_admin", "wife_piplup"}
</IfModule>
`;
}
