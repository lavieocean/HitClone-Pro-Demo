import React, { useState, useEffect } from 'react'
import historyChannelIntegration from '../../services/historyChannelIntegration'

const ChannelSelectionConfirm = ({ onChannelSelect, onBackToModeSelection }) => {
  const [detectionReport, setDetectionReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState(new Set())
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  useEffect(() => {
    loadDetectionReport()
  }, [])

  const loadDetectionReport = async () => {
    try {
      setLoading(true)
      const report = historyChannelIntegration.getDetectionReport()
      setDetectionReport(report)
      console.log('📊 加载检测报告完成:', report)
    } catch (error) {
      console.error('❌ 加载检测报告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshDetection = async () => {
    setRefreshing(true)
    try {
      console.log('🔄 开始刷新检测...')
      const result = historyChannelIntegration.refreshDetectionAndIntegration()
      setDetectionReport(result.detectionReport)
      console.log('✅ 刷新完成:', result)
    } catch (error) {
      console.error('❌ 刷新失败:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleChannelToggle = (channelName) => {
    const newSelected = new Set(selectedChannels)
    if (newSelected.has(channelName)) {
      newSelected.delete(channelName)
    } else {
      newSelected.add(channelName)
    }
    setSelectedChannels(newSelected)
  }

  const handleStartAnalysis = () => {
    if (selectedChannels.size === 0) {
      alert('请至少选择一个频道进行分析')
      return
    }

    const selectedChannelData = detectionReport.channels.analyzable
      .filter(channel => selectedChannels.has(channel.channelName))

    onChannelSelect(selectedChannelData)
  }

  const getChannelCardStyle = (channel, isSelected) => ({
    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${isSelected ? '#10B981' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '16px'
  })

  if (loading) {
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        minHeight: '100vh',
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTopColor: '#10B981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>Detecting Channels...</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>正在分析历史报告中的频道数据</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* 页面头部 */}
        <button 
          onClick={onBackToModeSelection}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '32px'
          }}
        >
          ← Back to Mode Selection
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '12px'
          }}>
            📊 Channel Detection Results
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '8px'
          }}>
            发现的可分析频道 - 请选择要分析的频道
          </p>
        </div>

        {/* 统计概览 */}
        {detectionReport && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: '#10B981', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                📋 Detection Summary
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleRefreshDetection}
                  disabled={refreshing}
                  style={{
                    padding: '6px 12px',
                    background: refreshing ? 'rgba(107, 114, 128, 0.5)' : 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10B981',
                    borderRadius: '6px',
                    color: '#10B981',
                    cursor: refreshing ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {refreshing ? '🔄 刷新中...' : '🔄 重新检测'}
                </button>
                <button
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid #6B7280',
                    borderRadius: '6px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  🔍 调试信息
                </button>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '16px',
              fontSize: '14px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#DBFC53', fontSize: '24px', fontWeight: '700' }}>
                  {detectionReport.totalReports}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>历史报告</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#10B981', fontSize: '24px', fontWeight: '700' }}>
                  {detectionReport.analyzableChannels}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>可分析频道</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#F59E0B', fontSize: '24px', fontWeight: '700' }}>
                  {detectionReport.insufficientChannels}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>不足3视频</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#3B82F6', fontSize: '24px', fontWeight: '700' }}>
                  {selectedChannels.size}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>已选择</div>
              </div>
            </div>
          </div>
        )}

        {/* 调试面板 */}
        {showDebugPanel && detectionReport && (
          <div style={{
            background: 'rgba(107, 114, 128, 0.1)',
            border: '1px solid #6B7280',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <h4 style={{ color: '#6B7280', marginBottom: '8px' }}>🔍 Debug Information</h4>
            <pre style={{ 
              color: 'rgba(255,255,255,0.7)', 
              margin: 0, 
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(detectionReport, null, 2)}
            </pre>
          </div>
        )}

        {/* 可分析频道列表 */}
        {detectionReport?.channels?.analyzable?.length > 0 ? (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '16px'
            }}>
              🎯 可分析频道 ({detectionReport.channels.analyzable.length})
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '20px'
            }}>
              以下频道至少有3个视频分析，可以生成频道级洞察。点击选择要分析的频道：
            </p>
            
            {detectionReport.channels.analyzable.map((channel, index) => {
              const isSelected = selectedChannels.has(channel.channelName)
              return (
                <div
                  key={index}
                  onClick={() => handleChannelToggle(channel.channelName)}
                  style={getChannelCardStyle(channel, isSelected)}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isSelected ? '#10B981' : 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {isSelected ? '✓' : index + 1}
                        </div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'white',
                          margin: 0
                        }}>
                          {channel.channelName}
                        </h4>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '20px',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '12px'
                      }}>
                        <span>📹 {channel.videoCount} 个视频</span>
                        <span>⭐ 平均分: {channel.avgScore}</span>
                        <span>📅 最新: {new Date(channel.latestDate).toLocaleDateString('zh-CN')}</span>
                      </div>
                      
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                        视频: {channel.videos.slice(0, 2).map(v => v.title).join(', ')}
                        {channel.videos.length > 2 && ` ... (+${channel.videos.length - 2} more)`}
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '4px 8px',
                      background: isSelected ? '#10B981' : 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: isSelected ? 'white' : '#10B981'
                    }}>
                      {isSelected ? 'SELECTED' : 'READY'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📺</div>
            <h3 style={{ color: 'white', marginBottom: '12px' }}>未发现可分析频道</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              没有找到拥有3个或以上视频分析的频道。请先分析更多视频或尝试重新检测。
            </p>
          </div>
        )}

        {/* 不足视频的频道 */}
        {detectionReport?.channels?.insufficient?.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '16px'
            }}>
              ⚠️ 视频不足的频道 ({detectionReport.channels.insufficient.length})
            </h3>
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px'
            }}>
              {detectionReport.channels.insufficient.map((channel, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: index < detectionReport.channels.insufficient.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{channel.channelName}</span>
                  <span style={{ color: '#F59E0B' }}>{channel.videoCount} 个视频</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            已选择 {selectedChannels.size} 个频道进行分析
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setSelectedChannels(new Set())}
              style={{
                padding: '8px 16px',
                background: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid #6B7280',
                borderRadius: '8px',
                color: '#6B7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              清除选择
            </button>
            
            <button
              onClick={handleStartAnalysis}
              disabled={selectedChannels.size === 0}
              style={{
                padding: '12px 24px',
                background: selectedChannels.size > 0 ? '#10B981' : 'rgba(107, 114, 128, 0.5)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: selectedChannels.size > 0 ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              🚀 开始频道分析 ({selectedChannels.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChannelSelectionConfirm