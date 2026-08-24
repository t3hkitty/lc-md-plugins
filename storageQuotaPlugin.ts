/**
 * Storage Quota and Local Folder Upgrade Plugin
 * Monitors browser cache / IndexedDB / localStorage memory limits and prompts users
 * to mount a sovereign local folder or WebDAV drive when image data scales up.
 */

export interface StorageQuotaStatus {
  usedBytes: number;
  totalQuotaBytes: number;
  usedFormatted: string;
  totalFormatted: string;
  usagePercent: number;
  isNearingLimit: boolean;
  recommendation: 'optimal' | 'upgrade_prompt' | 'critical';
  promptMessage?: string;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Calculates estimated storage usage across books and image data in memory / localStorage
 */
export async function calculateStorageUsage(vaultBooks?: any[]): Promise<StorageQuotaStatus> {
  let usedBytes = 0;
  let totalQuotaBytes = 50 * 1024 * 1024; // Default 50MB browser target threshold

  // Estimate from browser navigator.storage API if available
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage !== undefined) usedBytes = estimate.usage;
      if (estimate.quota !== undefined) totalQuotaBytes = estimate.quota;
    } catch {
      // fallback to manual estimation
    }
  }

  // If navigator estimate is low or 0, calculate from in-memory vault book images
  if (vaultBooks && vaultBooks.length > 0) {
    let bookBytes = 0;
    for (const b of vaultBooks) {
      if (b.coverImageUrl && b.coverImageUrl.startsWith('data:')) {
        bookBytes += b.coverImageUrl.length;
      }
      if (b.originalImageUrl && b.originalImageUrl.startsWith('data:')) {
        bookBytes += b.originalImageUrl.length;
      }
      if (b.sidecarMarkdown) {
        bookBytes += b.sidecarMarkdown.length;
      }
    }
    if (bookBytes > usedBytes) {
      usedBytes = bookBytes;
    }
  }

  const usagePercent = totalQuotaBytes > 0 ? (usedBytes / totalQuotaBytes) * 100 : 0;
  // Threshold: if > 15MB or > 65% of quota
  const isNearingLimit = usedBytes > 15 * 1024 * 1024 || usagePercent > 65;

  let recommendation: 'optimal' | 'upgrade_prompt' | 'critical' = 'optimal';
  let promptMessage: string | undefined;

  if (usedBytes > 30 * 1024 * 1024 || usagePercent > 85) {
    recommendation = 'critical';
    promptMessage = `⚠️ Vault image cache is reaching high capacity (${formatBytes(usedBytes)}). Mount a Sovereign Local Folder (File System Access) or WebDAV drive to stream unlimited full-resolution scans without browser memory limits!`;
  } else if (isNearingLimit) {
    recommendation = 'upgrade_prompt';
    promptMessage = `💡 High-resolution scanned card/comic covers detected (${formatBytes(usedBytes)} in cache). Upgrade to a Sovereign Local Folder for zero-cache file persistence!`;
  }

  return {
    usedBytes,
    totalQuotaBytes,
    usedFormatted: formatBytes(usedBytes),
    totalFormatted: formatBytes(totalQuotaBytes),
    usagePercent: parseFloat(usagePercent.toFixed(1)),
    isNearingLimit,
    recommendation,
    promptMessage
  };
}

/**
 * Native File System Access API helper: Mounts a real local OS directory
 */
export async function mountSovereignLocalFolder(): Promise<{ success: boolean; folderName?: string; error?: string }> {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
    return {
      success: false,
      error: 'File System Access API is not supported on this browser. Use WebDAV or Export ZIP instead.'
    };
  }

  try {
    // @ts-ignore - native browser API
    const dirHandle = await (window as any).showDirectoryPicker({
      id: 'library-companion-vault',
      mode: 'readwrite',
      startIn: 'documents'
    });
    return {
      success: true,
      folderName: dirHandle.name
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'User cancelled folder selection.' };
    }
    return { success: false, error: err.message || 'Failed to mount folder.' };
  }
}
