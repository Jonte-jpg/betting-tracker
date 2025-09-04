import { Trophy } from 'lucide-react'
import { AuthButton } from '@/components/auth/AuthButton'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" aria-hidden />
          <span className="font-bold text-xl font-sans bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Betting Tracker
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}