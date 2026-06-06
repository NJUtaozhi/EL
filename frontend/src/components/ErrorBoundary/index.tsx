import { Component, type ReactNode } from 'react'
import { RefreshIcon } from 'tdesign-icons-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * 全局错误边界
 * 捕获渲染错误，显示友好提示而非白屏
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: 24,
            textAlign: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 56 }}>😵</span>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>页面出错了</h2>
          <p style={{ fontSize: 13, color: 'var(--text-light)', maxWidth: 280 }}>
            {this.state.error?.message || '发生了未知错误，请刷新重试'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 24px',
              borderRadius: 9999,
              background: 'var(--color-secondary)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            <RefreshIcon size="16px" /> 重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
