import type { Book } from '../types/resonance';
import type { CloudAccount } from '../types/cloudAccounts';
import { cleanSovereignFilename } from '../utils/pathResolver';

export interface WebDAVFileItem {
  filename: string;
  size: number;
  lastModified: string;
  isDir: boolean;
}

export async function fetchWebDAVDirectoryItems(
  serverUrl: string,
  dirPath: string,
  account?: CloudAccount
): Promise<{ items: WebDAVFileItem[]; xmlText: string; error?: string; statusCode?: number }> {
  const cleanServer = serverUrl.replace(/\/$/, '');
  const cleanDir = dirPath.replace(/^\//, '');
  const fullUrl = cleanDir ? `${cleanServer}/${cleanDir}` : cleanServer;
  const providerName = account?.name || 'Cloud Storage';

  // Direct Google Drive API v3 Directory Fetching
  if (account?.presetId === 'google-drive' && fullUrl.includes('googleapis.com')) {
    const token = (account.apiKey || account.tokenOrPassword || '').trim();
    if (!token) {
      return {
        items: [],
        xmlText: '',
        error: 'Google Drive Auth Error: Please enter your Google OAuth Access Token (ya29.a0...) in Cloud Storage Account Manager.'
      };
    }

    try {
      const gRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,size,modifiedTime)', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!gRes.ok) {
        return {
          items: [],
          xmlText: '',
          statusCode: gRes.status,
          error: `Google Drive API returned HTTP ${gRes.status}: ${gRes.statusText}. Please verify your OAuth Access Token in Cloud Storage Account Manager.`
        };
      }

      const gData = await gRes.json();
      const items: WebDAVFileItem[] = (gData.files || []).map((f: any) => ({
        filename: f.name,
        size: parseInt(f.size || '0', 10),
        lastModified: f.modifiedTime ? f.modifiedTime.split('T')[0] : new Date().toISOString().split('T')[0],
        isDir: f.mimeType === 'application/vnd.google-apps.folder'
      }));

      const mockXml = `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:">${items.map(i => `<d:response><d:href>${i.filename}</d:href><d:propstat><d:prop><d:getcontentlength>${i.size}</d:getcontentlength></d:prop></d:propstat></d:response>`).join('')}</d:multistatus>`;

      return { items, xmlText: mockXml, statusCode: 200 };
    } catch (err: any) {
      return {
        items: [],
        xmlText: '',
        error: `Google Drive API Error: ${err.message || 'Failed to connect to Google Drive API.'}`
      };
    }
  }

  // Direct Dropbox API v2 Directory Fetching
  if (account?.presetId === 'dropbox' && fullUrl.includes('dropboxapi.com')) {
    const token = (account.apiKey || account.tokenOrPassword || '').trim();
    if (!token) {
      return {
        items: [],
        xmlText: '',
        error: 'Dropbox Auth Error: Please enter your Dropbox OAuth Access Token in Cloud Storage Account Manager.'
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
          items: [],
          xmlText: '',
          statusCode: dbxRes.status,
          error: `Dropbox API returned HTTP ${dbxRes.status}: ${dbxRes.statusText}. Please check your Dropbox Access Token.`
        };
      }

      const dbxData = await dbxRes.json();
      const items: WebDAVFileItem[] = (dbxData.entries || []).map((e: any) => ({
        filename: e.name,
        size: e.size || 0,
        lastModified: e.server_modified ? e.server_modified.split('T')[0] : new Date().toISOString().split('T')[0],
        isDir: e['.tag'] === 'folder'
      }));

      const mockXml = `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:">${items.map(i => `<d:response><d:href>${i.filename}</d:href><d:propstat><d:prop><d:getcontentlength>${i.size}</d:getcontentlength></d:prop></d:propstat></d:response>`).join('')}</d:multistatus>`;

      return { items, xmlText: mockXml, statusCode: 200 };
    } catch (err: any) {
      return {
        items: [],
        xmlText: '',
        error: `Dropbox API Error: ${err.message || 'Failed to connect to Dropbox API.'}`
      };
    }
  }

  // Direct TorBox REST API v1 & WebDAV Directory Fetching
  if (account?.presetId === 'torbox' || fullUrl.includes('torbox.app')) {
    const apiKey = (account?.apiKey || account?.tokenOrPassword || '').trim();
    if (!apiKey) {
      return {
        items: [],
        xmlText: '',
        error: 'TorBox Auth Error: Please enter your TorBox API Token from https://torbox.app/settings in Cloud Storage Account Manager.'
      };
    }

    // Try WebDAV first if configured as webdav.torbox.app
    if (fullUrl.includes('webdav.torbox.app')) {
      try {
        const username = account?.username || 'torbox';
        const credentials = `${username}:${apiKey}`;
        const authHeader = `Basic ${btoa(credentials)}`;

        const proxyRes = await fetch(
          (typeof window !== 'undefined' && window.location.pathname.includes('/lcmd'))
            ? `${window.location.pathname.split('/lcmd')[0]}/lcmd/api/webdav-proxy.php`
            : '/api/webdav-proxy',
          {
            method: 'PROPFIND',
            headers: {
              'Depth': '1',
              'Content-Type': 'application/xml',
              'X-Target-Url': fullUrl,
              'Authorization': authHeader
            }
          }
        );

        if (proxyRes.ok || proxyRes.status === 207 || proxyRes.status === 200) {
          const xmlText = await proxyRes.text();
          const items = parseWebDAVDirectoryXml(xmlText);
          return { items, xmlText, statusCode: proxyRes.status };
        }
      } catch (e) {
        console.warn('TorBox WebDAV PROPFIND failed, trying REST API fallback:', e);
      }
    }

    // TorBox REST API v1 via Server Proxy
    try {
      const items: WebDAVFileItem[] = [];
      const proxyUrl = (typeof window !== 'undefined' && window.location.pathname.includes('/lcmd'))
        ? `${window.location.pathname.split('/lcmd')[0]}/lcmd/api/webdav-proxy.php`
        : '/api/webdav-proxy';

      // 1. Fetch torrents and inner files
      const torRes = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'X-Target-Url': 'https://api.torbox.app/v1/api/torrents/mylist?bypass_cache=true',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (torRes.ok) {
        const torData = await torRes.json();
        (torData.data || []).forEach((t: any) => {
          if (t.files && t.files.length > 0) {
            t.files.forEach((f: any) => {
              items.push({
                filename: f.name || f.short_name || `${t.name}/file_${f.id}`,
                size: f.size || t.size || 0,
                lastModified: t.updated_at ? t.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
                isDir: false
              });
            });
          } else {
            items.push({
              filename: t.name || `torrent_${t.id}`,
              size: t.size || 0,
              lastModified: t.updated_at ? t.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
              isDir: true
            });
          }
        });
      }

      // 2. Fetch web downloads (debrid)
      const webRes = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'X-Target-Url': 'https://api.torbox.app/v1/api/webdl/mylist?bypass_cache=true',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (webRes.ok) {
        const webData = await webRes.json();
        (webData.data || []).forEach((w: any) => {
          items.push({
            filename: w.name || `webdl_${w.id}`,
            size: w.size || 0,
            lastModified: w.updated_at ? w.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            isDir: false
          });
        });
      }

      const mockXml = `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:">${items.map(i => `<d:response><d:href>${i.filename}</d:href><d:propstat><d:prop><d:getcontentlength>${i.size}</d:getcontentlength></d:prop></d:propstat></d:response>`).join('')}</d:multistatus>`;

      return { items, xmlText: mockXml, statusCode: 200 };
    } catch (err: any) {
      return {
        items: [],
        xmlText: '',
        error: `TorBox API Error: ${err.message || 'Failed to fetch TorBox directory listing.'}`
      };
    }
  }

  const headers: Record<string, string> = {
    'Depth': '1',
    'Content-Type': 'application/xml',
    'X-Target-Url': fullUrl
  };

  const username = account?.username || (fullUrl.includes('torbox.app') ? 'torbox' : '');
  const password = account?.apiKey || account?.tokenOrPassword || '';

  if (account?.apiKey && !fullUrl.includes('torbox.app')) {
    headers['Authorization'] = `Bearer ${account.apiKey}`;
  } else if (username || password) {
    const credentials = `${username}:${password}`;
    headers['Authorization'] = `Basic ${btoa(credentials)}`;
  }

  try {
    const proxyUrl = (typeof window !== 'undefined' && window.location.pathname.includes('/lcmd'))
      ? `${window.location.pathname.split('/lcmd')[0]}/lcmd/api/webdav-proxy.php`
      : '/api/webdav-proxy';

    const proxyRes = await fetch(proxyUrl, {
      method: 'PROPFIND',
      headers
    });

    if (proxyRes.ok || proxyRes.status === 207 || proxyRes.status === 200) {
      const xmlText = await proxyRes.text();
      const items = parseWebDAVDirectoryXml(xmlText);
      return { items, xmlText, statusCode: proxyRes.status };
    }

    if (proxyRes.status === 401) {
      return {
        items: [],
        xmlText: '',
        statusCode: 401,
        error: `HTTP 401 Unauthorized: ${providerName} credentials failed. Please verify your Username (${account?.username || 'None'}) and App Password / Token in Cloud Accounts.`
      };
    }

    if (proxyRes.status === 404) {
      return {
        items: [],
        xmlText: '',
        statusCode: 404,
        error: `HTTP 404 Not Found: Directory '${fullUrl}' was not found on ${providerName}. Try changing your directory path to '/' or '/md_library'.`
      };
    }

    if (proxyRes.status === 403) {
      return {
        items: [],
        xmlText: '',
        statusCode: 403,
        error: `HTTP 403 Forbidden: ${providerName} WebDAV access denied for this directory.`
      };
    }

    const errText = await proxyRes.text().catch(() => '');
    return {
      items: [],
      xmlText: '',
      statusCode: proxyRes.status,
      error: `${providerName} WebDAV returned HTTP ${proxyRes.status} ${proxyRes.statusText}: ${errText.slice(0, 150)}`
    };

  } catch (err: any) {
    return {
      items: [],
      xmlText: '',
      error: `Network Connection Error: ${err.message || 'Failed to communicate with WebDAV proxy.'}`
    };
  }
}

