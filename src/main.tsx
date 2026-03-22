import '@/styles/globals.css'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { useUIStore } from '@/store/useUIStore'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.settings.appearance.theme)

  useEffect(() => {
    const apply = (resolved: 'light' | 'dark') => {
      document.documentElement.setAttribute('data-theme', resolved)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolved)
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      apply(theme)
    }
  }, [theme])

  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
