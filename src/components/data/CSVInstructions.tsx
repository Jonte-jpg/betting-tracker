import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'

export function CSVInstructions() {
  const handleDownloadExample = () => {
    const link = document.createElement('a')
    link.href = '/example-bet365.csv'
    link.download = 'example-bet365.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <FileText className="h-5 w-5" />
          CSV-format hjälp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-blue-700">
          För att importera bets från andra bookmakers, använd CSV-format med följande kolumner:
        </p>
        <div className="text-xs font-mono bg-white p-2 rounded border">
          Date, Event, Market, Odds, Stake, Result, Payout
        </div>
        <Button 
          onClick={handleDownloadExample}
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Ladda ner exempel-fil
        </Button>
      </CardContent>
    </Card>
  )
}
