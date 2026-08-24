/**
 * Spatial-Chained Routine Registry, "No Bad Days" Script & TTS Director Plugin
 * Dual-channel (TTS audio + visual cards) execution for spatial routines.
 */

export interface RoutineStep {
  id: string;
  title: string;
  description: string;
  spatialZone: string;
  durationSeconds: number;
  ttsCue: string;
  icon: string;
  completed: boolean;
  notes?: string;
}

export interface SpatialRoutine {
  id: string;
  name: string;
  icon: string;
  badge: string;
  targetTime: string;
  color: string;
  steps: RoutineStep[];
}

export const DEFAULT_SPATIAL_ROUTINES: SpatialRoutine[] = [
  {
    id: 'routine-leaving-house',
    name: 'Leaving the House Protocol',
    icon: '🚪',
    badge: 'Spatial Anchor: Front Doorway',
    targetTime: 'Prior to Departure',
    color: '#3b82f6',
    steps: [
      {
        id: 'lh-1',
        title: '🚪+🔑 (Keys)',
        description: 'Physical touch check: Verify primary key ring and transit fobs in pocket/hand.',
        spatialZone: 'Entryway Valet Tray',
        durationSeconds: 15,
        ttsCue: 'Door plus Keys. Confirming physical key ring in hand or pocket.',
        icon: '🔑',
        completed: false
      },
      {
        id: 'lh-2',
        title: '🚪+💳 (Wallet)',
        description: 'Tactile check: Identity cards, payment cards, transit pass.',
        spatialZone: 'Entryway Console',
        durationSeconds: 15,
        ttsCue: 'Door plus Wallet. Confirming identification and payment cards.',
        icon: '💳',
        completed: false
      },
      {
        id: 'lh-3',
        title: '🚪+🧠 (Brain check)',
        description: 'Mental alignment: Where am I heading, what is the primary mission, and is the mindset grounded?',
        spatialZone: 'Threshold Mirror',
        durationSeconds: 30,
        ttsCue: 'Door plus Brain check. Ground your focus. State your immediate destination.',
        icon: '🧠',
        completed: false
      },
      {
        id: 'lh-4',
        title: '🚪+🎁 (Gift check)',
        description: 'Host gift, return item, package drop-off, or planned relational offering.',
        spatialZone: 'Staging Table',
        durationSeconds: 20,
        ttsCue: 'Door plus Gift check. Do you have the intended items for others today?',
        icon: '🎁',
        completed: false
      },
      {
        id: 'lh-5',
        title: '🚪+🎒 (Bags/Books/Carry)',
        description: 'Backpack, notebook/e-reader companion, charging cables, weather layer.',
        spatialZone: 'Coat Hook & Bench',
        durationSeconds: 30,
        ttsCue: 'Door plus Bags and Books. Confirm daily carry and reading companion.',
        icon: '🎒',
        completed: false
      },
      {
        id: 'lh-6',
        title: '🚪+🎧 (Audio gear)',
        description: 'Noise-canceling headphones, earbuds, or audio adapters for sensory shielding.',
        spatialZone: 'Doorway Audio Dock',
        durationSeconds: 20,
        ttsCue: 'Door plus Audio gear. Sensory shields equipped. You are cleared for departure.',
        icon: '🎧',
        completed: false
      }
    ]
  },
  {
    id: 'routine-morning-wake-prep',
    name: 'Morning Wake & Prep Protocol',
    icon: '☀️',
    badge: 'Circadian Grounding',
    targetTime: '07:30 AM',
    color: '#f59e0b',
    steps: [
      {
        id: 'mw-1',
        title: '☀️+💧 (Hydration sips)',
        description: '500ml pure water with mineral salt or lemon to rehydrate neural pathways.',
        spatialZone: 'Bedside Nightstand',
        durationSeconds: 45,
        ttsCue: 'Sun plus Hydration sips. Drink 500 milliliters of cold water.',
        icon: '💧',
        completed: false
      },
      {
        id: 'mw-2',
        title: '☀️+🚻 (Biological reset)',
        description: 'Full bio break, splash cold water on face, sensory waking.',
        spatialZone: 'Washroom Sanctuary',
        durationSeconds: 120,
        ttsCue: 'Sun plus Biological reset. Reset posture and wash face.',
        icon: '🚻',
        completed: false
      },
      {
        id: 'mw-3',
        title: '☀️+💊 (Medication/Grounding)',
        description: 'Daily supplements, prescriptions, and 3 slow parasympathetic grounding breaths.',
        spatialZone: 'Morning Dispensary',
        durationSeconds: 60,
        ttsCue: 'Sun plus Medication and Grounding. Ingest morning regimen. Three centering breaths.',
        icon: '💊',
        completed: false
      },
      {
        id: 'mw-4',
        title: '☀️+💻 (Terminal authentication, battery 60-80%)',
        description: 'Unlock workstation with sovereign passkey, confirm hardware battery charged between 60-80% for longevity.',
        spatialZone: 'Primary Workstation',
        durationSeconds: 60,
        ttsCue: 'Sun plus Terminal authentication. Workstation active, battery conditioned between sixty and eighty percent.',
        icon: '💻',
        completed: false
      }
    ]
  },
  {
    id: 'routine-morning-sustenance',
    name: 'Morning Sustenance Protocol',
    icon: '🌙🍌',
    badge: 'Metabolic Support',
    targetTime: '08:15 AM',
    color: '#10b981',
    steps: [
      {
        id: 'ms-1',
        title: '🌙+🍳 (Kitchen heat source check)',
        description: 'Visual check of stove burners, kettle base, and induction plates.',
        spatialZone: 'Kitchen Cooktop',
        durationSeconds: 30,
        ttsCue: 'Moon plus Kitchen heat source check. Verify burner surfaces and safe clearance.',
        icon: '🍳',
        completed: false
      },
      {
        id: 'ms-2',
        title: '🌙+🍽️ (Plating/fuel)',
        description: 'Low-demand nourishment: Banana, protein fuel, or nourishing meal plated cleanly.',
        spatialZone: 'Preparation Island',
        durationSeconds: 120,
        ttsCue: 'Moon plus Plating and Fuel. Fuel body with clean protein and simple carbohydrates.',
        icon: '🍽️',
        completed: false
      },
      {
        id: 'ms-3',
        title: '🌙+☕ (Caffeinated beverage prep)',
        description: 'Brew single-origin pour-over, espresso, or ceremonial matcha with l-theanine.',
        spatialZone: 'Beverage Bar',
        durationSeconds: 180,
        ttsCue: 'Moon plus Caffeinated beverage prep. Steeping brew for calm, sustained alertness.',
        icon: '☕',
        completed: false
      }
    ]
  },
  {
    id: 'routine-bedtime-closure',
    name: 'Bedtime Closure & Reset',
    icon: '🌙🛏️',
    badge: 'Nightly Closure',
    targetTime: '10:30 PM',
    color: '#8b5cf6',
    steps: [
      {
        id: 'bc-1',
        title: '🌙+📱 (Device charge 60-80%)',
        description: 'Plug handheld devices into smart cutoff plugs targeting 60-80% battery conservation.',
        spatialZone: 'Charging Cradle',
        durationSeconds: 45,
        ttsCue: 'Moon plus Device charge. Plug devices into smart conditioning docks.',
        icon: '📱',
        completed: false
      },
      {
        id: 'bc-2',
        title: '🌙+📓 (Final ledger review)',
        description: 'Deposit the top priority anchor note for tomorrow morning and close daily micrologs.',
        spatialZone: 'Bedside Journal',
        durationSeconds: 120,
        ttsCue: 'Moon plus Final ledger review. Scribing tomorrow anchor note. Brain loops released.',
        icon: '📓',
        completed: false
      },
      {
        id: 'bc-3',
        title: '🌙+🛑 (Environmental shutdown)',
        description: 'Dim all lumens, lock doors, activate ambient soundscape, and power down work machines.',
        spatialZone: 'Master Threshold',
        durationSeconds: 60,
        ttsCue: 'Moon plus Environmental shutdown. Lumens dark. Ambient soundscape online. Rest deeply.',
        icon: '🛑',
        completed: false
      }
    ]
  }
];

