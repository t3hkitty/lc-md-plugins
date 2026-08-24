export interface LegalAgreementSection {
  id: string;
  title: string;
  jurisdiction: string;
  lastUpdated: string;
  content: string;
}

export const LEGAL_TERMS_SECTIONS: LegalAgreementSection[] = [
  {
    id: 'tos',
    title: 'Terms of Service (ToS)',
    jurisdiction: 'Global / Standard International',
    lastUpdated: '2026-08-17',
    content: `### 1. Acceptance of Terms
By accessing or using this self-hosted Library Companion MD (LC-MD) and Sovereign Black Box portal ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the application.

### 2. Nature of Software (Local-First & Open Source)
This application is distributed under the MIT Open Source License. It operates on a local-first, decentralized architecture where personal library collections, notes, valuations, and sidecar markdown files are processed on your local device and stored exclusively in your local storage or self-hosted server environment.

### 3. User Responsibility & Content Ownership
You retain 100% ownership of all data, reading notes, valuations, and custom collections you create. You are solely responsible for ensuring that any media or content you store complies with applicable local laws and copyright regulations.

### 4. No Warranties & Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THIS SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. UNDER NO CIRCUMSTANCES SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE SERVICE.`
  },
  {
    id: 'privacy',
    title: 'Privacy Policy (Local-First Zero-Telemetry Guarantee)',
    jurisdiction: 'EU (GDPR) / UK (UK GDPR) / US (CCPA/CPRA) / Canada (PIPEDA)',
    lastUpdated: '2026-08-17',
    content: `### 1. Zero-Telemetry & Zero-Tracking Commitment
We respect your fundamental right to digital privacy. This application is engineered with a strict **Zero-Telemetry Policy**:
- **0 Third-Party Analytics**: No Google Analytics, Mixpanel, or Facebook tracking pixels.
- **0 Advertising Trackers**: No cross-site profiling or ad-tech network hooks.
- **0 Cloud Data Harvesting**: All reading positions, gift histories, and valuations remain on your local device.

### 2. GDPR Compliance (European Union & United Kingdom)
Under the EU General Data Protection Regulation (GDPR) and UK Data Protection Act:
- **Right to Access & Portability**: You have full real-time access to all data via 1-click Markdown sidecar (.md) and CSV/JSON export.
- **Right to Erasure (Right to be Forgotten)**: You can permanently purge all stored data at any time via the "Purge All Items" button in the library toolbar.
- **No Cookie Profiling**: This application does not use non-essential tracking cookies.

### 3. CCPA / CPRA Compliance (California, USA)
Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
- **We Do Not Sell or Share Your Personal Information**: Zero consumer data is sold, monetized, or shared with third parties.

### 4. PIPEDA Compliance (Canada)
In accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA), personal data is gathered only with explicit consent and stored solely on the user's controlled storage.`
  },
  {
    id: 'dmca',
    title: 'DMCA & Intellectual Property Safe Harbor',
    jurisdiction: 'United States (17 U.S.C. § 512) & Global IP Conventions',
    lastUpdated: '2026-08-17',
    content: `### 1. DMCA Notice & Takedown Procedure
This software is an open-source tool for organizing personal notes and commentary. Each node operator is responsible for their own instance.

If you are a copyright owner or agent thereof and believe that content hosted on a specific public sovereign node infringes upon your copyright, you may submit a formal DMCA notification to the node administrator containing:
1. Physical or electronic signature of the copyright owner.
2. Identification of the copyrighted work claimed to have been infringed.
3. Specific URL location of the infringing material.
4. Contact information (email address, telephone number).
5. A statement of good faith belief that the use is unauthorized.`
  },
  {
    id: 'jurisdictions',
    title: 'International Jurisdictions & Consumer Guarantees',
    jurisdiction: 'Australia (ACL) / New Zealand (CGA) / Japan (APPI)',
    lastUpdated: '2026-08-17',
    content: `### 1. Australia & New Zealand Consumer Law
Nothing in these terms excludes, restricts, or modifies any consumer rights or statutory guarantees under the *Competition and Consumer Act 2010* (Australia) or the *Consumer Guarantees Act 1993* (New Zealand) that cannot be excluded by law.

### 2. Japan (Act on Protection of Personal Information - APPI)
In accordance with Japan's APPI, personal information stored in sidecars is under the strict direct custody and control of the end-user.

### 3. Node Operator Independence
Each sovereign deployment (e.g. at \`meow.artkitty.net\` or private homelab) is operated independently. The open-source code maintainers bear no control or liability for individual third-party deployments.`
  }
];
