import React from 'react'
import { isTauri } from '@/runtime/env'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

type Props = Readonly<{
  href?: string
  label?: string
  alwaysShow?: boolean
}>

export function DownloadAppButton({ href = '/downloads/BettingTracker_x64.msi', label = 'Ladda ner (Windows)', alwaysShow = false }: Props) {
  const [available, setAvailable] = React.useState(alwaysShow)

  React.useEffect(() => {
    if (alwaysShow) return
    let active = true
    // Check if the download exists to avoid showing a broken link
    fetch(href, { method: 'HEAD' })
      .then((res) => {
        if (!active) return
        setAvailable(res.ok)
      })
      .catch(() => {
        if (!active) return
        setAvailable(false)
      })
    return () => {
      active = false
    }
  }, [href, alwaysShow])

  if (isTauri) return null
  if (!available) return null
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
