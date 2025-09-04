import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import FirebaseApp from './FirebaseApp'
import './styles/globals.css'

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <FirebaseApp />
    <Toaster richColors position="top-center" />
  </React.StrictMode>
)