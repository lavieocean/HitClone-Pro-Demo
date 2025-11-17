import React, { useState } from 'react'
import './styles/compact.css'

// 精简版组件
const ApiStatusIndicator = () => {
  const [status, setStatus] = useState('artifacts')
  
  React.useEffect(() => {
    const available = !!(window?.claude?.complete)
    setStatus(available ? 'artifacts' : 'local')
  }, [])

  return (
    <div className="api-status-indicator">
      <div className={`inline-flex items-center px-4 py-2 rounded-lg border shadow-lg ${
        status === 'artifacts' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}>
        <span className="text-base">{status === 'artifacts' ? '✅' : '🏠'}</span>
        <div className="ml-2">
          <div className="text-sm font-medium">
            {status === 'artifacts' ? 'Claude Artifacts环境' : '本地模拟模式'}
          </div>
          <div className="text-xs opacity-75">
            {status === 'artifacts' ? '真实Claude API分析' : '智能模拟分析'}
          </div>
        </div>
      </div>
    </div>
  )
}

const LeftSidebar = ({ currentPage, onPageChange }) => (
  <nav className="sidebar">
    <div className="sidebar-header">
      <div className="logo">
        <span>🤖</span>
        <span>Alici.AI</span>
      </div>
    </div>
    <div className="sidebar-nav">
      <div className="nav-section">
        <div className="nav-section-title">HitClone Pro</div>
        <div className={`nav-item ${currentPage === 'start' ? 'active' : ''}`} onClick={() => onPageChange('start')}>
          <span className="nav-icon">🚀</span>
          <span>Start</span>
        </div>
        <div className={`nav-item ${currentPage === 'report' ? 'active' : ''}`} onClick={() => onPageChange('report')}>
          <span className="nav-icon">📊</span>
          <span>Report</span>
        </div>
      </div>
    </div>
  </nav>
)

const TopNavigation = ({ copilotOpen, onToggleCopilot }) => (
  <header className="top-nav">
    <nav className="top-nav-tabs">
      <div className="top-nav-tab active">Video</div>
    </nav>
    <div className="top-nav-right">
      <button className={`top-nav-btn ${copilotOpen ? 'active' : ''}`} onClick={onToggleCopilot}>
        🤖 Copilot
      </button>
      <div className="credits">
        <span>💎</span>
        <span>Credits: 12,148</span>
      </div>
    </div>
  </header>
)

const HitCloneStart = ({ onAnalyze }) => {
  const [url, setUrl] = useState('')
  const [inputMode, setInputMode] = useState('url')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onAnalyze({ type: inputMode, data: url })
    setLoading(false)
  }

  return (
    <div className="hitclone-start fade-in">
      <div className="start-header">
        <h1 className="start-title">HitClone Pro</h1>
        <p className="start-subtitle">AI驱动的内容结构分析，揭示爆款视频的成功密码</p>
      </div>
      
      <div className="start-input-section">
        <div className="input-mode-selector">
          <button className={`mode-btn ${inputMode === 'url' ? 'active' : ''}`} onClick={() => setInputMode('url')}>
            🔗 视频链接分析
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              className="url-input" 
              placeholder="粘贴YouTube视频链接..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="analyze-btn" disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>分析中...</span>
                </>
              ) : (
                <span>🚀 开始分析</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const HitCloneReport = ({ analysisResults, onBackToStart }) => {
  const [activeTab, setActiveTab] = useState('viral-dna')

  if (!analysisResults) {
    return (
      <div className="report-container">
        <div className="report-empty">
          <div className="empty-icon">📊</div>
          <h2>暂无分析报告</h2>
          <button className="back-btn" onClick={onBackToStart}>返回开始页面</button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'viral-dna', name: 'Viral DNA', icon: '🧬' },
    { id: 'full-report', name: 'Full Report', icon: '📋' }
  ]

  return (
    <div className="report-container">
      <div className="report-header">
        <div className="report-title-section">
          <button className="back-btn-small" onClick={onBackToStart}>← 返回</button>
          <div className="report-meta">
            <h1 className="report-main-title">{analysisResults.contentInfo?.title || '视频分析报告'}</h1>
          </div>
        </div>
      </div>

      <div className="report-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="report-content">
        {activeTab === 'viral-dna' && (
          <div className="viral-dna-container">
            <div className="viral-overview">
              <h3 className="section-title">🧬 病毒式传播DNA解析</h3>
              <div className="viral-score-main">
                <div className="score-circle">
                  <div className="score-number">88</div>
                  <div className="score-label">病毒性指数</div>
                </div>
                <div className="score-insights">
                  <p>该视频具备<strong>强烈的病毒式传播潜力</strong>，多个核心要素配合得当。</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'full-report' && (
          <div className="full-report-container">
            <div className="executive-summary">
              <h3 className="section-title">📋 执行摘要</h3>
              <p>该视频在多个维度表现出色，综合评分达到88分，远超行业平均水平。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CopilotPanel = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { type: 'assistant', content: '👋 你好！我是HitClone Pro AI助手。' }
  ])

  const sendMessage = () => {
    if (!message.trim()) return
    setMessages(prev => [...prev, 
      { type: 'user', content: message },
      { type: 'assistant', content: '基于分析结果，我建议关注情感设计和开场吸引力。' }
    ])
    setMessage('')
  }

  if (!isOpen) return null

  return (
    <div className="copilot-panel">
      <div className="copilot-header">
        <div className="copilot-title">
          <span>🤖</span>
          <span>HitClone AI Copilot</span>
        </div>
        <button className="copilot-close" onClick={onClose}>✕</button>
      </div>

      <div className="copilot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === 'assistant' && <div className="assistant-avatar">🤖</div>}
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="copilot-input">
        <div className="input-wrapper">
          <input
            className="copilot-text-input"
            placeholder="询问关于视频分析的问题..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="send-btn" onClick={sendMessage}>发送</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('start')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)

  const handleAnalyze = async (input) => {
    // 调用Claude API或模拟分析
    const isArtifacts = !!(window?.claude?.complete)
    
    if (isArtifacts) {
      try {
        const response = await window.claude.complete({
          prompt: `分析视频: ${input.data}，返回JSON格式的分析结果`,
          max_tokens: 1000
        })
        setAnalysisResults({ contentInfo: { title: '视频分析报告' }, analysis: response })
      } catch (error) {
        setAnalysisResults({ contentInfo: { title: '模拟分析报告' } })
      }
    } else {
      setAnalysisResults({ contentInfo: { title: '模拟分析报告' } })
    }
    
    setCurrentPage('report')
    setCopilotOpen(true)
  }

  return (
    <div className="app-container">
      <ApiStatusIndicator />
      
      <LeftSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="main-container">
        <TopNavigation copilotOpen={copilotOpen} onToggleCopilot={() => setCopilotOpen(!copilotOpen)} />
        
        <div className="content-wrapper">
          <div className="content-area">
            <div className="main-content">
              {currentPage === 'start' && <HitCloneStart onAnalyze={handleAnalyze} />}
              {currentPage === 'report' && (
                <HitCloneReport 
                  analysisResults={analysisResults}
                  onBackToStart={() => setCurrentPage('start')}
                />
              )}
            </div>
          </div>
          
          {copilotOpen && <CopilotPanel isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />}
        </div>
      </div>
    </div>
  )
}

export default App