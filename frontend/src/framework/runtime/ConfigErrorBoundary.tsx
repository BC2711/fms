import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ConfigErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ConfigErrorBoundaryState {
  error: Error | null
}

export class ConfigErrorBoundary extends Component<ConfigErrorBoundaryProps, ConfigErrorBoundaryState> {
  state: ConfigErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ConfigErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) console.error('Configuration render error', error, errorInfo)
  }

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback !== undefined) return this.props.fallback

    if (import.meta.env.DEV) {
      return (
        <div role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-red-800">
          <strong>Configuration rendering failed.</strong>
          <pre className="mt-2 whitespace-pre-wrap text-sm">{this.state.error.message}</pre>
        </div>
      )
    }

    return <div hidden />
  }
}
