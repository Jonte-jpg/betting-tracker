import { Trophy } from 'lucide-react'
import { AuthButton } from '@/components/auth/AuthButton'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" aria-hidden />
          <span className="font-semibold text-lg">Betting Tracker</span>
        </div>
        <AuthButton />
      </div>
    </header>
  )
}