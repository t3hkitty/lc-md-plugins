/**
 * Story Maker & Author Bible Plugin
 * Inspo Ledger (Zettelkasten YYYYMMDD-HHMM brain-dumps), Character Role Slugs ([MC], [ML], [MC:eyes]),
 * Lore Bridge & Surface Protocol, and AI-Guided Non-Prose Drafting Framework with 3 CYA Thematic Options.
 */

export interface InspoEntry {
  id: string;
  zettelSerial: string; // e.g. "20260818-1005"
  title: string;
  rawThought: string;
  tags: string[];
  category: 'anomaly' | 'sensory-fragment' | 'world-rule' | 'dialogue-spark' | 'scene-beat';
  conflictHook?: string;
  createdAt: string;
}

export interface CharacterSlugDefinition {
  roleSlug: string; // e.g. '[MC]', '[ML]', '[Villain]', '[Rival]'
  characterName: string;
  aliases: string[];
  roleTitle: string;
  characteristics: Record<string, string>; // e.g. { eyes: 'Obsidian gold flecks', flaw: 'Impatient pride', secret: 'Sealed meridian' }
  color: string;
  avatarEmoji: string;
}

export interface CYABranchingFork {
  id: string;
  sceneTitle: string;
  dilemmaPrompt: string;
  thematicOptions: [
    { label: 'Option A: Hard Logic & System Rule Escalation'; loreAnchor: string; description: string; impact: string },
    { label: 'Option B: Emotional Vulnerability & Flaw Trigger'; loreAnchor: string; description: string; impact: string },
    { label: 'Option C: Lore Inversion & Unsealed Secret'; loreAnchor: string; description: string; impact: string }
  ];
}

export interface StructuralDraftingPrompt {
  id: string;
  category: 'narrative-tension' | 'sensory-layer' | 'subtext-conflict' | 'stakes-escalation';
  question: string;
  guidance: string;
  atomicChecklist: string[];
  companionMarkdownTemplate: string;
}

export const DEFAULT_CHARACTER_SLUGS: CharacterSlugDefinition[] = [
  {
    roleSlug: '[MC]',
    characterName: 'Shen Qingqiu (Shen Yuan)',
    aliases: ['Peak Lord', 'Cucumber Bro', 'Shizun'],
    roleTitle: 'Protagonist / Transmigrated Scholar',
    characteristics: {
      eyes: 'cool jade green with analytical sharpness, like lime God used for the zesty refreshing fruit',
      flaw: 'internal sarcastic panic masked by icy aloofness',
      weapon: 'Xiu Ya (Elegance Sword)',
      secret: 'bound to the System with point deduction terror',
      tell: 'snaps fan shut when agitated'
    },
    color: '#059669',
    avatarEmoji: '🎋'
  },
  {
    roleSlug: '[ML]',
    characterName: 'Luo Binghe',
    aliases: ['Bing-mei', 'Demon Lord', 'White Lotus'],
    roleTitle: 'Male Lead / Heavenly Demon Sovereign',
    characteristics: {
      eyes: 'starry obsidian with hidden crimson flames',
      flaw: 'overwhelming abandonment dread',
      weapon: 'Xin Mo (Heart Devil Sword)',
      secret: 'keeps Shizun\'s dropped fan under pillow',
      tell: 'puppy-dog eyes when seeking approval'
    },
    color: '#e11d48',
    avatarEmoji: '🗡️'
  },
  {
    roleSlug: '[Villain]',
    characterName: 'Huan Hua Palace Master',
    aliases: ['Old Palace Master', 'Lao Gongzhu'],
    roleTitle: 'Antagonist / Sect Hegemon',
    characteristics: {
      eyes: 'narrow serpent amber',
      flaw: 'delusional obsessive possessiveness',
      weapon: 'Water Moon Mirror',
      secret: 'fabricates rumors to frame Qing Jing Peak',
      tell: 'strokes golden prayer beads rhythmically'
    },
    color: '#9333ea',
    avatarEmoji: '🐍'
  }
];

