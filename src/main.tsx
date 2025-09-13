import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster, toast } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'
import FirebaseApp from './FirebaseApp'
import './styles/globals.css'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { TauriErrorBoundary } from './components/common/TauriErrorBoundary'
import { isTauri } from './runtime/env'

// Typing for build-time injected constants (vite define)
declare const __APP_VERSION__: string
declare const __APP_BUILD_TIME__: string

// Registrera Service Worker för PWA (produktion) och auto-reload vid uppdatering
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        const logPrefix = '[SW]'
        console.log(logPrefix, 'registered. Scope:', reg.scope)

        // Show build info once (helps diagnosing stale caches)
        console.log('[BUILD]', {
          version: __APP_VERSION__,
            buildTime: __APP_BUILD_TIME__,
            env: import.meta.env.MODE
        })

        const promptUserToRefresh = () => {
          // Avoid stacking multiple toasts
          toast.dismiss('sw-update')
          toast.info('Ny version tillgänglig', {
            id: 'sw-update',
            description: 'Klicka för att uppdatera',
            action: {
              label: 'Uppdatera',
              onClick: () => {
                // Trigger skip waiting then reload when controller changes
                if (reg.waiting) {
                  reg.waiting.postMessage({ type: 'SKIP_WAITING' })
                }
              }
            },
            duration: 10000
          })
        }

        if (reg.waiting) {
          console.log(logPrefix, 'found waiting service worker (post-refresh scenario)')
          promptUserToRefresh()
        }

        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          console.log(logPrefix, 'update found')
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log(logPrefix, 'new version installed – waiting to activate')
                promptUserToRefresh()
              } else {
                console.log(logPrefix, 'initial service worker installed')
              }
            }
          })
        })

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log(logPrefix, 'controller changed → reloading for fresh content')
          window.location.reload()
        })
      })
      .catch((err) => {
        console.log('SW registration failed: ', err)
      })
  })
}

const root = createRoot(document.getElementById('root')!)

// Wrap in appropriate error boundary based on environment
const AppWrapper = () => {
  if (isTauri) {
    return (
      <TauriErrorBoundary>
        <ErrorBoundary>
          <ThemeProvider defaultTheme="system" storageKey="betting-tracker-theme">
            <FirebaseApp />
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </ErrorBoundary>
      </TauriErrorBoundary>
    )
  }
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="betting-tracker-theme">
        <FirebaseApp />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
)