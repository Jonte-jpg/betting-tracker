import React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { isTauri } from '@/runtime/env'

// Helper to check if a download exists with binary content-type
async function headOk(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && Boolean(
      contentType?.includes('application/octet-stream') ||
      contentType?.includes('application/x-msi') ||
      contentType?.includes('application/x-msdownload')
    )
  } catch {
    return false
  }
}

interface DownloadAppButtonProps {
  readonly preferMsi?: boolean
}

export function DownloadAppButton({ preferMsi = true }: DownloadAppButtonProps) {
  const [hasMsi, setHasMsi] = React.useState(false)
  const [hasExe, setHasExe] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    Promise.all([
      headOk('/downloads/BettingTracker_x64.msi'),
      headOk('/downloads/BettingTracker_x64.exe'),
    ]).then(([msi, exe]) => {
      if (!active) return
      setHasMsi(msi)
      setHasExe(exe)
      setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  if (isTauri || isLoading || (!hasMsi && !hasExe)) {
    return null
  }

  // Determine download URL with clear logic
  let downloadUrl: string | null = null
  if (preferMsi && hasMsi) {
    downloadUrl = '/downloads/BettingTracker_x64.msi'
  } else if (hasExe) {
    downloadUrl = '/downloads/BettingTracker_x64.exe'
  } else if (hasMsi) {
    downloadUrl = '/downloads/BettingTracker_x64.msi'
  }

  const fileType = downloadUrl?.includes('.msi') ? 'MSI' : 'EXE'

  if (!downloadUrl) return null

  return (
    <a href={downloadUrl} download>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Ladda ner {fileType}
      </Button>
    </a>
  )
}

export default DownloadAppButton