export const DEFAULT_INSPO_ENTRIES: InspoEntry[] = [
  {
    id: 'insp-1',
    zettelSerial: '20260818-0915',
    title: 'Rainstorm Broken Fan Repair Scene',
    rawThought: 'During a midnight thunderstorm, [ML] silently attempts to re-bind the broken bamboo ribs of [MC:weapon] with glowing spirit thread while [MC] pretends to be asleep.',
    tags: ['angst', 'caretaking', 'thunderstorm', 'bamboo-fan'],
    category: 'scene-beat',
    conflictHook: 'Exposes [ML:secret] while testing [MC:flaw].',
    createdAt: '2026-08-18'
  },
  {
    id: 'insp-2',
    zettelSerial: '20260818-0930',
    title: 'System Penalty Inversion Anomaly',
    rawThought: 'What if the AI system deducts points every time [MC] tells the truth about his feelings, forcing him into hilarious tsundere dialogue maneuvers?',
    tags: ['comedy', 'system-mechanic', 'dramedy', 'tsundere'],
    category: 'anomaly',
    conflictHook: 'Forces verbal deflection when [ML] asks direct questions.',
    createdAt: '2026-08-18'
  },
  {
    id: 'insp-3',
    zettelSerial: '20260818-0945',
    title: 'Scent of Damp Sandalwood and Pine Needles',
    rawThought: 'The lingering sensory fragrance on Qing Jing peak after an autumn frost—sharp pine, cold mist, and old parchment.',
    tags: ['sensory-fragment', 'worldbuilding', 'autumn'],
    category: 'sensory-fragment',
    conflictHook: 'Triggers memory of early disciple days.',
    createdAt: '2026-08-18'
  }
];

export const DEFAULT_CYA_FORKS: CYABranchingFork[] = [
  {
    id: 'cya-1',
    sceneTitle: 'Confrontation at the Mountain Gate',
    dilemmaPrompt: '[Villain] presents forged correspondence demanding [MC] be handed over to Huan Hua Palace for questioning.',
    thematicOptions: [
      {
        label: 'Option A: Hard Logic & System Rule Escalation',
        loreAnchor: 'Cang Qiong Sect Charter Rule 4: Peak Lords cannot be surrendered without trial before all 12 Lords.',
        description: '[MC] cites ancestral jurisdictional law, invoking sect solidarity and locking [Villain] in procedural gridlock.',
        impact: 'System rewards +200 Protocol Points, but accelerates Huan Hua military mobilization.'
      },
      {
        label: 'Option B: Emotional Vulnerability & Flaw Trigger',
        loreAnchor: '[ML:flaw] (Abandonment Dread) and [MC:tell] (Fan snapping).',
        description: '[ML] steps in front of [MC] with drawn Xin Mo, declaring that any move against Shizun is an act of war.',
        impact: 'Deepens bond, but confirms rumors that Qing Jing Peak harbors demonic sovereign power.'
      },
      {
        label: 'Option C: Lore Inversion & Unsealed Secret',
        loreAnchor: '[ML:secret] and Huan Hua Water Moon Mirror forgery seal.',
        description: '[MC] notices the mirror reflection flaw in the forged document and exposes [Villain]\'s counterfeit signature on the spot.',
        impact: 'Discredits [Villain] publicly, forcing them into desperate covert assassination tactics.'
      }
    ]
  }
];

