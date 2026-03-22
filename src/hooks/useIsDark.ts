import { useMediaQuery } from '@uidotdev/usehooks'
import { useUIStore } from '@/store/useUIStore'

export function useIsDark(): boolean {
  const theme = useUIStore((s) => s.settings.appearance.theme)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  if (theme === 'system') return systemDark
  return theme === 'dark'
}
