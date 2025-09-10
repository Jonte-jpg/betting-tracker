import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { LogIn, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AuthButton() {
  const { user, userProfile, loading, loginWithGoogle, logout } = useAuth()

  if (loading) {
    return (
      <Button disabled variant="outline">
        Laddar...
      </Button>
    )
  }

  if (user && userProfile) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{userProfile.displayName}</p>
            <p className="text-xs text-muted-foreground">{userProfile.email}</p>
          </div>
        </div>
        <Button onClick={logout} variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Logga ut
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={loginWithGoogle} variant="default">
      <LogIn className="h-4 w-4 mr-2" />
      Logga in med Google
    </Button>
  )
}
