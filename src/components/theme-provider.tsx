import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { FunctionOnce } from '@/components/function-once'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const isBrowser = typeof window !== 'undefined'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () =>
      (isBrowser
        ? (localStorage.getItem(storageKey) as Theme | null)
        : defaultTheme) || defaultTheme,
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: (v: Theme) => {
        localStorage.setItem(storageKey, v)
        setTheme(v)
      },
    }),
    [],
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <FunctionOnce param={storageKey}>
        {(s) => {
          const t: string | null = localStorage.getItem(s)

          if (
            t === 'dark' ||
            ((t === null || t === 'system') &&
              window.matchMedia('(prefers-color-scheme: dark)').matches)
          ) {
            document.documentElement.classList.add('dark')
          }
        }}
      </FunctionOnce>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
