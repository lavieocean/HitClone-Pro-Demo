import React, { useState, useEffect } from 'react'
import channelAnalysisService from '../../services/channelAnalysisService'
import historyChannelIntegration from '../../services/historyChannelIntegration'

const ChannelModeSelection = ({ onModeSelect, onBackToStart }) => {
  const [integrationStats, setIntegrationStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // 自动整合历史数据
      const integrationResult = historyChannelIntegration.autoIntegrateIfNeeded()
      console.log('🎯 历史数据整合结果:', integrationResult)
      
      // 获取统计信息
      const stats = historyChannelIntegration.getIntegrationStats()
      setIntegrationStats(stats)
      
      console.log('📊 频道分析统计:', stats)
    } catch (error) {
      console.error('❌ 初始化失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHistoryMode = () => {
    onModeSelect('history')
  }

  const handleBatchMode = () => {
    onModeSelect('batch')
  }

  const forceReintegration = async () => {
    setLoading(true)
    try {
      const result = historyChannelIntegration.forceReintegrate()
      console.log('🔄 强制重新整合结果:', result)
      
      // 刷新统计信息
      const stats = historyChannelIntegration.getIntegrationStats()
      setIntegrationStats(stats)
    } catch (error) {
      console.error('❌ 重新整合失败:', error)
    } finally {
      setLoading(false)
    }
  }

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
            borderTopColor: '#DBFC53',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>Initializing HitClone Channel...</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Integrating your history data</p>
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
      {/* 页面头部 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <button 
          className="back-btn-small" 
          onClick={onBackToStart}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '40px'
          }}
        >
          ← Back to Start
        </button>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '16px'
          }}>
            🎯 HitClone Channel
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '12px'
          }}>
            Deep Channel Analysis & Strategy Insights
          </p>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            Choose your analysis mode to get started
          </p>
        </div>

        {/* 统计信息面板 */}
        {integrationStats && (
          <div style={{
            background: 'rgba(219, 252, 83, 0.1)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            <h3 style={{
              color: '#DBFC53',
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              📊 Your Channel Analysis Status
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
              fontSize: '14px'
            }}>
              <div>
                <div style={{ color: '#DBFC53', fontSize: '24px', fontWeight: '700' }}>
                  {integrationStats.historyReports}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>History Reports</div>
              </div>
              <div>
                <div style={{ color: '#10B981', fontSize: '24px', fontWeight: '700' }}>
                  {integrationStats.integratedChannels}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>Identified Channels</div>
              </div>
              <div>
                <div style={{ color: '#3B82F6', fontSize: '24px', fontWeight: '700' }}>
                  {integrationStats.analyzableChannels}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>Ready for Analysis</div>
              </div>
              <div>
                <div style={{ color: '#F59E0B', fontSize: '24px', fontWeight: '700' }}>
                  {integrationStats.totalVideos}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Videos</div>
              </div>
            </div>
          </div>
        )}

        {/* 模式选择卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* 模式一：历史数据涌现模式 */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            cursor: integrationStats?.analyzableChannels > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: integrationStats?.analyzableChannels > 0 ? 1 : 0.6,
            position: 'relative'
          }}
          onClick={integrationStats?.analyzableChannels > 0 ? handleHistoryMode : undefined}
          onMouseOver={(e) => {
            if (integrationStats?.analyzableChannels > 0) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = '#10B981'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }
          }}
          onMouseOut={(e) => {
            if (integrationStats?.analyzableChannels > 0) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                📊
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  History Report Emergence
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#10B981',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Based on existing analysis data
                </p>
              </div>
            </div>

            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>
              Automatically discover channel-level insights from your history reports. Perfect for channels like David Perell where you already have multiple video analyses.
            </p>

            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#10B981',
                marginBottom: '8px'
              }}>
                ✨ What you get:
              </h4>
              <ul style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                paddingLeft: '16px',
                lineHeight: '1.6'
              }}>
                <li>Instant channel insights from existing data</li>
                <li>Performance patterns across videos</li>
                <li>Content strategy recommendations</li>
                <li>No additional analysis needed</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                fontSize: '14px',
                color: integrationStats?.analyzableChannels > 0 ? '#10B981' : '#6B7280'
              }}>
                {integrationStats?.analyzableChannels > 0 
                  ? `${integrationStats.analyzableChannels} channels ready (3+ videos each)`
                  : 'Need 3+ videos per channel to analyze'
                }
              </div>
              {integrationStats?.analyzableChannels > 0 && (
                <div style={{
                  background: '#10B981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Ready to Analyze
                </div>
              )}
            </div>

            {integrationStats?.analyzableChannels === 0 && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(107, 114, 128, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                NEED MORE DATA
              </div>
            )}
          </div>

          {/* 模式二：批量输入模式 */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onClick={handleBatchMode}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.borderColor = '#DBFC53'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #DBFC53, #A8E063)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                color: '#1A1A1A'
              }}>
                🎯
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '4px'
                }}>
                  Batch Analysis Mode
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#DBFC53',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Channel URL + 3 Video URLs
                </p>
              </div>
            </div>

            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>
              Input a YouTube channel URL plus 3 specific video URLs for comprehensive channel analysis. Best for targeted analysis of new channels.
            </p>

            <div style={{
              background: 'rgba(219, 252, 83, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#DBFC53',
                marginBottom: '8px'
              }}>
                🚀 What you get:
              </h4>
              <ul style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                paddingLeft: '16px',
                lineHeight: '1.6'
              }}>
                <li>Fresh analysis of any YouTube channel</li>
                <li>Guaranteed data from 3 videos</li>
                <li>Complete 10-module channel report</li>
                <li>Real-time data fetching & analysis</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#DBFC53'
              }}>
                Analyze any channel instantly
              </div>
              <div style={{
                background: '#DBFC53',
                color: '#1A1A1A',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Always Available
              </div>
            </div>
          </div>
        </div>

        {/* 底部帮助和工具 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            💡 Need Help Getting Started?
          </h4>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '16px'
          }}>
            For the best results, we recommend having at least 3 videos from the same channel analyzed.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {integrationStats?.historyReports > 0 && (
              <button 
                onClick={forceReintegration}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(107, 114, 128, 0.2)',
                  border: '1px solid #6B7280',
                  borderRadius: '6px',
                  color: '#6B7280',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🔄 Refresh Channel Data
              </button>
            )}
            <button 
              onClick={onBackToStart}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              📊 Analyze More Videos First
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChannelModeSelection