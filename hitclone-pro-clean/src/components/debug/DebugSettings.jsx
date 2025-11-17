import React, { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, Terminal, Activity, RefreshCw } from 'lucide-react'
import SystemHealthPanel from './SystemHealthPanel'
import DiagnosticConsole from './DiagnosticConsole'
import apiGuard from '../../utils/apiGuard'

const DebugSettings = () => {
  const [debugMode, setDebugMode] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [showHealthPanel, setShowHealthPanel] = useState(false)
  const [settings, setSettings] = useState({
    autoHealthCheck: true,
    logLevel: 'info',
    apiWarnings: true,
    dataFlowTracking: true
  })

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('hitclone-debug-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        setDebugMode(parsed.debugMode || false)
      } catch (error) {
        console.warn('加载调试设置失败:', error)
      }
    }
  }, [])

  // 保存设置到localStorage
  const saveSettings = (newSettings) => {
    const settingsToSave = { ...newSettings, debugMode }
    setSettings(newSettings)
    localStorage.setItem('hitclone-debug-settings', JSON.stringify(settingsToSave))
  }

  const resetApiSession = () => {
    apiGuard.resetSession()
    alert('API会话已重置')
  }

  const clearAllStorage = () => {
    if (confirm('确定要清空所有本地数据吗？包括历史记录、缓存和调试日志。')) {
      localStorage.clear()
      sessionStorage.clear()
      alert('所有本地数据已清空，建议刷新页面')
    }
  }

  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      apiGuardHistory: apiGuard.getCallHistory(50),
      apiUsageStats: apiGuard.getUsageStats(),
      settings: settings
    }

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hitclone-debug-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">开发者设置</h1>
        </div>

        {/* 调试模式开关 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">调试模式</h2>
              <p className="text-gray-400">启用调试功能和详细日志</p>
            </div>
            <button
              onClick={() => {
                setDebugMode(!debugMode)
                saveSettings({ ...settings, debugMode: !debugMode })
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                debugMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  debugMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {debugMode && (
            <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.autoHealthCheck}
                    onChange={(e) => saveSettings({ ...settings, autoHealthCheck: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">自动健康检查</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.apiWarnings}
                    onChange={(e) => saveSettings({ ...settings, apiWarnings: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">API预算警告</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.dataFlowTracking}
                    onChange={(e) => saveSettings({ ...settings, dataFlowTracking: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">数据流追踪</span>
                </label>

                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-300">日志级别:</label>
                  <select
                    value={settings.logLevel}
                    onChange={(e) => saveSettings({ ...settings, logLevel: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 text-sm"
                  >
                    <option value="debug">调试</option>
                    <option value="info">信息</option>
                    <option value="warn">警告</option>
                    <option value="error">错误</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 调试工具 */}
        {debugMode && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">调试工具</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowHealthPanel(!showHealthPanel)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  showHealthPanel 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Activity className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">系统健康</div>
              </button>

              <button
                onClick={() => setShowConsole(!showConsole)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  showConsole 
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Terminal className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">调试控制台</div>
              </button>

              <button
                onClick={resetApiSession}
                className="p-4 rounded-lg border-2 border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 transition-all duration-200"
              >
                <RefreshCw className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">重置API会话</div>
              </button>

              <button
                onClick={exportDebugData}
                className="p-4 rounded-lg border-2 border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 transition-all duration-200"
              >
                <Settings className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">导出调试数据</div>
              </button>
            </div>
          </div>
        )}

        {/* API统计 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">API使用统计</h2>
          
          <ApiUsageDisplay />
        </div>

        {/* 系统信息 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">系统信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">用户代理</div>
              <div className="text-gray-300 font-mono text-xs break-all">
                {navigator.userAgent}
              </div>
            </div>
            <div>
              <div className="text-gray-400">页面URL</div>
              <div className="text-gray-300 font-mono text-xs break-all">
                {window.location.href}
              </div>
            </div>
            <div>
              <div className="text-gray-400">本地存储使用</div>
              <div className="text-gray-300">
                {Object.keys(localStorage).length} 个键
              </div>
            </div>
            <div>
              <div className="text-gray-400">会话存储使用</div>
              <div className="text-gray-300">
                {Object.keys(sessionStorage).length} 个键
              </div>
            </div>
          </div>
        </div>

        {/* 危险操作 */}
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">危险操作</h2>
          
          <div className="space-y-3">
            <button
              onClick={clearAllStorage}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              清空所有本地数据
            </button>
            <p className="text-sm text-gray-400">
              这将删除所有历史记录、缓存和设置，操作不可撤销
            </p>
          </div>
        </div>
      </div>

      {/* 调试面板 */}
      {debugMode && showHealthPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">系统健康面板</h3>
              <button
                onClick={() => setShowHealthPanel(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <SystemHealthPanel isOpen={true} onToggle={() => setShowHealthPanel(false)} />
          </div>
        </div>
      )}

      {/* 调试控制台 */}
      {debugMode && showConsole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">调试控制台</h3>
              <button
                onClick={() => setShowConsole(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <DiagnosticConsole isVisible={true} onToggle={() => setShowConsole(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

// API使用情况显示组件
const ApiUsageDisplay = () => {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    updateStats()
    const interval = setInterval(updateStats, 5000) // 每5秒更新一次
    return () => clearInterval(interval)
  }, [])

  const updateStats = () => {
    setStats(apiGuard.getUsageStats())
    setHistory(apiGuard.getCallHistory(10))
  }

  if (!stats) return <div className="text-gray-400">加载中...</div>

  return (
    <div className="space-y-4">
      {/* 使用概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">已使用</div>
          <div className="text-lg font-semibold text-white">{stats.current}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">总预算</div>
          <div className="text-lg font-semibold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">剩余</div>
          <div className="text-lg font-semibold text-green-400">{stats.remaining}</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">使用率</div>
          <div className={`text-lg font-semibold ${
            stats.status === 'critical' ? 'text-red-400' :
            stats.status === 'warning' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {stats.percentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 使用进度条 */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>API预算使用情况</span>
          <span>{stats.callCount} 次调用，{stats.failedCalls} 次失败</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              stats.status === 'critical' ? 'bg-red-400' :
              stats.status === 'warning' ? 'bg-yellow-400' : 'bg-green-400'
            }`}
            style={{ width: `${Math.min(100, stats.percentage)}%` }}
          />
        </div>
      </div>

      {/* 调用历史 */}
      {history.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-300 mb-2">最近调用记录</div>
          <div className="space-y-1">
            {history.map((call) => (
              <div key={call.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{call.type}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">{call.timeAgo}</span>
                  <span className={call.success ? 'text-green-400' : 'text-red-400'}>
                    {call.success ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DebugSettings