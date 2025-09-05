import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Zap, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { addBet } from '@/lib/firestore'
import { convertTabulaToStandardCSV } from '@/utils/tabulaConverter'
import type { FirebaseBet } from '@/types/Firebase'

type BetResult = 'pending' | 'won' | 'lost' | 'void'

interface Bet365Bet {
  event: string
  market: string
  odds: number
  stake: number
  result: BetResult
  bookmaker: string
  currency: string
  payout?: number
  placedDate: string
}

export function Bet365Import() {
  const { user } = useAuth()
  const [importedBets, setImportedBets] = useState<Bet365Bet[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Vänligen välj en CSV-fil')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const bets = parseBet365CSV(text)
        
        if (bets.length === 0) {
          toast.error('Inga giltiga bets hittades i filen')
          return
        }
        
        setImportedBets(bets)
        setPreviewMode(true)
        toast.success(`${bets.length} bets laddade från fil! Granska och importera.`)
      } catch (error) {
        console.error('CSV parsing error:', error)
        toast.error('Kunde inte läsa CSV-filen. Kontrollera formatet.')
      }
    }
    reader.readAsText(file, 'utf-8')
    
    // Reset file input
    event.target.value = ''
  }

  const handleImportBets = async () => {
    if (!user) {
      toast.error('Du måste vara inloggad för att importera bets')
      return
    }

    if (importedBets.length === 0) {
      toast.error('Inga bets att importera')
      return
    }

    setIsImporting(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const bet of importedBets) {
        try {
          const firebaseBet: Omit<FirebaseBet, 'id'> = {
            userId: user.uid,
            event: bet.event,
            market: bet.market,
            odds: bet.odds,
            stake: bet.stake,
            result: bet.result,
            bookmaker: bet.bookmaker,
            currency: bet.currency,
            payout: bet.payout,
            notes: `Importerad från Bet365 CSV (${new Date().toLocaleDateString('sv-SE')})`,
            tags: ['bet365', 'csv-import'],
            createdAt: bet.placedDate || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          await addBet(firebaseBet)
          successCount++
        } catch (error) {
          console.error(`Error importing bet: ${bet.event}`, error)
          errorCount++
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} bets importerade framgångsrikt!`)
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} bets kunde inte importeras`)
      }
      
      // Reset state
      setImportedBets([])
      setPreviewMode(false)
      
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Ett fel uppstod under importen')
    } finally {
      setIsImporting(false)
    }
  }

  const handleCancelPreview = () => {
    setImportedBets([])
    setPreviewMode(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Bet365 CSV Import
          <Badge variant="outline" className="text-green-600">Nytt!</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewMode ? (
          <>
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Så här exporterar du från Bet365:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Logga in på Bet365.com</li>
                    <li>Gå till &quot;Mina Konto&quot; → &quot;Betting History&quot;</li>
                    <li>Välj tidsperiod (t.ex. senaste månaden)</li>
                    <li>Klicka &quot;Download&quot; eller &quot;Export&quot; för CSV-format</li>
                    <li>Ladda upp filen här nedan</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* CSV Format Info */}
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">CSV-format som stöds:</p>
                  <p>Date, Event, Market, Odds, Stake, Result, Payout</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Filen kommer automatiskt att tolkas och formateras för din app.
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-lg font-medium text-gray-700 mb-1">
                  Välj CSV-fil från Bet365
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  Eller dra och släpp filen här
                </div>
                <Button variant="outline" className="pointer-events-none">
                  Bläddra efter fil
                </Button>
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </>
        ) : (
          <>
            {/* Preview Mode */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-green-600 flex items-center gap-2">
                  ✅ CSV-fil laddad
                </div>
                <Badge variant="secondary">{importedBets.length} bets</Badge>
              </div>
              
              {/* Preview av importerade bets */}
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Förhandsvisning:</h4>
                {importedBets.slice(0, 5).map((bet, index) => {
                  const getResultVariant = (result: string) => {
                    if (result === 'won') return 'default'
                    if (result === 'lost') return 'destructive'
                    return 'outline'
                  }
                  
                  const getResultText = (result: string) => {
                    if (result === 'won') return 'Vunnen'
                    if (result === 'lost') return 'Förlorad'
                    if (result === 'void') return 'Avbruten'
                    return 'Pågående'
                  }
                  
                  return (
                    <div key={`bet-preview-${bet.event}-${bet.stake}-${index}`} className="text-sm border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-gray-900">{bet.event}</div>
                        <Badge 
                          variant={getResultVariant(bet.result)}
                          className="text-xs"
                        >
                          {getResultText(bet.result)}
                        </Badge>
                      </div>
                      <div className="text-gray-600 text-xs">{bet.market}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs">Odds: {bet.odds}</span>
                        <span className="text-xs">Insats: {bet.stake} {bet.currency}</span>
                        {bet.payout && (
                          <span className="text-xs">Utbetalning: {bet.payout} {bet.currency}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {importedBets.length > 5 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    ...och {importedBets.length - 5} bets till
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleImportBets} 
                  disabled={isImporting}
                  className="flex-1"
                >
                  {isImporting ? 'Importerar...' : `Importera ${importedBets.length} bets`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelPreview}
                  disabled={isImporting}
                >
                  Avbryt
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function parseBet365CSV(csvText: string): Bet365Bet[] {
  const lines = csvText.trim().split('\n')
  
  if (lines.length < 2) {
    throw new Error('CSV-filen är tom eller har fel format')
  }

  // Check if this looks like Tabula format (has betting confirmation IDs and Swedish text)
  const isTabulaFormat = lines.some(line => 
    line.includes('Spelbekräftelse') || 
    line.includes('Vinnande') || 
    line.includes('Förlorande') ||
    /[A-Z]{2}\d{10}[A-Z]/.test(line) // Pattern like "PL3109675301I"
  )

  if (isTabulaFormat) {
    console.log('Detected Tabula format, converting...')
    try {
      const standardCSV = convertTabulaToStandardCSV(csvText)
      if (!standardCSV.trim()) {
        throw new Error('Ingen giltig betting-data hittades i Tabula-filen')
      }
      
      // Parse the converted CSV
      const convertedLines = standardCSV.trim().split('\n')
      return convertedLines.map((line, index) => {
        try {
          const columns = parseCSVLine(line)
          if (columns.length < 6) {
            throw new Error(`Konverterad rad har för få kolumner: ${line}`)
          }
          
          return {
            placedDate: columns[0] + 'T12:00:00.000Z', // Add time component
            event: columns[1]?.trim() || `Unknown Event ${index + 1}`,
            market: columns[2]?.trim() || 'Unknown Market',
            odds: parseFloat(columns[3]) || 1.0,
            stake: parseFloat(columns[4]) || 0,
            result: columns[5] as 'pending' | 'won' | 'lost' | 'void' || 'pending',
            payout: columns[6] ? parseFloat(columns[6]) : undefined,
            bookmaker: 'Bet365',
            currency: 'SEK'
          }
        } catch (error) {
          console.warn(`Error parsing converted Tabula row ${index + 1}:`, error)
          throw new Error(`Fel vid konvertering av rad ${index + 1}: ${error}`)
        }
      })
    } catch (error) {
      console.error('Tabula conversion failed:', error)
      throw new Error(`Kunde inte konvertera Tabula-format: ${error}`)
    }
  }

  // Original logic for standard CSV format
  // Skip header row
  const dataLines = lines.slice(1).filter(line => line.trim() !== '')
  
  return dataLines.map((line, index) => {
    try {
      // Handle CSV with potential commas in quoted fields
      const columns = parseCSVLine(line)
      
      // Try different CSV formats that Bet365 might use
      let bet: Bet365Bet
      
      if (columns.length >= 6) {
        // Standard format: Date, Event, Market, Odds, Stake, Result, [Payout]
        bet = {
          placedDate: parseDate(columns[0]) || new Date().toISOString(),
          event: columns[1]?.trim() || `Unknown Event ${index + 1}`,
          market: columns[2]?.trim() || 'Unknown Market',
          odds: parseFloat(columns[3]?.replace(',', '.')) || 1.0,
          stake: parseFloat(columns[4]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
          result: mapBet365Result(columns[5]),
          payout: columns[6] ? parseFloat(columns[6]?.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined,
          bookmaker: 'Bet365',
          currency: detectCurrency(columns[4]) || 'SEK'
        }
      } else {
        throw new Error(`Rad ${index + 2}: För få kolumner (${columns.length})`)
      }
      
      // Validate bet
      if (bet.odds <= 0 || bet.stake <= 0) {
        throw new Error(`Rad ${index + 2}: Ogiltiga odds eller insats`)
      }
      
      return bet
    } catch (error) {
      console.warn(`Kunde inte parsa rad ${index + 2}:`, error)
      throw error
    }
  }).filter(Boolean)
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result.map(col => col.replace(/^"(.*)"$/, '$1')) // Remove surrounding quotes
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null
  
  // Try different date formats
  const formats = [
    /(\d{4}-\d{2}-\d{2})/, // YYYY-MM-DD
    /(\d{2}\/\d{2}\/\d{4})/, // DD/MM/YYYY
    /(\d{2}-\d{2}-\d{4})/, // DD-MM-YYYY
  ]
  
  for (const format of formats) {
    const match = format.exec(dateStr)
    if (match) {
      const date = new Date(match[1])
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
  }
  
  return null
}

function mapBet365Result(result: string): 'pending' | 'won' | 'lost' | 'void' {
  if (!result) return 'pending'
  
  const resultLower = result.toLowerCase().trim()
  
  if (resultLower.includes('won') || resultLower.includes('win') || resultLower.includes('vunnen')) {
    return 'won'
  }
  if (resultLower.includes('lost') || resultLower.includes('lose') || resultLower.includes('förlorad')) {
    return 'lost'
  }
  if (resultLower.includes('void') || resultLower.includes('avbruten') || resultLower.includes('cancelled')) {
    return 'void'
  }
  if (resultLower.includes('pending') || resultLower.includes('open') || resultLower.includes('pågående')) {
    return 'pending'
  }
  
  return 'pending'
}

function detectCurrency(stakeStr: string): string {
  if (!stakeStr) return 'SEK'
  
  if (stakeStr.includes('€') || stakeStr.includes('EUR')) return 'EUR'
  if (stakeStr.includes('$') || stakeStr.includes('USD')) return 'USD'
  if (stakeStr.includes('£') || stakeStr.includes('GBP')) return 'GBP'
  if (stakeStr.includes('kr') || stakeStr.includes('SEK')) return 'SEK'
  if (stakeStr.includes('NOK')) return 'NOK'
  if (stakeStr.includes('DKK')) return 'DKK'
  
  return 'SEK' // Default to SEK
}
