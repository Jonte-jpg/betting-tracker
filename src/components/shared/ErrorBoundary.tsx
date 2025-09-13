import React, { Component, ReactNode } from 'react'
import type { ErrorInfo } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; error?: unknown }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">Ett fel inträffade</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kunde inte ladda applikationen korrekt. Testa följande:
            <br />• Ladda om sidan (Ctrl+R eller F5)
            <br />• Hård uppdatering / rensa cache (Ctrl+Shift+R eller Ctrl+F5)
            <br />• Om problemet kvarstår: stäng fliken och öppna sidan igen
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Försök igen
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
