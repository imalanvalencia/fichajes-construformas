/**
 * Triggers a browser download for the given blob under the provided filename.
 *
 * The object URL created for the download is revoked right after the
 * synthetic click, so no dangling URL is left behind.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
