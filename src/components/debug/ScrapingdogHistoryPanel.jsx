import React, { useState, useEffect } from 'react'
import { History, Clock, Server, AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import youTubeDataService from '../../services/youTubeDataService'

const ScrapingdogHistoryPanel = ({ isOpen, onToggle }) => {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // 刷新API调用历史
  const refreshHistory = () => {
    setIsLoading(true)
    try {
      const apiHistory = youTubeDataService.getApiCallHistory(20)
      setHistory(apiHistory)
      console.log('📋 刷新Scrapingdog调用历史:', apiHistory.length, '条记录')
      console.log('🔍 历史记录详情:', apiHistory)
      
      // 显示最新的API调用状态
      if (apiHistory.length > 0) {
        const latest = apiHistory[0]
        console.log('📝 最新调用:', {
          id: latest.id,
          videoId: latest.videoId,
          status: latest.status,
          timeAgo: latest.timeAgo
        })
      }
    } catch (error) {
      console.error('刷新历史失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 自动刷新
  useEffect(() => {
    if (isOpen) {
      refreshHistory()
      const interval = setInterval(refreshHistory, 3000) // 每3秒自动刷新
      return () => clearInterval(interval)
    }
  }, [isOpen])

  // 清除历史
  const clearHistory = () => {
    youTubeDataService.clearApiHistory()
    setHistory([])
    console.log('🧹 已清除Scrapingdog调用历史')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'no_transcript': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'pending': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-900/20 border-green-700/50'
      case 'error': return 'bg-red-900/20 border-red-700/50'
      case 'no_transcript': return 'bg-yellow-900/20 border-yellow-700/50'
      case 'pending': return 'bg-blue-900/20 border-blue-700/50'
      default: return 'bg-gray-900/20 border-gray-700/50'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-4 bg-purple-800 hover:bg-purple-700 border border-purple-600 rounded-full p-3 shadow-lg transition-all duration-200 z-50"
        title="Scrapingdog API调用历史"
      >
        <History className="w-5 h-5 text-purple-200" />
        {history.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {history.length > 99 ? '99+' : history.length}
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-96 max-h-96 overflow-hidden z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-purple-400" />
          <h3 className="font-medium text-white">Scrapingdog API调用历史</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshHistory}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-80">
        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-700/50 rounded p-2">
            <div className="text-gray-400">总调用次数</div>
            <div className="text-white font-mono">{history.length}</div>
          </div>
          <div className="bg-gray-700/50 rounded p-2">
            <div className="text-gray-400">成功率</div>
            <div className="text-white font-mono">
              {history.length > 0 
                ? `${Math.round((history.filter(h => h.status === 'success').length / history.length) * 100)}%`
                : '0%'
              }
            </div>
          </div>
        </div>

        {/* API调用列表 */}
        {history.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>暂无API调用记录</div>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((record) => (
              <div
                key={record.id}
                className={`p-3 rounded-lg border ${getStatusColor(record.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(record.status)}
                    <span className="text-sm font-medium text-white">
                      {record.videoId}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{record.timeAgo}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-300 space-y-1">
                  <div className="flex justify-between">
                    <span>状态:</span>
                    <span>{record.statusDisplay}</span>
                  </div>
                  
                  {record.duration && (
                    <div className="flex justify-between">
                      <span>耗时:</span>
                      <span className="font-mono">{record.durationDisplay}</span>
                    </div>
                  )}
                  
                  {record.httpStatus && (
                    <div className="flex justify-between">
                      <span>HTTP状态:</span>
                      <span className="font-mono">{record.httpStatus}</span>
                    </div>
                  )}
                  
                  {record.transcriptLength && (
                    <div className="flex justify-between">
                      <span>字幕条数:</span>
                      <span className="font-mono">{record.transcriptLength}</span>
                    </div>
                  )}
                  
                  {record.responseSize && (
                    <div className="flex justify-between">
                      <span>响应大小:</span>
                      <span className="font-mono">{record.responseSize} bytes</span>
                    </div>
                  )}
                  
                  {record.error && (
                    <div className="mt-2 p-2 bg-red-900/30 rounded text-red-300 text-xs break-all">
                      {record.error}
                    </div>
                  )}
                </div>

                {/* API URL (可选显示) */}
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    查看API URL
                  </summary>
                  <div className="mt-1 p-2 bg-gray-900/50 rounded text-xs text-gray-400 break-all font-mono">
                    {record.url}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-gray-700">
            <button
              onClick={clearHistory}
              className="w-full p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
            >
              清除调用历史
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScrapingdogHistoryPanel