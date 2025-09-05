import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts/ThemeProvider'
import FirebaseApp from './FirebaseApp'
import './styles/globals.css'

// Registrera Service Worker för PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="betting-tracker-theme">
      <FirebaseApp />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  </React.StrictMode>
)