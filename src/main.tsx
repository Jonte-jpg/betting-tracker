import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'
import FirebaseApp from './FirebaseApp'
import './styles/globals.css'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { TauriErrorBoundary } from './components/common/TauriErrorBoundary'
import { isTauri } from './runtime/env'

// Registrera Service Worker för PWA (produktion) och auto-reload vid uppdatering
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Om en ny worker är installerad och väntar, hoppa över väntan
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
        // När en uppdatering hittas, be den nya att ta över direkt
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
        // När kontrollern byts (ny SW tar över), ladda om
        navigator.serviceWorker.addEventListener('controllerchange', () => {
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