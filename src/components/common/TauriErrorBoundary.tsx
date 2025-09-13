import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class TauriErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Tauri Error Boundary caught an error:', error, errorInfo)
    
    // Log to console for debugging in Tauri
  if ((window as unknown as { __TAURI__?: unknown }).__TAURI__) {
      console.error('Running in Tauri context')
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md p-6 bg-card border rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-destructive mb-4">
              Något gick fel
            </h2>
            <p className="text-muted-foreground mb-4">
              Appen stötte på ett oväntat fel. Detta kan bero på:
            </p>
            <ul className="text-sm text-muted-foreground mb-4 space-y-1">
              <li>• WebView2 Runtime saknas</li>
              <li>• Nätverksanslutning problem</li>
              <li>• Korrupt cache/data</li>
            </ul>
            
            {this.state.error && (
              <details className="mb-4">
                <summary className="text-sm font-medium cursor-pointer">
                  Teknisk information
                </summary>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Ladda om
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Rensa data & ladda om
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
