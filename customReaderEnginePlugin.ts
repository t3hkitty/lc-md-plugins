import type { ReaderEnginePlugin } from '../types/readerPlugins';

export const REGISTERED_READER_ENGINES: ReaderEnginePlugin[] = [
  {
    id: 'sovereign-canvas',
    name: 'Sovereign Reader Canvas (Default)',
    version: '3.8.0',
    description: 'Dual-pane reading canvas with real-time CFI locators, progress tracking, and instant floating quick capture.',
    icon: '📖',
    supportedFormats: ['epub', 'txt', 'md']
  },
  {
    id: 'e-ink-focus',
    name: 'E-Ink Distraction-Free Focus Reader',
    version: '1.0.0',
    description: 'High-contrast monochrome paper renderer designed for maximum legibility and battery efficiency.',
    icon: '📄',
    supportedFormats: ['epub', 'txt', 'md']
  },
  {
    id: 'koreader-web',
    name: 'KOReader Web Engine Simulator',
    version: '2.0.1',
    description: 'Simulates KOReader e-reader interface with touch gestures, bookmark sync, and progress telemetry.',
    icon: '⚡',
    supportedFormats: ['epub', 'pdf', 'cbz']
  }
];
