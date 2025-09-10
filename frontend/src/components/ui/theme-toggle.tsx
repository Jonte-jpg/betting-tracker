import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="h-4 w-4" />
    if (theme === 'light') return <Sun className="h-4 w-4" />
    return <Sun className="h-4 w-4" /> // system default to sun
  }

  const getTooltip = () => {
    if (theme === 'light') return 'Växla till mörkt läge'
    if (theme === 'dark') return 'Växla till system'
    return 'Växla till ljust läge'
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      title={getTooltip()}
      className="h-9 w-9 p-0"
    >
      {getIcon()}
      <span className="sr-only">{getTooltip()}</span>
    </Button>
  )
}
