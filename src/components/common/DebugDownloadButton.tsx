import React from 'react'
import { Button } from '@/components/ui/button'
import { Download, AlertTriangle } from 'lucide-react'

export function DebugDownloadButton() {
  const [debugInfo, setDebugInfo] = React.useState<string>('')

  const testDownload = async () => {
    try {
      const response = await fetch('/downloads/BettingTracker_x64.exe', { method: 'HEAD' })
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      
      setDebugInfo(`
Status: ${response.status}
Content-Type: ${contentType}
Content-Length: ${contentLength}
URL: ${response.url}
      `.trim())
    } catch (error) {
      setDebugInfo(`Fel: ${error}`)
    }
  }

  return (
    <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg">
      <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Debug: Desktop App Download
      </h3>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <a href="/downloads/BettingTracker_x64.exe" download>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Försök ladda ner EXE
            </Button>
          </a>
          
          <a href="/downloads/BettingTracker_x64.msi" download>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Försök ladda ner MSI
            </Button>
          </a>
          
          <Button size="sm" variant="secondary" onClick={testDownload}>
            Testa HEAD Request
          </Button>
        </div>
        
        {debugInfo && (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {debugInfo}
          </pre>
        )}
        
        <p className="text-sm text-yellow-700">
          <strong>OBS:</strong> Knapparna ovan fungerar bara om du har lagt faktiska .exe/.msi filer i{' '}
          <code className="bg-yellow-100 px-1 rounded">public/downloads/</code>{' '}
          och deplocat.
        </p>
      </div>
    </div>
  )
}

export default DebugDownloadButton
