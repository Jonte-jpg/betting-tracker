import { differenceInDays } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function BackupReminder() {
  const lastBackup = localStorage.getItem('lastBackupDate')
  const daysSinceBackup = lastBackup 
    ? differenceInDays(new Date(), new Date(lastBackup))
    : 30 // Show reminder for new users

  // Only show if it's been 30+ days since last backup
  if (daysSinceBackup < 30) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">
              Dags för backup! Exportera din data för säkerhets skull.
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {lastBackup 
                ? `Senaste backup: ${daysSinceBackup} dagar sedan`
                : 'Du har inte gjort någon backup än'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