export function parseWebDAVDirectoryXml(xmlString: string): WebDAVFileItem[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const responses = Array.from(xmlDoc.querySelectorAll('d\\:response, response'));

  if (responses.length === 0) {
    return parseTextDirectoryListing(xmlString);
  }

  return responses.map((resp) => {
    const href = resp.querySelector('d\\:href, href')?.textContent || '';
    const isDir = Boolean(resp.querySelector('d\\:collection, collection'));
    const sizeStr = resp.querySelector('d\\:getcontentlength, getcontentlength')?.textContent || '0';
    const modified = resp.querySelector('d\\:getlastmodified, getlastmodified')?.textContent || new Date().toISOString();

    const filename = decodeURIComponent(href.split('/').filter(Boolean).pop() || 'file');

    return {
      filename,
      size: parseInt(sizeStr, 10),
      lastModified: modified,
      isDir
    };
  }).filter(item => item.filename && !item.filename.startsWith('.'));
}

export function parseTextDirectoryListing(text: string): WebDAVFileItem[] {
  // If the user accidentally pasted the Bookmarklet JavaScript code into the text field:
  if (text.includes('javascript:') || text.includes('querySelectorAll')) {
    const filenameMatches = text.match(/\b[\w\-\. ]+\.(epub|pdf|md|txt)\b/gi) || [];
    if (filenameMatches.length > 0) {
      const uniqueNames = Array.from(new Set(filenameMatches));
      return uniqueNames.map((fn, idx) => ({
        filename: fn,
        size: 1500000 + (idx * 200000),
        lastModified: new Date().toISOString().split('T')[0],
        isDir: false
      }));
    }
  }

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  return lines.map((line, idx) => {
    const clean = line.replace(/^[\s*\-\d\.\:\(\)\[\]xX]+/, '').trim();
    const isDir = !clean.includes('.');
    const filename = clean.endsWith('.epub') || clean.endsWith('.pdf') || clean.endsWith('.md') ? clean : `${clean}.epub`;

    return {
      filename,
      size: 1500000 + (idx * 250000),
      lastModified: new Date().toISOString().split('T')[0],
      isDir
    };
  });
}

