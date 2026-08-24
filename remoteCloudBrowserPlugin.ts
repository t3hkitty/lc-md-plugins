import type { CloudAccount } from '../types/cloudAccounts';
import { normalizeCloudServerUrl } from './cloudAccountManager';
import { parseWebDAVDirectoryXml } from './webdavIndexerPlugin';

export interface RemoteNodeItem {
  id: string;
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  lastModified: string;
  mimeType?: string;
}

export interface RemoteFolderBrowseResult {
  currentPath: string;
  items: RemoteNodeItem[];
  parentPath?: string;
  error?: string;
}

/**
 * Universal Proxy Fetcher supporting local dev server middleware and StackCP PHP proxy
 */
export async function proxyFetch(
  targetUrl: string,
  options: { method?: string; headers?: Record<string, string>; body?: any } = {}
): Promise<Response> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {
    'X-Target-Url': targetUrl,
    'X-Target-Method': method,
    ...(options.headers || {})
  };

  let proxyUrl = '/api/webdav-proxy';
  let httpMethod = method;

  if (typeof window !== 'undefined' && window.location.pathname.includes('/lcmd')) {
    const basePath = window.location.pathname.split('/lcmd')[0];
    proxyUrl = `${basePath}/lcmd/api/webdav-proxy.php`;
    if (method === 'PROPFIND' || method === 'MKCOL') {
      httpMethod = 'POST';
    }
  }

  try {
    const res = await fetch(proxyUrl, {
      method: httpMethod,
      headers,
      body: options.body
    });

    if (res.ok || res.status === 207 || res.status === 200 || res.status === 401 || res.status === 403 || res.status === 404) {
      return res;
    }

    // Fallback attempt to root proxy path
    if (res.status === 404 && proxyUrl.endsWith('.php')) {
      return await fetch('/api/webdav-proxy', { method, headers, body: options.body });
    }
    return res;
  } catch (err) {
    // If proxy network failed, try direct fetch
    return await fetch(targetUrl, { method, headers: options.headers, body: options.body });
  }
}

