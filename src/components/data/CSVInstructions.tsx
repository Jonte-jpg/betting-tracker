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
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              🎯 Två sätt att importera:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">1.</span>
                <div>
                  <span className="font-medium">Standard CSV:</span>
                  <span className="text-blue-800 dark:text-blue-200"> Exportera CSV direkt från Bet365</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium">2.</span>
                <div>
                  <span className="font-medium">PDF → Tabula:</span>
                  <span className="text-green-800 dark:text-green-200"> PDF från Bet365 → tabula.technology → importera här</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Standard CSV-format:</strong>
            </p>
            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded border">
              Date, Event, Market, Odds, Stake, Result, Payout
            </div>
          </div>
          
          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
            <strong>💡 Tips:</strong> Vår app konverterar automatiskt Tabula-format till rätt struktur!
          </div>
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
