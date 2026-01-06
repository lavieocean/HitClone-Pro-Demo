import React, { useState } from 'react'
import ViralDNA from '../report/ViralDNA'
import ViralDNAEnhanced from '../report/ViralDNAEnhanced'
import EmotionalRollercoaster from '../report/EmotionalRollercoaster'
import EmotionalRollercoasterEnhanced from '../report/EmotionalRollercoasterEnhanced'
import HerosJourney from '../report/HerosJourney'
import WatchTimeHacks from '../report/WatchTimeHacks'
import WatchTimeHacksEnhanced from '../report/WatchTimeHacksEnhanced'
import MoneyShots from '../report/MoneyShots'
import ContentDeepDive from '../report/ContentDeepDive'
import FullReportEnhanced from '../report/FullReportEnhanced'
import FullReportCreatorFocused from '../report/FullReportCreatorFocused'
import staticReportGenerator from '../../services/staticReportGenerator'
import staticReportGeneratorFixed from '../../services/staticReportGeneratorFixed'
import completeReportExporter from '../../services/completeReportExporter'

const HitCloneReport = ({ analysisResults, currentInput, onBackToStart }) => {
  const [activeTab, setActiveTab] = useState('creator-focused')
  const [isExporting, setIsExporting] = useState(false)

  // 处理完整报告导出
  const handleExportComplete = async () => {
    try {
      setIsExporting(true)
      console.log('🚀 开始导出完整报告...')
      
      await completeReportExporter.exportCompleteReport(
        analysisResults,
        currentInput
      )
      
      console.log('✅ 完整报告导出成功')
    } catch (error) {
      console.error('❌ 完整报告导出失败:', error)
      // 错误处理已在导出器中完成，这里不需要额外提示
    } finally {
      setIsExporting(false)
    }
  }

  // 处理当前页导出（保留原功能）
  const handleExportCurrent = async () => {
    try {
      setIsExporting(true)
      console.log('🔄 开始导出当前页...')
      
      await staticReportGeneratorFixed.generateStaticHTML(
        analysisResults,
        activeTab,
        currentInput
      )
      
      console.log('✅ 当前页导出成功')
    } catch (error) {
      console.error('❌ 当前页导出失败:', error)
      alert('导出失败，请稍后重试')
    } finally {
      setIsExporting(false)
    }
  }

  // 调试日志
  console.log('🎯 HitCloneReport收到的analysisResults:', analysisResults)
  console.log('📝 当前输入:', currentInput)

  if (!analysisResults) {
    return (
      <div className="report-container">
        <div className="report-empty">
          <div className="empty-icon">📊</div>
          <h2>暂无分析报告</h2>
          <p>请先分析视频或上传SRT文件</p>
          <button className="back-btn" onClick={onBackToStart}>
            返回开始页面
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { 
      id: 'creator-focused', 
      name: 'Viral DNA Decoder', 
      subtitle: 'What would you miss if you don\'t click today?',
      icon: '🧬' 
    },
    { 
      id: 'viral-dna', 
      name: 'Magnetic Title + Spark Thumbnail', 
      subtitle: 'Make people breathless in ten words',
      icon: '🔥' 
    },
    { 
      id: 'emotional-rollercoaster', 
      name: 'Story Spine + Interaction Insights', 
      subtitle: 'Which minute holds the emotional peak?',
      icon: '💗' 
    },
    { 
      id: 'watch-time-hacks', 
      name: '10s Hook + Retention Triggers', 
      subtitle: 'Will audiences spare 10 minutes of life?',
      icon: '⚡' 
    },
    { 
      id: 'heros-journey', 
      name: 'Hero\'s Journey', 
      subtitle: 'Classic narrative structure analysis',
      icon: '🏔️' 
    },
    { 
      id: 'money-shots', 
      name: 'Golden Clips', 
      subtitle: 'The most worthy 30 seconds for shorts',
      icon: '💰' 
    },
    { 
      id: 'content-deep-dive', 
      name: 'Content Deep Dive', 
      subtitle: 'Complete transcript analysis and insights',
      icon: '🔍' 
    },
    { 
      id: 'full-report', 
      name: 'Full Report + Next Experiment', 
      subtitle: 'How to replicate this viral DNA?',
      icon: '📋' 
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'creator-focused':
        return <FullReportCreatorFocused analysisResults={analysisResults} />
      case 'viral-dna':
        return <ViralDNAEnhanced analysisResults={analysisResults} />
      case 'emotional-rollercoaster':
        return <EmotionalRollercoasterEnhanced analysisResults={analysisResults} />
      case 'heros-journey':
        return <HerosJourney analysisResults={analysisResults} />
      case 'watch-time-hacks':
        return <WatchTimeHacksEnhanced analysisResults={analysisResults} />
      case 'money-shots':
        return <MoneyShots analysisResults={analysisResults} />
      case 'content-deep-dive':
        return <ContentDeepDive analysisResults={analysisResults} />
      case 'full-report':
        return <FullReportEnhanced analysisResults={analysisResults} />
      default:
        return <FullReportCreatorFocused analysisResults={analysisResults} />
    }
  }

  return (
    <div className="report-container">
      {/* 报告头部 */}
      <div className="report-header">
        <div className="report-title-section">
          <button className="back-btn-small" onClick={onBackToStart}>
            ← 返回
          </button>
          
          {/* 视频缩略图展示 */}
          {analysisResults?.contentInfo?.thumbnails && (
            <div className="video-thumbnail-wrapper">
              <img 
                src={analysisResults.contentInfo.thumbnails.maxres || 
                     analysisResults.contentInfo.thumbnails.standard || 
                     analysisResults.contentInfo.thumbnails.high ||
                     analysisResults.contentInfo.thumbnails.medium}
                alt={analysisResults.contentInfo.title}
                className="video-thumbnail"
                onError={(e) => {
                  // 如果加载失败，尝试其他尺寸
                  if (e.target.src !== analysisResults.contentInfo.thumbnails.high) {
                    e.target.src = analysisResults.contentInfo.thumbnails.high || 
                                  analysisResults.contentInfo.thumbnails.medium ||
                                  analysisResults.contentInfo.thumbnails.default;
                  }
                }}
              />
              {analysisResults?.contentInfo?.duration && (
                <span className="video-duration">{analysisResults.contentInfo.duration}</span>
              )}
            </div>
          )}
          
          <div className="report-meta">
            <h1 className="report-main-title">
              {currentInput?.data?.title || analysisResults?.contentInfo?.title || '视频分析报告'}
            </h1>
            <div className="report-details">
              {/* 频道信息增强展示 */}
              <div className="channel-info-enhanced">
                {analysisResults?.contentInfo?.channelAvatar && (
                  <img 
                    src={analysisResults.contentInfo.channelAvatar} 
                    alt={analysisResults.contentInfo.channel}
                    className="channel-avatar"
                  />
                )}
                <span className="channel-name">
                  {currentInput?.data?.channel || analysisResults?.contentInfo?.channel || '未知频道'}
                </span>
                {analysisResults?.contentInfo?.subscriberCount && (
                  <span className="subscriber-count">
                    {analysisResults.contentInfo.subscriberCount}
                  </span>
                )}
              </div>
              
              <span className="views-count">
                {currentInput?.data?.views || analysisResults?.contentInfo?.views || '0 views'}
              </span>
              
              {/* 互动数据展示 */}
              {(analysisResults?.contentInfo?.likeCount || analysisResults?.contentInfo?.commentCount) && (
                <div className="interaction-stats">
                  {analysisResults.contentInfo.likeCount && (
                    <span className="like-count">👍 {analysisResults.contentInfo.likeCount}</span>
                  )}
                  {analysisResults.contentInfo.commentCount && (
                    <span className="comment-count">💬 {analysisResults.contentInfo.commentCount}</span>
                  )}
                </div>
              )}
              
              <span className="analysis-date">
                分析时间: {new Date().toLocaleDateString('zh-CN')}
              </span>
              {analysisResults?.contentInfo?.hasAutoData && (
                <span className="data-source" style={{ color: '#10B981', fontSize: '12px' }}>
                  🤖 基于真实YouTube数据分析
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="report-actions">
          <button 
            className="action-btn primary"
            onClick={handleExportComplete}
            disabled={isExporting}
            style={{ 
              opacity: isExporting ? 0.6 : 1,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              background: isExporting ? 'rgba(16,185,129,0.6)' : '#10B981'
            }}
          >
            <span>{isExporting ? '⏳' : '📋'}</span>
            <span>{isExporting ? '导出中...' : '导出完整报告'}</span>
          </button>
          <button 
            className="action-btn secondary"
            onClick={handleExportCurrent}
            disabled={isExporting}
            style={{ 
              opacity: isExporting ? 0.6 : 1,
              cursor: isExporting ? 'not-allowed' : 'pointer'
            }}
          >
            <span>📄</span>
            <span>导出当前页</span>
          </button>
          <button className="action-btn secondary">
            <span>📤</span>
            <span>分享链接</span>
          </button>
          <button className="action-btn secondary">
            <span>⭐</span>
            <span>收藏</span>
          </button>
        </div>
      </div>

      {/* 分析维度标签页 */}
      <div className="report-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ flexDirection: 'column', alignItems: 'center', padding: '12px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name" style={{ fontWeight: '600' }}>{tab.name}</span>
            </div>
            {tab.subtitle && (
              <span style={{ 
                fontSize: '11px', 
                color: '#6B7280', 
                marginTop: '4px',
                fontStyle: 'italic',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {tab.subtitle}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="report-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default HitCloneReport