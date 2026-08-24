export interface PrivacyAuditReport {
  isZeroTelemetryCertified: boolean;
  activeAdTechTrackersFound: number;
  dataStorageLocation: string;
  thirdPartyAnalyticsDetected: boolean;
  cloudLockinRisk: 'ZERO' | 'LOW' | 'HIGH';
  encryptionStandard: string;
  sovereignPledge: string;
}

export const SOVEREIGN_PRIVACY_AUDIT: PrivacyAuditReport = {
  isZeroTelemetryCertified: true,
  activeAdTechTrackersFound: 0,
  dataStorageLocation: '100% Local Hardware / Self-Hosted Private Storage',
  thirdPartyAnalyticsDetected: false,
  cloudLockinRisk: 'ZERO',
  encryptionStandard: 'HTTPS SSL / mTLS / Local RSA 4096-bit ED25519',
  sovereignPledge: `Your personal taste, book collections, PC builds, home insurance inventories, gift histories, and reading habits belong EXCLUSIVELY to you. LC-MD is built to be self-hostable with zero trackers, zero ad-tech pixels, and zero corporate telemetry.`
};

export function generateAntiScraperHtaccess(): string {
  return `# Sovereign Anti-Scraper & Telemetry Shield Rules (.htaccess)
# Path: /public_html/meow/lcmd/.htaccess

<IfModule mod_headers.c>
  # Block all ad-tech tracking referrer headers
  Header set Referrer-Policy "no-referrer"
  
  # Prevent framing & unauthorized embedding
  Header set X-Frame-Options "DENY"
  Header set X-Content-Type-Options "nosniff"

  # Strict Content Security Policy (No external tracking scripts allowed)
  Header set Content-Security-Policy "default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self';"
  
  # Opt out of FLoC & Topics API ad profiling
  Header set Permissions-Policy "interest-cohort=(), tracking=()"
</IfModule>
`;
}
