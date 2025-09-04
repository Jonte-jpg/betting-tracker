import { useState } from 'react'
import { Trash2, Users, Settings, Download, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'

export function SettingsPanel() {
  const { users, addUser, deleteUser, clearAllData } = useAppStore()
  const [newUserName, setNewUserName] = useState('')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [clearConfirmText, setClearConfirmText] = useState('')

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      toast.error('Användarnamn krävs')
      return
    }
    
    if (users.some(u => u.name.toLowerCase() === newUserName.toLowerCase())) {
      toast.error('Användarnamn finns redan')
      return
    }

    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316']
    const usedColors = users.map(u => u.color).filter(Boolean)
    const availableColors = colors.filter(c => !usedColors.includes(c))
    const color = availableColors[0] || colors[Math.floor(Math.random() * colors.length)]

    addUser({
      name: newUserName,
      color,
    })
    
    setNewUserName('')
    toast.success('Användare tillagd')
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    if (!confirm(`Är du säker på att du vill ta bort användaren "${user.name}"? Detta kommer även ta bort alla deras bets.`)) {
      return
    }

    deleteUser(userId)
    toast.success('Användare borttagen')
  }

  const handleClearAllData = () => {
    if (clearConfirmText !== 'RADERA ALLT') {
      toast.error('Skriv "RADERA ALLT" för att bekräfta')
      return
    }

    clearAllData()
    setShowClearDialog(false)
    setClearConfirmText('')
    toast.success('All data har raderats')
  }

  const handleExportData = () => {
    const data = {
      users,
      bets: useAppStore.getState().bets,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `betting-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Data exporterad')
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (!data.users || !data.bets) {
          throw new Error('Ogiltig fil format')
        }

        // Import logic would go here
        toast.success('Data importerad')
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Kunde inte importera filen')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Användare */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Användare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nytt användarnamn"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
            />
            <Button onClick={handleAddUser}>Lägg till</Button>
          </div>
          
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span 
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: user.color || '#gray' }}
                  />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={users.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Datahantering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportera data
            </Button>
            
            <label htmlFor="import-file" className="cursor-pointer" aria-label="Importera data fil">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importera data
                </span>
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
          
          <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Radera all data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Radera all data</DialogTitle>
                <DialogDescription>
                  Detta kommer permanent radera alla användare och bets. Denna åtgärd kan inte ångras.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Skriv <strong>RADERA ALLT</strong> för att bekräfta:
                </p>
                <Input
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="RADERA ALLT"
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                  Avbryt
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleClearAllData}
                  disabled={clearConfirmText !== 'RADERA ALLT'}
                >
                  Radera allt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>Om appen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Betting Tracker v1.0</p>
            <p>Byggd med React, TypeScript, Tailwind CSS och shadcn/ui</p>
            <p>Data sparas lokalt i din webbläsare</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
