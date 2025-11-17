import React, { useState, useEffect } from 'react'

const AnalysisProgressEnhanced = ({ isAnalyzing, currentStep, totalSteps, stepDetails, onCancel }) => {
  const [logs, setLogs] = useState([])
  const [thinkingText, setThinkingText] = useState('')
  const [showThinking, setShowThinking] = useState(false)

  // 添加日志条目
  const addLog = (message, type = 'info', details = null) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, {
      id: Date.now(),
      timestamp,
      message,
      type, // 'info', 'success', 'warning', 'error'
      details
    }])
  }

  // 监听分析步骤变化
  useEffect(() => {
    if (stepDetails) {
      addLog(stepDetails.message, stepDetails.type, stepDetails.details)
      
      if (stepDetails.thinking) {
        setThinkingText(stepDetails.thinking)
        setShowThinking(true)
      }
    }
  }, [stepDetails])

  // 清空日志
  useEffect(() => {
    if (!isAnalyzing) {
      // 分析结束后3秒清空日志
      const timer = setTimeout(() => {
        setLogs([])
        setThinkingText('')
        setShowThinking(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isAnalyzing])

  // 获取步骤图标
  const getStepIcon = (step, current) => {
    if (step < current) return '✅'
    if (step === current) return '🔄'
    return '⭕'
  }

  // 获取日志图标
  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'api': return '🤖'
      case 'thinking': return '🧠'
      default: return 'ℹ️'
    }
  }

  if (!isAnalyzing && logs.length === 0) {
    return null
  }

  return (
    <div className="analysis-progress-overlay">
      <div className="progress-container">
        {/* 进度头部 */}
        <div className="progress-header">
          <div className="progress-title">
            <span className="title-icon">🔬</span>
            <h3>AI 视频分析进行中</h3>
            {onCancel && (
              <button className="cancel-btn" onClick={onCancel}>
                ✕
              </button>
            )}
          </div>
          
          {/* 整体进度条 */}
          <div className="overall-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              步骤 {currentStep} / {totalSteps}
            </div>
          </div>
        </div>

        {/* 分析步骤 */}
        <div className="analysis-steps">
          <div className="steps-list">
            {[
              '📄 解析SRT文件',
              '🤖 连接AI服务',
              '🧠 智能分析中',
              '📊 生成报告'
            ].map((stepName, index) => (
              <div 
                key={index}
                className={`step-item ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
              >
                <div className="step-icon">
                  {getStepIcon(index + 1, currentStep)}
                </div>
                <div className="step-content">
                  <div className="step-name">{stepName}</div>
                  {index + 1 === currentStep && (
                    <div className="step-status">正在处理...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI思考过程 */}
        {showThinking && thinkingText && (
          <div className="thinking-panel">
            <div className="thinking-header">
              <span className="thinking-icon">🧠</span>
              <span className="thinking-title">AI 思考过程</span>
              <button 
                className="thinking-toggle"
                onClick={() => setShowThinking(!showThinking)}
              >
                {showThinking ? '收起' : '展开'}
              </button>
            </div>
            <div className="thinking-content">
              <div className="thinking-text">
                {thinkingText}
              </div>
              <div className="thinking-animation">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        )}

        {/* 实时日志 */}
        <div className="analysis-logs">
          <div className="logs-header">
            <span className="logs-title">🔍 实时日志</span>
            <span className="logs-count">{logs.length} 条记录</span>
          </div>
          
          <div className="logs-container">
            {logs.map(log => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <div className="log-header">
                  <span className="log-icon">{getLogIcon(log.type)}</span>
                  <span className="log-time">{log.timestamp}</span>
                  <span className="log-message">{log.message}</span>
                </div>
                {log.details && (
                  <div className="log-details">
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="logs-empty">
                等待分析日志...
              </div>
            )}
          </div>
        </div>

        {/* 性能统计 */}
        <div className="performance-stats">
          <div className="stat-item">
            <span className="stat-label">已耗时</span>
            <span className="stat-value">{Math.floor((Date.now() - (logs[0]?.timestamp || Date.now())) / 1000)}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">API调用</span>
            <span className="stat-value">{logs.filter(l => l.type === 'api').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">状态</span>
            <span className="stat-value">
              {isAnalyzing ? '分析中' : '已完成'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 导出添加日志的工具函数
export const useAnalysisLogger = () => {
  const [progressRef, setProgressRef] = useState(null)

  const log = (message, type = 'info', details = null, thinking = null) => {
    if (progressRef && progressRef.addLog) {
      progressRef.addLog(message, type, details)
    }
    
    // 同时输出到console
    console.log(`%c${type.toUpperCase()}: ${message}`, 
      `color: ${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'orange' : 'blue'}; font-weight: bold;`,
      details || ''
    )

    if (thinking) {
      console.log(`%c🧠 AI Thinking: ${thinking}`, 'color: purple; font-style: italic;')
    }
  }

  return { log, setProgressRef }
}

export default AnalysisProgressEnhanced