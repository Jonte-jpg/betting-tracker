import React from 'react'
import { isTauri } from '@/runtime/env'
import { GitHubDownloadButton } from './GitHubDownloadButton'

export function DownloadSection() {
  if (isTauri) return null

  return (
    <section className="mx-auto max-w-3xl w-full">
      <div className="rounded-lg border p-4 bg-muted/40">
        <h2 className="text-lg font-semibold mb-2">Ladda ner skrivbordsapp</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Installera Betting Tracker som en native Windows-applikation för bästa prestanda och offline-stöd.
        </p>
        
        <GitHubDownloadButton />
        
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p><strong>Systemkrav:</strong> Windows 10 eller senare (64-bit)</p>
          <p><strong>Storlek:</strong> Cirka 15-20 MB nedladdning</p>
          <p><strong>Installation:</strong> Dubbelklicka på filen och följ installationsguiden</p>
        </div>
      </div>
    </section>
  )
}

export default DownloadSection
