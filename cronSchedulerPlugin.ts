export interface CronJobTask {
  id: string;
  name: string;
  description: string;
  pluginId: string;
  cronExpression: string; // e.g. "*/15 * * * *"
  humanReadable: string;
  enabled: boolean;
  targetAction: 'idle-drive-scan' | 'metadata-enrich' | 'sidecar-backup' | 'spotify-scrobble' | 'opds-rebuild' | 'custom-script';
  vpsScriptCommand: string;
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'failed' | 'running';
  executionLogs: string[];
}

const STORAGE_KEY_CRON_JOBS = 'lc_md_vps_cron_jobs_v1';

export const DEFAULT_VPS_CRON_JOBS: CronJobTask[] = [
  {
    id: 'cron-drive-scanner',
    name: 'Attached Cloud & Downloads Idle Scanner',
    description: 'Scans opt-in WebDAV/Filejump/Nextcloud folders and local downloads for matching files with Zettelkasten serial links.',
    pluginId: 'background-drive-scanner',
    cronExpression: '*/30 * * * *',
    humanReadable: 'Every 30 minutes',
    enabled: true,
    targetAction: 'idle-drive-scan',
    vpsScriptCommand: 'node /opt/lc-md/scripts/scan_drives.js --scope=/ebooks --out=/opt/lc-md/vault/_staged_matches.temp.md',
    executionLogs: ['[OK] Initialized cron schedule: */30 * * * *']
  },
  {
    id: 'cron-spotify-scrobble',
    name: 'Spotify Linking & Music Scrobbler',
    description: 'Scrobbles currently playing music and links vinyl/digital album sidecars into Black Box vault.',
    pluginId: 'spotify-music-linking',
    cronExpression: '0 * * * *',
    humanReadable: 'Hourly (at minute 0)',
    enabled: true,
    targetAction: 'spotify-scrobble',
    vpsScriptCommand: 'node /opt/lc-md/scripts/spotify_sync.js --link-vault=/opt/lc-md/vault/music',
    executionLogs: ['[OK] Ready to scrobble tracks and link Zettelkasten music sidecars.']
  },
  {
    id: 'cron-metadata-sync',
    name: 'Library of Congress & ISBN Enrichment',
    description: 'Background worker querying LoC MARC21 and decentralized preservation mirrors for unlinked vault records.',
    pluginId: 'metadata-sync',
    cronExpression: '0 3 * * *',
    humanReadable: 'Daily at 3:00 AM',
    enabled: true,
    targetAction: 'metadata-enrich',
    vpsScriptCommand: 'node /opt/lc-md/scripts/enrich_metadata.js --all',
    executionLogs: ['[OK] LoC MARC21 enrichment cron ready.']
  },
  {
    id: 'cron-sidecar-backup',
    name: 'Two-Way WebDAV & Rsync Mirroring',
    description: 'Syncs all .companion.md sidecars and staging temp files to remote sovereign WebDAV mirror.',
    pluginId: 'rsync-engine',
    cronExpression: '0 4 * * *',
    humanReadable: 'Daily at 4:00 AM',
    enabled: false,
    targetAction: 'sidecar-backup',
    vpsScriptCommand: 'rsync -avz --delete /opt/lc-md/vault/ user@backup.vps:/var/www/vault/',
    executionLogs: ['[STANDBY] Awaiting target server rsync credentials.']
  },
  {
    id: 'cron-opds-rebuild',
    name: 'OPDS 1.2 XML Feed & Catalog Rebuild',
    description: 'Regenerates static OPDS catalogs for Moon+ Reader, KOReader, and e-ink handhelds.',
    pluginId: 'opds-server',
    cronExpression: '0 0 * * 0',
    humanReadable: 'Weekly on Sunday at midnight',
    enabled: true,
    targetAction: 'opds-rebuild',
    vpsScriptCommand: 'node /opt/lc-md/scripts/rebuild_opds.js --out=/var/www/html/opds/feed.xml',
    executionLogs: ['[OK] Weekly OPDS catalog generation enabled.']
  },
  {
    id: 'cron-ocp-vps-health',
    name: 'OCPkit VPS Storage & Process Telemetry',
    description: 'Remote health monitor on OCPkit VPS (147.224.54.244): checks disk usage (df -h) and top memory/CPU processes (ps aux).',
    pluginId: 'vps-health-telemetry',
    cronExpression: '*/15 * * * *',
    humanReadable: 'Every 15 minutes',
    enabled: true,
    targetAction: 'custom-script',
    vpsScriptCommand: '/tmp/vps_health.sh',
    executionLogs: ['[OK] Telemetry routine initialized for ocpkit (147.224.54.244).']
  }
];