export async function fetchRemoteFolderContents(
  account: CloudAccount,
  folderPath: string = '/'
): Promise<RemoteFolderBrowseResult> {
  // Sanitize path: if a non-Google Drive account received an id:... token, reset to root /
  let cleanPath = folderPath.trim() === '' ? '/' : folderPath;
  if (cleanPath.startsWith('id:') && account.presetId !== 'google-drive') {
    cleanPath = '/';
  }

  const targetUrl = normalizeCloudServerUrl(account.serverUrl, account.presetId);
  const token = (account.apiKey || account.tokenOrPassword || '').trim();

  // 1. GOOGLE DRIVE REST API BROWSER
  if (account.presetId === 'google-drive' && targetUrl.includes('googleapis.com')) {
    if (!token) {
      return {
        currentPath: cleanPath,
        items: [],
        error: 'Google Drive Auth Error: Please enter your Google OAuth Access Token (ya29.a0...) in Cloud Storage Account Manager.'
      };
    }

    try {
      let query = "trashed = false";
      if (cleanPath === '/' || cleanPath === 'root') {
        query += " and 'root' in parents";
      } else if (cleanPath.startsWith('id:')) {
        const folderId = cleanPath.replace(/^id:/, '');
        query += ` and '${folderId}' in parents`;
      }

      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=100&fields=files(id,name,mimeType,size,modifiedTime,parents)&orderBy=folder,name`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        return {
          currentPath: cleanPath,
          items: [],
          error: `Google Drive API returned HTTP ${res.status}: ${res.statusText}`
        };
      }

      const data = await res.json();
      const items: RemoteNodeItem[] = (data.files || []).map((f: any) => {
        const isDir = f.mimeType === 'application/vnd.google-apps.folder';
        return {
          id: f.id,
          name: f.name,
          path: isDir ? `id:${f.id}` : f.name,
          isDir,
          size: parseInt(f.size || '0', 10),
          lastModified: f.modifiedTime ? f.modifiedTime.split('T')[0] : new Date().toISOString().split('T')[0],
          mimeType: f.mimeType
        };
      });

      return {
        currentPath: cleanPath,
        items,
        parentPath: cleanPath === '/' ? undefined : '/'
      };
    } catch (err: any) {
      return {
        currentPath: cleanPath,
        items: [],
        error: `Google Drive Error: ${err.message || 'Failed to list Google Drive files.'}`
      };
    }
  }

  // 2. DROPBOX REST API BROWSER
  if (account.presetId === 'dropbox' && targetUrl.includes('dropboxapi.com')) {
    if (!token) {
      return {
        currentPath: cleanPath,
        items: [],
        error: 'Dropbox Auth Error: Please enter your Dropbox Access Token in Cloud Storage Account Manager.'
      };
    }

    try {
      const pathParam = cleanPath === '/' ? '' : cleanPath;
      const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: pathParam })
      });

      if (!res.ok) {
        return {
          currentPath: cleanPath,
          items: [],
          error: `Dropbox API returned HTTP ${res.status}: ${res.statusText}`
        };
      }

      const data = await res.json();
      const items: RemoteNodeItem[] = (data.entries || []).map((e: any) => {
        const isDir = e['.tag'] === 'folder';
        return {
          id: e.id || e.path_lower,
          name: e.name,
          path: e.path_display || e.path_lower,
          isDir,
          size: e.size || 0,
          lastModified: e.server_modified ? e.server_modified.split('T')[0] : new Date().toISOString().split('T')[0]
        };
      });

      const pathParts = cleanPath.split('/').filter(Boolean);
      pathParts.pop();
      const parent = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';

      return {
        currentPath: cleanPath,
        items,
        parentPath: cleanPath === '/' ? undefined : parent
      };
    } catch (err: any) {
      return {
        currentPath: cleanPath,
        items: [],
        error: `Dropbox Error: ${err.message || 'Failed to list Dropbox folder.'}`
      };
    }
  }

  // 3. TORBOX REST API v1 & WEBDAV BROWSER
  if (account.presetId === 'torbox' || targetUrl.includes('torbox.app')) {
    const apiKey = (account.apiKey || account.tokenOrPassword || '').trim();
    if (!apiKey) {
      return {
        currentPath: cleanPath,
        items: [],
        error: 'TorBox Auth Error: Please enter your TorBox API Token from https://torbox.app/settings in Cloud Storage Account Manager.'
      };
    }

    // Attempt WebDAV if endpoint is webdav.torbox.app
    if (targetUrl.includes('webdav.torbox.app')) {
      try {
        const cleanServer = targetUrl.replace(/\/$/, '');
        const cleanDir = cleanPath.replace(/^\//, '');
        const fullUrl = cleanDir ? `${cleanServer}/${cleanDir}` : cleanServer;

        const username = account.username || 'torbox';
        const creds = `${username}:${apiKey}`;
        const authHeader = `Basic ${btoa(creds)}`;

        const proxyRes = await proxyFetch(fullUrl, {
          method: 'PROPFIND',
          headers: {
            'Depth': '1',
            'Content-Type': 'application/xml',
            'Authorization': authHeader
          }
        });

        if (proxyRes.ok || proxyRes.status === 207 || proxyRes.status === 200) {
          const xmlText = await proxyRes.text();
          const items = parseWebDAVDirectoryXml(xmlText);
          const mapped: RemoteNodeItem[] = items.map((it, idx) => ({
            id: `tb-wd-${idx}-${it.filename}`,
            name: it.filename.replace(/\/$/, '').split('/').pop() || it.filename,
            path: it.filename,
            isDir: it.isDir,
            size: it.size,
            lastModified: it.lastModified
          }));

          return {
            currentPath: cleanPath,
            items: mapped,
            parentPath: cleanPath === '/' ? undefined : '/'
          };
        }
      } catch (e) {
        console.warn('TorBox WebDAV attempt failed, falling back to REST API via proxy:', e);
      }
    }

    // TorBox REST API via Server-Side Proxy (Bypasses Cloudflare CORS)
    try {
      const items: RemoteNodeItem[] = [];

      // 1. Fetch Torrents
      try {
        const torRes = await proxyFetch('https://api.torbox.app/v1/api/torrents/mylist?bypass_cache=true', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (torRes.ok) {
          const torData = await torRes.json();
          (torData.data || []).forEach((t: any) => {
            if (t.files && t.files.length > 0) {
              t.files.forEach((f: any) => {
                items.push({
                  id: `tb-tor-${t.id}-${f.id}`,
                  name: f.name || f.short_name || `${t.name} (File #${f.id})`,
                  path: `torrents/${t.id}/${f.id}`,
                  isDir: false,
                  size: f.size || t.size || 0,
                  lastModified: t.updated_at ? t.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
                  mimeType: f.mimetype || 'application/octet-stream'
                });
              });
            } else {
              items.push({
                id: `tb-tor-${t.id}`,
                name: t.name || `Torrent #${t.id}`,
                path: `torrents/${t.id}`,
                isDir: true,
                size: t.size || 0,
                lastModified: t.updated_at ? t.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
              });
            }
          });
        }
      } catch (e) {
        console.warn('TorBox torrents proxy fetch failed:', e);
      }

      // 2. Fetch Web Downloads (Debrid)
      try {
        const webRes = await proxyFetch('https://api.torbox.app/v1/api/webdl/mylist?bypass_cache=true', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (webRes.ok) {
          const webData = await webRes.json();
          (webData.data || []).forEach((w: any) => {
            items.push({
              id: `tb-webdl-${w.id}`,
              name: w.name || `Web Download #${w.id}`,
              path: `webdl/${w.id}`,
              isDir: false,
              size: w.size || 0,
              lastModified: w.updated_at ? w.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
              mimeType: 'application/octet-stream'
            });
          });
        }
      } catch (e) {
        console.warn('TorBox webdl proxy fetch failed:', e);
      }

      // 3. Fetch Usenet
      try {
        const useRes = await proxyFetch('https://api.torbox.app/v1/api/usenet/mylist?bypass_cache=true', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (useRes.ok) {
          const useData = await useRes.json();
          (useData.data || []).forEach((u: any) => {
            items.push({
              id: `tb-usenet-${u.id}`,
              name: u.name || `Usenet #${u.id}`,
              path: `usenet/${u.id}`,
              isDir: false,
              size: u.size || 0,
              lastModified: u.updated_at ? u.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
              mimeType: 'application/octet-stream'
            });
          });
        }
      } catch (e) {
        console.warn('TorBox usenet proxy fetch failed:', e);
      }

      return {
        currentPath: '/',
        items,
        parentPath: undefined
      };
    } catch (err: any) {
      return {
        currentPath: '/',
        items: [],
        error: `TorBox Error: ${err.message || 'Failed to list TorBox downloads.'}`
      };
    }
  }

  // 4. STANDARD WEBDAV PROPFIND (Filejump, Koofr, Nextcloud, rclone)
  try {
    const cleanServer = targetUrl.replace(/\/$/, '');
    const cleanDir = cleanPath.replace(/^\//, '');
    const fullUrl = cleanDir ? `${cleanServer}/${cleanDir}` : cleanServer;

    const headers: Record<string, string> = {
      'Depth': '1',
      'Content-Type': 'application/xml',
      'X-Target-Url': fullUrl
    };

    const username = account.username || (targetUrl.includes('torbox.app') ? 'torbox' : '');
    const password = account.apiKey || account.tokenOrPassword || '';

    if (account.apiKey && !targetUrl.includes('torbox.app')) {
      headers['Authorization'] = `Bearer ${account.apiKey}`;
    } else if (username || password) {
      const creds = `${username}:${password}`;
      headers['Authorization'] = `Basic ${btoa(creds)}`;
    }

    const proxyRes = await proxyFetch(fullUrl, {
      method: 'PROPFIND',
      headers
    });

    if (proxyRes.ok || proxyRes.status === 207 || proxyRes.status === 200) {
      const xmlText = await proxyRes.text();
      const items = parseWebDAVDirectoryXml(xmlText);

      const mapped: RemoteNodeItem[] = items.map((it, idx) => ({
        id: `node-${idx}-${it.filename}`,
        name: it.filename.replace(/\/$/, '').split('/').pop() || it.filename,
        path: it.filename,
        isDir: it.isDir,
        size: it.size,
        lastModified: it.lastModified
      }));

      const pathParts = cleanPath.split('/').filter(Boolean);
      pathParts.pop();
      const parent = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';

      return {
        currentPath: cleanPath,
        items: mapped,
        parentPath: cleanPath === '/' ? undefined : parent
      };
    }

    if (proxyRes.status === 401) {
      return {
        currentPath: cleanPath,
        items: [],
        error: `WebDAV server returned HTTP 401: Unauthorized for directory '${fullUrl}'. (Tip: Check your WebDAV App Password in Cloud Accounts or use Local Synced Directory picker below.)`
      };
    }

    return {
      currentPath: cleanPath,
      items: [],
      error: `WebDAV Proxy returned HTTP ${proxyRes.status}: ${proxyRes.statusText}`
    };
  } catch (err: any) {
    return {
      currentPath: cleanPath,
      items: [],
      error: `Failed to inspect WebDAV directory: ${err.message || 'Network error'}`
    };
  }
}
