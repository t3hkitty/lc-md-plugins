import type { RsyncConfig, RsyncManifest } from '../types/rsync';

export const DEFAULT_RSYNC_CONFIG: RsyncConfig = {
  targetType: 'ssh-nas',
  direction: 'export-push',
  localPath: './Library',
  remoteSshHost: 'nas.home.local',
  remoteSshPort: 22,
  remoteSshUser: 'reader',
  remotePath: '/volume1/books/Library',
  sshKeyPath: '~/.ssh/id_rsa',
  includeSidecarsOnly: false,
  includeBooks: true,
  includeConfigFiles: true,
  deleteExtraneousFiles: false,
  preservePermissions: true,
  compressData: true,
  dryRunMode: false
};

export function generateRsyncCommand(config: RsyncConfig): string {
  let flags = '-avzP';

  if (!config.compressData) {
    flags = '-avP';
  }
  if (config.deleteExtraneousFiles) {
    flags += ' --delete';
  }
  if (config.dryRunMode) {
    flags += ' --dry-run';
  }

  // SSH Key flag
  let sshFlag = '';
  if (config.remoteSshPort !== 22 || config.sshKeyPath) {
    const keyParam = config.sshKeyPath ? `-i ${config.sshKeyPath}` : '';
    const portParam = config.remoteSshPort !== 22 ? `-p ${config.remoteSshPort}` : '';
    sshFlag = ` -e "ssh ${keyParam} ${portParam}".trim()`;
  }

  // Include/Exclude Filters
  let filterStr = '';
  if (config.includeSidecarsOnly) {
    filterStr = ' --include="*.companion.md" --include="*.md" --exclude="*"';
  } else if (!config.includeBooks) {
    filterStr = ' --exclude="*.epub" --exclude="*.pdf" --exclude="*.cbz"';
  }

  let src = config.localPath;
  let dst = `${config.remoteSshUser}@${config.remoteSshHost}:${config.remotePath}`;

  if (config.targetType === 'local-folder') {
    dst = config.remotePath;
  }

  if (config.direction === 'import-pull') {
    // Reverse src and dst for import pull
    const temp = src;
    src = dst;
    dst = temp;
  }

  return `rsync ${flags}${sshFlag}${filterStr} "${src}/" "${dst}/"`;
}

export function generateRsyncBashScript(config: RsyncConfig): string {
  const cmd = generateRsyncCommand(config);
  const updatedIso = new Date().toISOString();

  let script = `#!/usr/bin/env bash\n`;
  script += `# Library Companion MD (LC-MD) - Rsync Auto-Sync Script\n`;
  script += `# Generated: ${updatedIso}\n`;
  script += `# Mode: ${config.direction.toUpperCase()} | Target: ${config.targetType.toUpperCase()}\n\n`;
  script += `echo "🚀 Starting LC-MD Rsync ${config.direction === 'export-push' ? 'Export Push' : 'Import Pull'}..."\n`;
  script += `${cmd}\n`;
  script += `if [ $? -eq 0 ]; then\n`;
  script += `  echo "✅ Rsync sync completed successfully!"\n`;
  script += `else\n`;
  script += `  echo "❌ Rsync sync failed with exit code $?"\n`;
  script += `fi\n`;

  return script;
}

export function generateRsyncPowerShellScript(config: RsyncConfig): string {
  const cmd = generateRsyncCommand(config);
  const updatedIso = new Date().toISOString();

  let script = `# Library Companion MD (LC-MD) - Rsync PowerShell Sync Script\n`;
  script += `# Generated: ${updatedIso}\n\n`;
  script += `Write-Host "🚀 Starting LC-MD Rsync Sync..." -ForegroundColor Cyan\n`;
  script += `${cmd}\n`;
  script += `if ($LASTEXITCODE -eq 0) {\n`;
  script += `  Write-Host "✅ Rsync sync completed successfully!" -ForegroundColor Green\n`;
  script += `} else {\n`;
  script += `  Write-Host "❌ Rsync sync failed with code $LASTEXITCODE" -ForegroundColor Red\n`;
  script += `}\n`;

  return script;
}

export function generateRsyncFilterRules(): string {
  let filter = `# .rsync-filter rules for Library Companion MD\n`;
  filter += `+ *.companion.md\n`;
  filter += `+ *.md\n`;
  filter += `+ *.epub\n`;
  filter += `+ .lc-md/config.json\n`;
  filter += `- *.tmp\n`;
  filter += `- .git/\n`;
  filter += `- node_modules/\n`;
  return filter;
}

export function buildRsyncManifest(config: RsyncConfig): RsyncManifest {
  return {
    version: '3.8.0',
    createdAt: new Date().toISOString(),
    config,
    filterRules: [
      '+ *.companion.md',
      '+ *.md',
      '+ *.epub',
      '+ .lc-md/config.json',
      '- *.tmp'
    ]
  };
}