export function loadSavedCronJobs(): CronJobTask[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CRON_JOBS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load saved cron jobs:', e);
  }
  return DEFAULT_VPS_CRON_JOBS;
}

export function saveCronJobs(jobs: CronJobTask[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CRON_JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save cron jobs:', e);
  }
}

/**
 * Generates standard Linux crontab configuration (/etc/cron.d/lc-md-scheduler)
 */
export function generateLinuxCrontab(jobs: CronJobTask[]): string {
  const enabledJobs = jobs.filter(j => j.enabled);
  let content = `# ==========================================================\n`;
  content += `# Sovereign Library Companion MD & Black Box - VPS Crontab\n`;
  content += `# Generated: ${new Date().toISOString()}\n`;
  content += `# Path: /etc/cron.d/lc-md-scheduler (or crontab -e)\n`;
  content += `# ==========================================================\n\n`;
  content += `SHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=""\n\n`;

  enabledJobs.forEach(job => {
    content += `# Task: ${job.name} (${job.humanReadable})\n`;
    content += `${job.cronExpression} root ${job.vpsScriptCommand} >> /var/log/lc-md-${job.id}.log 2>&1\n\n`;
  });

  return content;
}

/**
 * Generates standalone Node.js / PM2 headless cron runner script
 */
export function generateNodeCronRunnerScript(jobs: CronJobTask[]): string {
  const enabledJobs = jobs.filter(j => j.enabled);
  let script = `/**
 * Sovereign Library Companion MD - Headless VPS Cron Runner (Node.js & PM2)
 * Run: pm2 start cron_runner.js --name lc-md-cron
 */
const cron = require('node-cron');
const { exec } = require('child_process');

console.log('[Sovereign Scheduler] Starting VPS headless cron engine...');

`;

  enabledJobs.forEach(job => {
    script += `// ${job.name} (${job.humanReadable})\n`;
    script += `cron.schedule('${job.cronExpression}', () => {\n`;
    script += `  console.log('[Cron] Executing: ${job.name} at ' + new Date().toISOString());\n`;
    script += `  exec('${job.vpsScriptCommand.replace(/'/g, "\\'")}', (err, stdout, stderr) => {\n`;
    script += `    if (err) console.error('[Cron Error] ${job.id}:', err.message);\n`;
    script += `    else console.log('[Cron OK] ${job.id}: Complete');\n`;
    script += `  });\n`;
    script += `});\n\n`;
  });

  script += `console.log('[Sovereign Scheduler] ${enabledJobs.length} active cron tasks scheduled.');\n`;
  return script;
}

/**
 * Generates systemd .service and .timer units
 */
export function generateSystemdUnits(job: CronJobTask): { serviceUnit: string; timerUnit: string } {
  const serviceUnit = `[Unit]
Description=Sovereign LC-MD Task: ${job.name}
After=network.target

[Service]
Type=oneshot
User=root
WorkingDirectory=/opt/lc-md
ExecStart=${job.vpsScriptCommand}

[Install]
WantedBy=multi-user.target
`;

  const timerUnit = `[Unit]
Description=Timer for Sovereign LC-MD Task: ${job.name}

[Timer]
OnCalendar=${job.cronExpression === '0 * * * *' ? 'hourly' : job.cronExpression === '0 3 * * *' ? '*-*-* 03:00:00' : '*:0/30'}
Persistent=true

[Install]
WantedBy=timers.target
`;

  return { serviceUnit, timerUnit };
}
