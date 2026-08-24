export interface BlackBoxVaultSpec {
  blackBoxVersion: string;
  sovereignNodeId: string;
  isBlackBoxIsolated: boolean;
  activeVaultModules: string[];
  inputStreams: string[];
  outputStreams: string[];
  blackBoxManifestTimestamp: string;
}

export const CURRENT_BLACK_BOX_SPEC: BlackBoxVaultSpec = {
  blackBoxVersion: 'v4.0 Sovereign Black Box Protocol',
  sovereignNodeId: 'node-blackbox-meow-artkitty-2026',
  isBlackBoxIsolated: true,
  activeVaultModules: [
    'Sovereign Grand Bookcase & EPUB Reader',
    'Artist Portfolio & Creator Profiles (Redbubble, INPRNT, Etsy)',
    'Binder Sheet Card Scanner & TCG Grails',
    'Home Insurance Asset Inventory & Replacement Claims',
    'Custom PC Rig Builds & Newegg List Vault',
    'Gift Tracker & Reaction Gauge Engine',
    'Piplup & Dawn Sinnoh Reader Theme Mode',
    'Zero-Telemetry Anti-Scraper Privacy Shield'
  ],
  inputStreams: [
    'Local EPUB Files & Bookmarks',
    'Camera / Room / Binder Photos (Computer Vision OCR)',
    'NovelUpdates & RSS Feeds',
    'Google Sheets & CSV Data Imports'
  ],
  outputStreams: [
    'Local .companion.md & .blackbox.md Sidecars',
    'Self-Hosted OPDS 1.2 Catalog Feeds',
    'Monetized Curation Affiliate Links (Newegg, Amazon, B&H)',
    'Family Social Activity Streams (Zero-Cloud mTLS)'
  ],
  blackBoxManifestTimestamp: '2026-08-17'
};

export function generateBlackBoxManifestMarkdown(spec: BlackBoxVaultSpec = CURRENT_BLACK_BOX_SPEC): string {
  return `---
title: "Sovereign Black Box Architecture Manifest"
node_id: "${spec.sovereignNodeId}"
version: "${spec.blackBoxVersion}"
isolation_status: "${spec.isBlackBoxIsolated ? '100% ISOLATED BLACK BOX' : 'CONNECTED'}"
format: "dcmd/black-box-manifest"
timestamp: "${spec.blackBoxManifestTimestamp}"
---

# ⬛ Sovereign Black Box Ecosystem Manifest

> **Natural Expansion of the Black Box Site**: A private, tamper-proof digital vault where personal data, discovery lists, and curation portfolios remain 100% opaque to outside corporate scrapers and ad-tech tracking networks.

## 📥 Inbound Input Streams (Black Box Ingest)
${spec.inputStreams.map(i => `- **[Ingest]**: ${i}`).join('\n')}

## 📦 Active Sovereign Vault Modules
${spec.activeVaultModules.map(m => `- **[Module]**: ${m}`).join('\n')}

## 📤 Controlled Outbound Output Streams (Sovereign Egress)
${spec.outputStreams.map(o => `- **[Egress]**: ${o}`).join('\n')}
`;
}
