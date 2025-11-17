import React, { useState, useEffect } from 'react'
import { Terminal, Eye, EyeOff, Trash2, Download, Copy } from 'lucide-react'

const DiagnosticConsole = ({ isVisible = false, onToggle }) => {
  const [logs, setLogs] = useState([])
  const [isCollecting, setIsCollecting] = useState(false)
  const [filter, setFilter] = useState('all') // all, error, warn, info, debug
  const [maxLogs] = useState(100)

  useEffect(() => {
    if (isCollecting) {
      startLogCollection()
    } else {
      stopLogCollection()
    }

    return () => stopLogCollection()
  }, [isCollecting])

  // 启动日志收集
  const startLogCollection = () => {
    // 保存原始console方法
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    }

    // 重写console方法来捕获日志
    const createLogInterceptor = (level, originalMethod) => {
      return (...args) => {
        // 调用原始方法
        originalMethod.apply(console, args)
        
        // 捕获到我们的日志系统
        addLog({
          level,
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: new Date().toISOString(),
          stack: level === 'error' ? new Error().stack : null
        })
      }
    }

    console.log = createLogInterceptor('info', originalConsole.log)
    console.warn = createLogInterceptor('warn', originalConsole.warn)
    console.error = createLogInterceptor('error', originalConsole.error)
    console.info = createLogInterceptor('info', originalConsole.info)
    console.debug = createLogInterceptor('debug', originalConsole.debug)

    // 监听未捕获的错误
    const errorHandler = (event) => {
      addLog({
        level: 'error',
        message: `未捕获的错误: ${event.error?.message || event.message}`,
        timestamp: new Date().toISOString(),
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno
      })
    }

    const rejectionHandler = (event) => {
      addLog({
        level: 'error',
        message: `未处理的Promise拒绝: ${event.reason}`,
        timestamp: new Date().toISOString(),
        stack: event.reason?.stack
      })
    }

    window.addEventListener('error', errorHandler)
    window.addEventListener('unhandledrejection', rejectionHandler)

    // 存储清理函数
    window._diagnosticCleanup = () => {
      console.log = originalConsole.log
      console.warn = originalConsole.warn
      console.error = originalConsole.error
      console.info = originalConsole.info
      console.debug = originalConsole.debug
      window.removeEventListener('error', errorHandler)
      window.removeEventListener('unhandledrejection', rejectionHandler)
    }
  }

  const stopLogCollection = () => {
    if (window._diagnosticCleanup) {
      window._diagnosticCleanup()
      delete window._diagnosticCleanup
    }
  }

  const addLog = (logEntry) => {
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, { ...logEntry, id: Date.now() + Math.random() }]
      // 限制日志数量
      return newLogs.slice(-maxLogs)
    })
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getFilteredLogs = () => {
    if (filter === 'all') return logs
    return logs.filter(log => log.level === filter)
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400'
      case 'warn': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      case 'debug': return 'text-gray-400'
      default: return 'text-gray-300'
    }
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'info': return 'ℹ️'
      case 'debug': return '🔍'
      default: return '📝'
    }
  }

  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: logs
    }

    const blob = new Blob([JSON.stringify(logData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hitclone-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyLogsToClipboard = async () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n')

    try {
      await navigator.clipboard.writeText(logText)
      addLog({
        level: 'info',
        message: '日志已复制到剪贴板',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      addLog({
        level: 'error',
        message: '复制失败: ' + error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  if (!isVisible) {
    return null
  }

  const filteredLogs = getFilteredLogs()

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      {/* 控制台头部 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="font-medium text-white text-sm">诊断控制台</span>
          <span className="text-xs text-gray-400">
            ({filteredLogs.length}/{logs.length})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 日志级别过滤 */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300"
          >
            <option value="all">全部</option>
            <option value="error">错误</option>
            <option value="warn">警告</option>
            <option value="info">信息</option>
            <option value="debug">调试</option>
          </select>

          {/* 收集开关 */}
          <button
            onClick={() => setIsCollecting(!isCollecting)}
            className={`p-1 rounded text-xs transition-colors ${
              isCollecting 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={isCollecting ? '停止收集' : '开始收集'}
          >
            {isCollecting ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* 工具按钮 */}
          <button
            onClick={copyLogsToClipboard}
            className="p-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
            title="复制日志"
          >
            <Copy className="w-3 h-3" />
          </button>
          
          <button
            onClick={exportLogs}
            className="p-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
            title="导出日志"
          >
            <Download className="w-3 h-3" />
          </button>
          
          <button
            onClick={clearLogs}
            className="p-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
            title="清空日志"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 日志内容 */}
      <div className="h-64 overflow-y-auto bg-black p-2 text-xs font-mono">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {isCollecting ? '等待日志输出...' : '点击收集按钮开始捕获日志'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 hover:bg-gray-800/50 p-1 rounded">
                <span className="text-gray-500 text-xs flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex-shrink-0">
                  {getLevelIcon(log.level)}
                </span>
                <div className={`flex-1 ${getLevelColor(log.level)}`}>
                  <div className="break-words">
                    {log.message}
                  </div>
                  {log.stack && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-400">
                        堆栈追踪
                      </summary>
                      <pre className="text-gray-600 text-xs mt-1 pl-2 border-l-2 border-gray-700">
                        {log.stack}
                      </pre>
                    </details>
                  )}
                  {log.filename && (
                    <div className="text-gray-500 text-xs mt-1">
                      📁 {log.filename}:{log.lineno}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between p-2 border-t border-gray-700 bg-gray-800 text-xs">
        <div className="flex items-center space-x-4 text-gray-400">
          <span>
            错误: {logs.filter(l => l.level === 'error').length}
          </span>
          <span>
            警告: {logs.filter(l => l.level === 'warn').length}
          </span>
          <span>
            信息: {logs.filter(l => l.level === 'info').length}
          </span>
        </div>
        
        <div className="text-gray-500">
          {isCollecting && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>实时收集中</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiagnosticConsole