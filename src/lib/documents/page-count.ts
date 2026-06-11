export function countPdfPages(buffer: Buffer): number {
  const text = buffer.toString("latin1");
  const pageMatches = text.match(/\/Type\s*\/Page\b/g);
  const count = pageMatches?.length ?? 0;
  return Math.max(1, count);
}

export function countDocumentPages(buffer: Buffer, mimeType: string): number {
  if (mimeType === "application/pdf") {
    return countPdfPages(buffer);
  }
  return 1;
}
