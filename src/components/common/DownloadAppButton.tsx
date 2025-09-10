import React from 'react'
import { isTauri } from '@/runtime/env'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

type Props = Readonly<{
  hrefMsi?: string
  hrefExe?: string
  label?: string
  alwaysShow?: boolean
  preferMsi?: boolean
}>

export function DownloadAppButton({ hrefMsi = '/downloads/BettingTracker_x64.msi', hrefExe = '/downloads/BettingTracker_x64.exe', label = 'Ladda ner (Windows)', alwaysShow = false, preferMsi = true }: Props) {
  const getInitialHref = () => {
    if (!alwaysShow) return null
    if (preferMsi) return hrefMsi || hrefExe
    return hrefExe || hrefMsi
  }
  const [href, setHref] = React.useState<string | null>(getInitialHref())

  React.useEffect(() => {
    if (alwaysShow) return
    let active = true
    // Prefer MSI if preferMsi=true, otherwise EXE; hide if neither exists
    Promise.allSettled([
      fetch(hrefExe, { method: 'HEAD' }),
      fetch(hrefMsi, { method: 'HEAD' }),
    ])
      .then((results) => {
        if (!active) return
        const [exeRes, msiRes] = results
        const isBin = (r: Response) => /application\/octet-stream/i.test(r.headers.get('content-type') || '')
        const exeOk = exeRes.status === 'fulfilled' && exeRes.value.ok && isBin(exeRes.value)
        const msiOk = msiRes.status === 'fulfilled' && msiRes.value.ok && isBin(msiRes.value)
        
        if (preferMsi) {
          if (msiOk) setHref(hrefMsi)
          else if (exeOk) setHref(hrefExe)
          else setHref(null)
        } else if (exeOk) {
          setHref(hrefExe)
        } else if (msiOk) {
          setHref(hrefMsi)
        } else {
          setHref(null)
        }
      })
      .catch(() => {
        if (!active) return
        setHref(null)
      })
    return () => {
      active = false
    }
  }, [hrefExe, hrefMsi, alwaysShow, preferMsi])

  if (isTauri) return null
  if (!href) return null
  return (
    <a href={href} download>
      <Button size="sm" variant="outline" className="whitespace-nowrap flex items-center gap-2">
        <Download className="h-4 w-4" />
        {label}
      </Button>
    </a>
  )
}

export default DownloadAppButton
