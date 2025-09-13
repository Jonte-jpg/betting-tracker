import React from 'react'

const DownloadAppButton = React.lazy(() => import('./DownloadAppButton'))

export function LazyDownloadAppButton() {
  return (
    <React.Suspense fallback={<div className="text-xs text-muted-foreground">Laddar nedladdning...</div>}>
      <DownloadAppButton />
    </React.Suspense>
  )
}

export default LazyDownloadAppButton
