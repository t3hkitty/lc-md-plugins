export interface StackcpDeployConfig {
  host: string;
  user: string;
  pass: string;
  localDir: string;
  remoteDir: string;
  liveUrl: string;
  port: number;
}

export const DEFAULT_STACKCP_CONFIG: StackcpDeployConfig = {
  host: 'ftp.us.stackcp.com',
  user: 'kitty@artkitty.net',
  pass: 'YOUR_STACKCP_FTP_PASSWORD_HERE',
  localDir: './dist',
  remoteDir: '/public_html/meow/lcmd/',
  liveUrl: 'https://meow.artkitty.net/lcmd',
  port: 21
};

export function generateStackcpLftpScript(config: StackcpDeployConfig = DEFAULT_STACKCP_CONFIG): string {
  return `#!/bin/bash
# StackCP FTP Deployment Script for ${config.liveUrl}
# Target Server: ${config.host}

HOST="${config.host}"
USER="${config.user}"
PASS='${config.pass}'
LOCAL_BUILD_DIR="${config.localDir}"

echo "Connecting to $HOST as $USER to deploy ${config.remoteDir}..."

lftp -u "$USER","$PASS" -p ${config.port} "$HOST" << 'FTP_CMDS'
mkdir -p ${config.remoteDir}
mirror -R ${config.localDir} ${config.remoteDir}
bye
FTP_CMDS

echo "Deployment complete! ${config.liveUrl} is live."
`;
}

export function getSavedStackcpConfig(): StackcpDeployConfig {
  try {
    const raw = localStorage.getItem('lc_md_stackcp_config');
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load StackCP config:', err);
  }
  return DEFAULT_STACKCP_CONFIG;
}

export function saveStackcpConfig(config: StackcpDeployConfig): void {
  try {
    localStorage.setItem('lc_md_stackcp_config', JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save StackCP config:', err);
  }
}
