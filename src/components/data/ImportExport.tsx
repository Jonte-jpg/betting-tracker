import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'sonner'
import { 
  Download, 
  Upload, 
  FileJson, 
  Database, 
  AlertTriangle,
  FileSpreadsheet,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import Papa from 'papaparse'

export function ImportExport() {
  const { exportJSON, importJSON, bets, users, resetAll, clearAllData } = useAppStore()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleExportJSON = () => {
    try {
      const data = exportJSON()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `betting-tracker-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Save backup date to localStorage
      localStorage.setItem('lastBackupDate', new Date().toISOString())
      
      toast.success('Data exporterad som JSON')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Kunde inte exportera data')
    }
  }
  
  const handleExportCSV = () => {
    try {
      const csvData = bets.map(bet => {
        const user = users.find(u => u.id === bet.userId)
        let faktiskVinst = 0
        if (bet.result === 'won') {
          faktiskVinst = bet.stake * (bet.odds - 1)
        } else if (bet.result === 'lost') {
          faktiskVinst = -bet.stake
        }
        
        return {
          'Datum': format(new Date(bet.date), 'yyyy-MM-dd HH:mm'),
          'Användare': user?.name || 'Okänd',
          'Event': bet.event,
          'Insats': bet.stake,
          'Odds': bet.odds,
          'Resultat': bet.result,
          'Potentiell vinst': bet.result === 'won' ? bet.stake * (bet.odds - 1) : 0,
          'Faktisk vinst': faktiskVinst
        }
      })
      
      const csv = Papa.unparse(csvData, {
        delimiter: ';',
        header: true
      })
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `betting-tracker-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exporterad som CSV')
    } catch (error) {
      console.error('CSV Export error:', error)
      toast.error('Kunde inte exportera CSV')
    }
  }
  
  const handleImportJSON = useCallback((files: File[]) => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    const file = files[0]
    
    if (!file.name.endsWith('.json')) {
      toast.error('Endast JSON-filer är tillåtna')
      setIsProcessing(false)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        importJSON(content)
        toast.success('Data importerad framgångsrikt!')
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Kunde inte importera data. Kontrollera att filen är korrekt formaterad.')
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsText(file)
  }, [importJSON])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImportJSON,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  })
  
  const handleResetData = () => {
    if (window.confirm('Är du säker på att du vill återställa all data till standardvärden? Detta kan inte ångras.')) {
      resetAll()
      toast.success('Data återställd till standardvärden')
    }
  }
  
  const handleClearAllData = () => {
    if (window.confirm('Är du säker på att du vill radera ALL data? Detta kan inte ångras.')) {
      if (window.confirm('VARNING: Detta kommer att radera alla användare och bets permanent. Är du helt säker?')) {
        clearAllData()
        toast.success('All data raderad')
      }
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportera Data
            </CardTitle>
            <CardDescription>
              Ladda ner din betting-data som backup eller för analys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExportJSON} 
              className="w-full"
              variant="outline"
            >
              <FileJson className="mr-2 h-4 w-4" />
              Exportera som JSON
            </Button>
            <Button 
              onClick={handleExportCSV} 
              className="w-full"
              variant="outline"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportera som CSV
            </Button>
            <div className="text-sm text-muted-foreground">
              <p><strong>JSON:</strong> Komplett backup med alla inställningar</p>
              <p><strong>CSV:</strong> Enkel tabellfil för analys i Excel</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importera Data
            </CardTitle>
            <CardDescription>
              Återställ data från en tidigare backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }
                ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <FileJson className="mx-auto h-12 w-12 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-primary">Släpp filen här...</p>
                ) : (
                  <div>
                    <p className="font-medium">Dra & släpp JSON-fil här</p>
                    <p className="text-sm text-muted-foreground">eller klicka för att välja fil</p>
                  </div>
                )}
              </div>
            </div>
            {isProcessing && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">Bearbetar fil...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Current Data Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Aktuell Data
          </CardTitle>
          <CardDescription>
            Översikt över din befintliga data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">Användare</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{bets.length}</div>
              <div className="text-sm text-muted-foreground">Totala bets</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {bets.reduce((sum, bet) => sum + bet.stake, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total insats</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Farlig Zon
          </CardTitle>
          <CardDescription>
            Irreversibla åtgärder - var försiktig!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleResetData}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Database className="mr-2 h-4 w-4" />
              Återställ till standarddata
            </Button>
            <Button 
              onClick={handleClearAllData}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Radera all data
            </Button>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Återställ:</strong> Återgår till de ursprungliga demo-användarna och bets</p>
            <p><strong>Radera:</strong> Tar bort ALLT - användare, bets och inställningar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
