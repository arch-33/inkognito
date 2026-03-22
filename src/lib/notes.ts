export function getWordCount(content: string): number {
  return content.trim().split(/\s+/).filter((w) => w.length > 0).length
}

export function getNoteTitle(content: string): string {
  return content.split('\n')[0]?.replace(/^#+\s*/, '') || 'Untitled'
}
