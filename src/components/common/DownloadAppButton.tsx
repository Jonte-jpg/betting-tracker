import React from 'react'
import { isTauri } from '@/runtime/env'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

type Props = Readonly<{
  href?: string
  label?: string
}>

export function DownloadAppButton({ href = '/downloads/BettingTracker_x64.msi', label = 'Ladda ner (Windows)' }: Props) {
  if (isTauri) return null
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
