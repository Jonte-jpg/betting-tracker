export const isTauri: boolean = typeof (window as any).__TAURI__ !== 'undefined'

export const isStandalonePWA: boolean =
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
  // iOS Safari
  ((navigator as unknown as { standalone?: boolean }).standalone === true)

export type RuntimeEnv = 'tauri' | 'pwa' | 'web'

let _runtime: RuntimeEnv = 'web'
if (isTauri) _runtime = 'tauri'
else if (isStandalonePWA) _runtime = 'pwa'
export const runtime: RuntimeEnv = _runtime
