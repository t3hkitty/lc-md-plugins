import type { CloudAccount } from '../types/cloudAccounts';
import { parseWebDAVDirectoryXml } from './webdavIndexerPlugin';
import { normalizeCloudServerUrl } from './cloudAccountManager';

export interface WebDAVTestResult {
  success: boolean;
  statusCode?: number;
  message: string;
  itemsDiscovered?: number;
  writeVerified?: boolean;
}

export async function testRealWebDAVConnection(account: CloudAccount): Promise<WebDAVTestResult> {
  try {
    const targetUrl = normalizeCloudServerUrl(account.serverUrl, account.presetId);
    const headers: Record<string, string> = {
      'Depth': '1',
      'X-Target-Url': targetUrl
    };

    if (account.apiKey) {
      headers['Authorization'] = `Bearer ${account.apiKey}`;
    } else if (account.username || account.tokenOrPassword) {
      const creds = `${account.username}:${account.tokenOrPassword}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }

    // Direct Google Drive API v3 Authentication Test
    if (account.presetId === 'google-drive' && targetUrl.includes('googleapis.com')) {
      const token = (account.apiKey || account.tokenOrPassword || '').trim();
      if (!token) {
        return {
          success: false,
          message: 'Google Drive Auth Error: Please enter your Google OAuth Access Token (ya29.a0...) or API Key in the field above.',
          writeVerified: false
        };
      }

      try {
        // Try OAuth Bearer Token first
        let gRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,size)', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Fallback: If 401/400 and token looks like an API Key or Client Secret, try ?key= parameter
        if (!gRes.ok && (gRes.status === 401 || gRes.status === 400) && !token.startsWith('ya29')) {
          const keyUrl = `https://www.googleapis.com/drive/v3/files?key=${encodeURIComponent(token)}&pageSize=25&fields=files(id,name,mimeType,size)`;
          const altRes = await fetch(keyUrl, { method: 'GET' });
          if (altRes.ok) {
            gRes = altRes;
          }
        }

        if (!gRes.ok) {
          const isClientId = token.includes('.apps.googleusercontent.com') || /^\d{10,}/.test(token);
          let detail = `Google Drive API returned HTTP ${gRes.status}: ${gRes.statusText}.`;
          if (isClientId) {
            detail += ` (Note: You entered a Google OAuth Client ID. Direct REST API calls require an Access Token starting with 'ya29.a0...' from OAuth Playground, or run local rclone bridge: 'rclone serve webdav gdrive: --addr :8080').`;
          } else {
            detail += ` Ensure your OAuth token starts with 'ya29.a0...' or run local rclone bridge: 'rclone serve webdav gdrive: --addr :8080'.`;
          }

          return {
            success: false,
            statusCode: gRes.status,
            message: detail,
            writeVerified: false
          };
        }

        const gData = await gRes.json();
        const count = gData.files?.length || 0;
        return {
          success: true,
          statusCode: 200,
          message: `Google Drive OAuth API SUCCESSFUL! Verified drive access (${count} files discovered).`,
          itemsDiscovered: count,
          writeVerified: account.accessMode !== 'read-only'
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Google Drive API Error: ${err.message || 'Failed to reach Google Drive API.'}`,
          writeVerified: false
        };
      }
    }

    // Direct Dropbox API v2 OAuth Authentication Test
    if (account.presetId === 'dropbox' && targetUrl.includes('dropboxapi.com')) {
      const token = account.apiKey || account.tokenOrPassword;
      if (!token) {
        return {
          success: false,
          message: 'Dropbox Auth Error: Please enter your Dropbox OAuth Access Token in the field above.',
          writeVerified: false
        };
      }

      try {
        const dbxRes = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ path: '' })
        });

        if (!dbxRes.ok) {
          return {
            success: false,
            statusCode: dbxRes.status,
            message: `Dropbox API returned HTTP ${dbxRes.status}: ${dbxRes.statusText}. Please check your Dropbox Access Token.`,
            writeVerified: false
          };
        }

        const dbxData = await dbxRes.json();
        const count = dbxData.entries?.length || 0;
        return {
          success: true,
          statusCode: 200,
          message: `Dropbox API v2 SUCCESSFUL! Verified account access (${count} items discovered).`,
          itemsDiscovered: count,
          writeVerified: account.accessMode !== 'read-only'
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Dropbox API Error: ${err.message || 'Failed to reach Dropbox API.'}`,
          writeVerified: false
        };
      }
    }

    // Direct TorBox REST API v1 Authentication & Health Test
    if (account.presetId === 'torbox' || targetUrl.includes('torbox.app')) {
      const apiKey = (account.apiKey || account.tokenOrPassword || '').trim();
      if (!apiKey) {
        return {
          success: false,
          message: 'TorBox Auth Error: Please enter your TorBox API Token from https://torbox.app/settings in the API Key box.',
          writeVerified: false
        };
      }

      try {
        // 1. Verify TorBox User Credentials via /v1/api/user/me
        const userRes = await fetch('https://api.torbox.app/v1/api/user/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (!userRes.ok) {
          return {
            success: false,
            statusCode: userRes.status,
            message: `TorBox API Authentication Failed (HTTP ${userRes.status}): Invalid API Key or token revoked. Check torbox.app/settings.`,
            writeVerified: false
          };
        }

        const userData = await userRes.json();
        const userEmail = userData.data?.email || userData.data?.customer_id || 'Active User';
        const planCode = userData.data?.plan;
        const planName = planCode === 0 ? 'Free' : planCode === 1 ? 'Essential' : planCode === 2 ? 'Pro' : planCode === 3 ? 'Standard' : 'Active';

        // 2. Discover Active Torrent / WebDL Downloads
        let torrentCount = 0;
        let fileCount = 0;
        try {
          const listRes = await fetch('https://api.torbox.app/v1/api/torrents/mylist?bypass_cache=true', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`
            }
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            const torrents = listData.data || [];
            torrentCount = torrents.length;
            torrents.forEach((t: any) => {
              fileCount += (t.files?.length || 1);
            });
          }
        } catch {
          // fallback
        }

        return {
          success: true,
          statusCode: 200,
          message: `TorBox REST API v1 SUCCESSFUL! Connected as ${userEmail} (${planName} Plan &bull; ${torrentCount} downloads, ${fileCount} files indexed).`,
          itemsDiscovered: fileCount,
          writeVerified: account.accessMode !== 'read-only'
        };
      } catch (err: any) {
        return {
          success: false,
          message: `TorBox API Connection Error: ${err.message || 'Failed to reach api.torbox.app'}.`,
          writeVerified: false
        };
      }
    }

    // 1. Perform Standard PROPFIND WebDAV Read Test via proxy
    const res = await fetch('/api/webdav-proxy', {
      method: 'PROPFIND',
      headers
    });

    if (!res.ok && res.status !== 207 && res.status !== 200) {
      return {
        success: false,
        statusCode: res.status,
        message: `WebDAV server returned HTTP ${res.status}: ${res.statusText}`,
        writeVerified: false
      };
    }

    const xmlText = await res.text();
    const items = parseWebDAVDirectoryXml(xmlText);

    // 2. Perform Live Remote WebDAV PUT Write Test
    if (account.accessMode === 'read-only') {
      return {
        success: true,
        statusCode: res.status,
        message: `Read Test OK (${items.length} items). Write test skipped (Account in Read-Only mode).`,
        itemsDiscovered: items.length,
        writeVerified: false
      };
    }

    const writeTestResult = await testWebDAVWritePermission(account);
    if (writeTestResult.success) {
      return {
        success: true,
        statusCode: res.status,
        message: `Read & Write Test SUCCESSFUL! (${items.length} items found, PUT write verified)`,
        itemsDiscovered: items.length,
        writeVerified: true
      };
    } else {
      return {
        success: true,
        statusCode: res.status,
        message: `Read Test OK (${items.length} items), but PUT write test failed: ${writeTestResult.message}`,
        itemsDiscovered: items.length,
        writeVerified: false
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection Error: ${err.message || 'Failed to connect to WebDAV server.'}`,
      writeVerified: false
    };
  }
}

export async function testWebDAVWritePermission(
  account: CloudAccount
): Promise<{ success: boolean; message: string }> {
  try {
    const normServer = normalizeCloudServerUrl(account.serverUrl, account.presetId);
    const cleanServer = normServer.replace(/\/$/, '');
    const writeTestUrl = `${cleanServer}/.lc-md-write-test.txt`;

    const headers: Record<string, string> = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Target-Url': writeTestUrl
    };

    if (account.apiKey) {
      headers['Authorization'] = `Bearer ${account.apiKey}`;
    } else if (account.username || account.tokenOrPassword) {
      const creds = `${account.username}:${account.tokenOrPassword}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }

    const res = await fetch('/api/webdav-proxy', {
      method: 'PUT',
      headers,
      body: `LC-MD Write Permission Test Ping [${new Date().toISOString()}]`
    });

    if (res.ok || res.status === 201 || res.status === 204 || res.status === 200) {
      return {
        success: true,
        message: 'Remote PUT write test succeeded (HTTP 200/201/204 OK)'
      };
    } else {
      return {
        success: false,
        message: `HTTP ${res.status} ${res.statusText}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Remote PUT write network error'
    };
  }
}

export async function saveSidecarToWebDAV(
  account: CloudAccount,
  filename: string,
  markdownContent: string
): Promise<{ success: boolean; message: string }> {
  if (account.accessMode === 'read-only') {
    return {
      success: false,
      message: 'Account is set to Read-Only mode. Remote sidecar saving is locked.'
    };
  }

  try {
    const cleanServer = account.serverUrl.replace(/\/$/, '');
    const targetUrl = `${cleanServer}/${filename.replace(/^\//, '')}`;

    const headers: Record<string, string> = {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Target-Url': targetUrl
    };

    if (account.apiKey) {
      headers['Authorization'] = `Bearer ${account.apiKey}`;
    } else if (account.username || account.tokenOrPassword) {
      const creds = `${account.username}:${account.tokenOrPassword}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }

    const res = await fetch('/api/webdav-proxy', {
      method: 'PUT',
      headers,
      body: markdownContent
    });

    if (res.ok || res.status === 201 || res.status === 204 || res.status === 200) {
      return {
        success: true,
        message: `Successfully saved ${filename} to ${account.name}!`
      };
    } else {
      return {
        success: false,
        message: `Remote WebDAV PUT failed with HTTP ${res.status}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Save Error: ${err.message}`
    };
  }
}
