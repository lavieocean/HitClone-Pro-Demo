import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 React错误边界捕获到错误:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="max-w-2xl mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              ⚠️ 应用遇到错误
            </h1>
            <p className="text-gray-300 mb-6">
              很抱歉，应用运行时遇到了问题。请刷新页面重试。
            </p>
            
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-left mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">错误详情：</h3>
              <pre className="text-sm text-gray-400 overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="text-gray-300 cursor-pointer">查看堆栈跟踪</summary>
                  <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#DBFC53] hover:bg-[#c7e847] text-black font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl border border-gray-700 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary