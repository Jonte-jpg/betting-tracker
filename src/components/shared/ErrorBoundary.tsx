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
        <div className="p-6">
          <h2 className="text-lg font-semibold">Ett fel inträffade</h2>
          <p className="text-sm text-muted-foreground">Ladda om sidan eller rensa cache.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