export const STRUCTURAL_DRAFTING_PROMPTS: StructuralDraftingPrompt[] = [
  {
    id: 'sdp-1',
    category: 'narrative-tension',
    question: 'What immediate desire is driving [MC] in this room, and what prevents [ML] from giving it to them?',
    guidance: 'Ensure both characters have incompatible micro-goals in this single paragraph to generate crackling subtext.',
    atomicChecklist: [
      'Establish the physical distance between them in space',
      'Describe a physical micro-action (e.g. [MC:tell])',
      'Deliver dialogue where the surface topic is completely different from the emotional topic'
    ],
    companionMarkdownTemplate: `---
type: "structural-draft/paragraph-beat"
prompt_focus: "narrative-tension"
---
# Beat: Subtext Collision
- **[MC] Goal:** [Detail desire here]
- **[ML] Blocker:** [Detail resistance here]
- **Sensory Anchor:** [MC:eyes] or [ML:eyes]`
  },
  {
    id: 'sdp-2',
    category: 'sensory-layer',
    question: 'What atmospheric sensory cue (smell, temperature, ambient sound) grounds the room right now?',
    guidance: 'Avoid abstract feelings. Root the mood in cold mountain air, faint incense smoke, or distant rain.',
    atomicChecklist: [
      'Name 1 tactile texture (silk sleeve, cold steel, damp cedar)',
      'Describe how light hits [ML:eyes]',
      'End the beat on an interrupted sound'
    ],
    companionMarkdownTemplate: `---
type: "structural-draft/sensory-layer"
prompt_focus: "sensory-grounding"
---
# Beat: Atmospheric Grounding
- **Tactile:** Silk, cold stone
- **Olfactory:** Cedar smoke, autumn frost
- **Acoustic:** Interrupted teacup clatter`
  },
  {
    id: 'sdp-3',
    category: 'stakes-escalation',
    question: 'If this conversation ends without resolution, what irreversible disaster looms?',
    guidance: 'Raise the cost of inaction before the paragraph closes.',
    atomicChecklist: [
      'Reference the ticking clock or looming deadline',
      'Show [Villain]\'s shadow or lingering threat',
      'Commit to a decision point that cannot be retracted'
    ],
    companionMarkdownTemplate: `---
type: "structural-draft/stakes-escalation"
prompt_focus: "stakes-deadline"
---
# Beat: Irreversible Choice
- **Ticking Clock:** 3 days until Sect Assembly
- **Threat Vector:** [Villain:secret]
- **Point of No Return:** Oath spoken`
  }
];

export const INSPO_STORAGE_KEY = 'lc_md_inspo_ledger_v1';
export const SLUGS_STORAGE_KEY = 'lc_md_character_slugs_v1';

export function loadInspoLedger(): InspoEntry[] {
  try {
    const raw = localStorage.getItem(INSPO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load inspo ledger:', e);
  }
  return DEFAULT_INSPO_ENTRIES;
}

export function saveInspoLedger(entries: InspoEntry[]): void {
  try {
    localStorage.setItem(INSPO_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save inspo ledger:', e);
  }
}

export function loadCharacterSlugs(): CharacterSlugDefinition[] {
  try {
    const raw = localStorage.getItem(SLUGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load character slugs:', e);
  }
  return DEFAULT_CHARACTER_SLUGS;
}

export function saveCharacterSlugs(slugs: CharacterSlugDefinition[]): void {
  try {
    localStorage.setItem(SLUGS_STORAGE_KEY, JSON.stringify(slugs));
  } catch (e) {
    console.error('Failed to save character slugs:', e);
  }
}

/**
 * Compiles author prose drafts by replacing character role slugs ([MC], [ML:eyes], [Villain:weapon])
 * with their rich canonical lore descriptors.
 * If detailPass is false, preserves placeholders for momentum preservation!
 */
export function compileProseSlugs(
  draft: string,
  slugs: CharacterSlugDefinition[] = DEFAULT_CHARACTER_SLUGS,
  detailPass: boolean = true
): string {
  if (!detailPass) return draft;
  let compiled = draft;

  slugs.forEach(char => {
    // Replace roleSlug directly, e.g. [MC] -> Shen Qingqiu
    const baseSlugEscaped = char.roleSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    compiled = compiled.replace(new RegExp(baseSlugEscaped, 'g'), char.characterName);

    // Replace characteristic slugs, e.g. [MC:eyes] -> eyes the shade of lime God used...
    const slugBase = char.roleSlug.replace(/[[\]]/g, '');
    Object.entries(char.characteristics).forEach(([traitKey, traitValue]) => {
      const traitSlug = `\\[${slugBase}:${traitKey}\\]`;
      compiled = compiled.replace(new RegExp(traitSlug, 'gi'), traitValue);
    });
  });

  return compiled;
}
