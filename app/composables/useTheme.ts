export function useTheme() {
  const theme = useState<'dark' | 'light'>('theme', () => 'dark')

  function applyTheme(t: 'dark' | 'light') {
    theme.value = t
    if (import.meta.client) {
      document.documentElement.classList.toggle('light', t === 'light')
      localStorage.setItem('theme', t)
    }
  }

  function initTheme() {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      applyTheme(saved === 'light' ? 'light' : 'dark')
    }
  }

  return { theme, applyTheme, initTheme }
}
