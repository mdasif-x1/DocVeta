/**
 * Format bytes into human-readable strings (e.g. 2.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Clean and truncate string for safe display
 */
export function truncateString(str: string, maxLength = 30): string {
  if (str.length <= maxLength) return str;
  const extIndex = str.lastIndexOf('.');
  if (extIndex > 0 && str.length - extIndex <= 6) {
    const ext = str.slice(extIndex);
    const name = str.slice(0, maxLength - ext.length - 3);
    return `${name}...${ext}`;
  }
  return `${str.slice(0, maxLength - 3)}...`;
}
