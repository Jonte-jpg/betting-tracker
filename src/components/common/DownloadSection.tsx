import React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { isTauri } from '@/runtime/env'

function isBinaryContentType(ct: string | null): boolean {
  if (!ct) return false
  return /application\/octet-stream/i.test(ct)
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    const ct = res.headers.get('content-type')
    return res.ok && isBinaryContentType(ct)
  } catch {
    return false
  }
}

export function DownloadSection() {
  const [hasMsi, setHasMsi] = React.useState(false)
  const [hasExe, setHasExe] = React.useState(false)

  React.useEffect(() => {
    let active = true
    Promise.all([
      headOk('/downloads/BettingTracker_x64.msi'),
      headOk('/downloads/BettingTracker_x64.exe'),
    ]).then(([msi, exe]) => {
      if (!active) return
      setHasMsi(msi)
      setHasExe(exe)
    })
    return () => {
      active = false
    }
  }, [])

  if (isTauri) return null
  if (!hasMsi && !hasExe) return null

  return (
    <section className="mx-auto max-w-3xl w-full">
      <div className="rounded-lg border p-4 bg-muted/40">
        <h2 className="text-lg font-semibold mb-2">Ladda ner skrivbordsapp</h2>
        <p className="text-sm text-muted-foreground mb-3">MSI-installationsfil för Windows (rekommenderat).</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {hasMsi && (
            <a href="/downloads/BettingTracker_x64.msi" download>
              <Button className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" /> Ladda ner MSI (x64)
              </Button>
            </a>
          )}
          {hasExe && (
            <a href="/downloads/BettingTracker_x64.exe" download>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" /> Ladda ner EXE (x64)
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export default DownloadSection