export function generateWebDAVDirectoryMarkdownIndex(
  serverUrl: string,
  dirPath: string,
  files: WebDAVFileItem[]
): string {
  let md = `# ☁️ WebDAV Storage Directory Index\n`;
  md += `- **Server URL:** \`${serverUrl}\`\n`;
  md += `- **Path:** \`${dirPath}\`\n`;
  md += `- **Indexed At:** \`${new Date().toISOString()}\`\n\n`;

  md += `## Ebook & Companion Files\n`;

  files.forEach(f => {
    const icon = f.isDir ? '📁' : f.filename.endsWith('.epub') ? '📖' : '📄';
    const cleanName = cleanSovereignFilename(f.filename);
    md += `- ${icon} **[${cleanName}](${serverUrl.replace(/\/$/, '')}/${dirPath.replace(/^\//, '')}/${f.filename})** (${(f.size / 1024).toFixed(1)} KB)\n`;
  });

  return md;
}

export function convertWebDAVFilesToBooks(files: WebDAVFileItem[], relLinkRoot: string): Book[] {
  const ebookFiles = files.filter(f => !f.isDir);

  return ebookFiles.map((f, idx) => {
    const title = cleanSovereignFilename(f.filename.replace(/\.(epub|pdf|txt|md)$/i, ''));
    return {
      id: `webdav-${idx}-${Date.now()}`,
      title,
      author: 'Filejump Remote Library',
      coverColor: '#0284c7',
      totalChapters: 3,
      currentChapterIndex: 0,
      currentParagraphIndex: 0,
      resonanceStream: [
        {
          id: `res-webdav-${idx}`,
          rawText: `Indexed from Filejump WebDAV: ${f.filename}`,
          category: 'Diaper Emergency',
          intensityScore: 4,
          timestamp: new Date().toLocaleTimeString(),
          formattedDate: new Date().toLocaleTimeString(),
          progressPercent: 5,
          cfi: 'epubcfi(/6/4!/4/2/2/1:0)',
          chapterTitle: 'Chapter 1: Sovereign Cloud Intake',
          paragraphIndex: 0,
          paragraphSnippet: `Streamed directly from Filejump WebDAV storage file: ${f.filename}.`,
          notes: 'Auto-indexed via Library Companion MD WebDAV Engine'
        }
      ],
      sidecarMarkdown: `# Companion Sidecar: ${title}\n- **Relative Root:** \`${relLinkRoot}\`\n- **Remote Source:** Filejump WebDAV\n\n## Reader Resonance Stream\n- **[${new Date().toLocaleTimeString()} | 5%] [Category: Diaper Emergency]** *Indexed from Filejump WebDAV: ${f.filename}*\n`,
      chapters: [
        {
          title: 'Chapter 1: Sovereign Cloud Intake',
          cfiBase: `epubcfi(/6/${(idx + 1) * 4}[webdav0${idx + 1}]!`,
          paragraphs: [
            `Streamed directly from Filejump WebDAV storage file: ${f.filename}.`,
            `Portable relative link root active: ${relLinkRoot}.`,
            `Full sidecar metadata synced to companion .md storage.`
          ]
        },
        {
          title: 'Chapter 2: Portable Sidecar Annotations',
          cfiBase: `epubcfi(/6/${(idx + 1) * 8}[webdav0${idx + 2}]!`,
          paragraphs: [
            'All bookmarks, micro-tweets, and quick captures remain 100% portable.',
            'Zero numeric parenthesis directory names.'
          ]
        }
      ]
    };
  });
}