export const ROUTINE_STORAGE_KEY = 'lc_md_spatial_routines_v1';

export function loadSpatialRoutines(): SpatialRoutine[] {
  try {
    const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load spatial routines:', err);
  }
  return DEFAULT_SPATIAL_ROUTINES;
}

export function saveSpatialRoutines(routines: SpatialRoutine[]): void {
  try {
    localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routines));
  } catch (err) {
    console.error('Failed to save spatial routines:', err);
  }
}

export interface TaskMicroActionPlan {
  taskTitle: string;
  zettelSerial: string;
  alignmentCriteria: string;
  successMetrics: string;
  estimatedMinutes: number;
  markdownContent: string;
}

/**
 * "No Bad Days" Day-Closing Script Generator
 * Generates an individual Markdown file for each uncompleted task detailing step-by-step
 * micro-actions (Goblin Tools style), alignment criteria, and success metrics.
 */
export function generateIndividualTaskMarkdownPlans(rawTasks: string[]): TaskMicroActionPlan[] {
  const dateStr = new Date().toISOString().split('T')[0];
  const items = rawTasks.filter(t => t.trim().length > 0);

  if (items.length === 0) {
    items.push('Clear desktop staging cache and sort active notes');
  }

  return items.map((task) => {
    const hex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const zettelSerial = `ZK-${dateStr.replace(/-/g, '')}-NBD-${hex}`;

    const alignmentCriteria = `Aligns with sovereign cognitive sovereignty: Zero-tax ramp-up, no judgment for past delays, and maximum tactile momentum.`;
    const successMetrics = `Completion of Micro-Action Unit 1 (120 seconds of direct physical engagement) counts as 100% full victory for this round.`;

    const markdownContent = `---
title: "${task}"
zettel_serial: "${zettelSerial}"
date: "${dateStr}"
type: "no-bad-days/micro-action-plan"
framework: "goblin-tools-atomic"
alignment_criteria: "${alignmentCriteria}"
success_metrics: "${successMetrics}"
---

# 🛡️ ${task}

> [!abstract] **ZK Serial:** \`${zettelSerial}\` &bull; **Day-Closing Reflection:** Uncompleted Round-Toit decomposed with zero guilt.

## 🎯 Alignment & Victory Criteria
- **Alignment Criteria:** ${alignmentCriteria}
- **Success Metrics:** ${successMetrics}

---

## ⚡ Goblin-Style Atomic Action Steps (2-Min Max Each)

- [ ] **Step 1 (Tactile Arrival - 15s):** Stand physically in front of where *"${task}"* lives.
- [ ] **Step 2 (Tool Engagement - 45s):** Touch the single application, notebook, or tool required to touch this task.
- [ ] **Step 3 (Atomic Micro-Unit - 90s):** Execute 1 microscopic sub-unit without evaluating quality (write 1 sentence, delete 1 junk file, or dial 1 number).
- [ ] **Step 4 (Zero-Tax Exit):** Stop immediately if mental energy is spent, or continue if hyperfocus flow takes over.

---

## 🌙 Day-Closing Reflection
- *How should this item proceed tomorrow?* ➔ Scheduled into morning buffer slot.
- *Any external blocker?* ➔ None that cannot be solved in micro-steps.

*Generated by Sovereign "No Bad Days" Day-Closing Director.*
`;

    return {
      taskTitle: task,
      zettelSerial,
      alignmentCriteria,
      successMetrics,
      estimatedMinutes: 2,
      markdownContent
    };
  });
}

/**
 * Podcast-Style TTS Director Audio Cadence
 */
export class TtsDirectorAudio {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  public static speakCue(text: string, onEnd?: () => void, rate: number = 0.95, pitch: number = 1.0): void {
    if (!this.synth) {
      console.warn('Speech synthesis not available.');
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel();

    // Play subtle podcast chime tone before speaking
    this.playPodcastChime();

    setTimeout(() => {
      if (!this.synth) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate; // calm broadcast cadence
      utterance.pitch = pitch;

      // Select gentle natural voice if available
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.lang.startsWith('en')) && !v.name.includes('Zira')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    }, 400);
  }

  public static stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  private static playPodcastChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // Audio context not allowed without interaction
    }
  }
}
