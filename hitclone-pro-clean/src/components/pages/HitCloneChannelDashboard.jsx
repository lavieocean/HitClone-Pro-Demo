import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import channelAnalysisService from '../../services/channelAnalysisService'
import channelAggregationService from '../../services/channelAggregationService'
import historyChannelIntegration from '../../services/historyChannelIntegration'
import { useVideoAnalysis } from '../../hooks/useVideoAnalysis'
import youTubeDataService from '../../services/youTubeDataService'

// 导入页面组件
import ChannelModeSelection from './ChannelModeSelection'
import ChannelBatchInput from './ChannelBatchInput'
import ChannelSelectionConfirm from './ChannelSelectionConfirm'

// 导入各个模块组件
import ChannelCompass from '../channel/modules/ChannelCompass'
import MoneyStack from '../channel/modules/MoneyStack'
import StrategyPlaybook from '../channel/modules/StrategyPlaybook'
import ContentMatrix from '../channel/modules/ContentMatrix'
import HookLeaderboard from '../channel/modules/HookLeaderboard'
import ThumbnailHall from '../channel/modules/ThumbnailHall'
import AudiencePulse from '../channel/modules/AudiencePulse'
import RetentionHeatmap from '../channel/modules/RetentionHeatmap'
import ShortsMining from '../channel/modules/ShortsMining'
import DataFreshnessLog from '../channel/modules/DataFreshnessLog'

const HitCloneChannelDashboard = ({ onBackToStart }) => {
  // 主要状态
  const [currentView, setCurrentView] = useState('modeSelection') // 'modeSelection', 'batchInput', 'channelSelectionConfirm', 'channelList', 'analysis'
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [aggregatedData, setAggregatedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeModule, setActiveModule] = useState('compass')
  const [analysisProgress, setAnalysisProgress] = useState({ step: 0, total: 4, message: '' })

  // 获取所有可分析的频道
  const [availableChannels, setAvailableChannels] = useState([])
  
  // 使用视频分析hook
  const { analyzeVideo } = useVideoAnalysis()

  useEffect(() => {
    // 不在初始化时自动整合，让用户自己选择
    loadAvailableChannels()
  }, [])

  // 监听智能频道分析事件
  useEffect(() => {
    const handleSmartChannelAnalysis = (event) => {
      // 减少控制台日志以优化性能
      // console.log('🧠 收到智能频道分析事件:', event.detail)
      const channelData = event.detail
      
      // 显示接收确认提示
      const confirmToast = document.createElement('div')
      confirmToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `
      confirmToast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          ✅ 已接收频道数据: ${channelData.channelName} (${channelData.totalVideos}个视频)
        </div>
      `
      document.body.appendChild(confirmToast)
      setTimeout(() => confirmToast.remove(), 3000)
      
      try {
        // 直接跳转到频道分析界面
        setSelectedChannel(channelData)
        setCurrentView('analysis')
        
        // 准备聚合数据
        const aggregatedChannelData = {
          channelInfo: {
            name: channelData.channelName,
            id: channelData.channelId,
            totalVideos: channelData.totalVideos,
            source: channelData.source,
            timestamp: channelData.timestamp
          },
          videos: channelData.videos,
          analysis: {
            totalAnalyzed: channelData.videos.length,
            avgScore: Math.round(channelData.videos.reduce((sum, v) => sum + (v.score || 0), 0) / channelData.videos.length),
            dateRange: {
              earliest: channelData.videos.reduce((earliest, v) => 
                !earliest || new Date(v.analysisDate) < new Date(earliest) ? v.analysisDate : earliest, null),
              latest: channelData.videos.reduce((latest, v) => 
                !latest || new Date(v.analysisDate) > new Date(latest) ? v.analysisDate : latest, null)
            },
            scoreDistribution: {
              excellent: channelData.videos.filter(v => v.score >= 90).length,
              good: channelData.videos.filter(v => v.score >= 80 && v.score < 90).length,
              average: channelData.videos.filter(v => v.score >= 70 && v.score < 80).length,
              poor: channelData.videos.filter(v => v.score < 70).length
            }
          },
          smartAnalysis: {
            enabled: true,
            source: 'history_reports',
            dataQuality: 'high',
            readyForAnalysis: true
          }
        }
        
        setAggregatedData(aggregatedChannelData)
        console.log('✅ 智能频道分析数据准备完成:', aggregatedChannelData)
        
        // 触发分析开始状态
        setLoading(true)
        setError('')
        setAnalysisProgress({
          step: 0,
          total: 10,
          message: '🧠 Smart Channel Analysis 数据已加载，准备开始10模块分析...'
        })
        
        // 模拟分析准备完成
        setTimeout(() => {
          setLoading(false)
          setAnalysisProgress({
            step: 10,
            total: 10,
            message: '✅ Smart Channel Analysis 准备完成！'
          })
        }, 1500)
        
      } catch (error) {
        console.error('❌ 智能频道分析数据处理失败:', error)
        setError(`数据处理失败: ${error.message}`)
        setLoading(false)
      }
    }

    window.addEventListener('smartChannelAnalysis', handleSmartChannelAnalysis)
    
    return () => {
      window.removeEventListener('smartChannelAnalysis', handleSmartChannelAnalysis)
    }
  }, [])

  const loadAvailableChannels = useCallback(() => {
    try {
      const channels = channelAnalysisService.getAnalyzableChannels()
      console.log('📺 Found analyzable channels:', channels.length)
      setAvailableChannels(channels)
    } catch (error) {
      console.error('Failed to load channels:', error)
      setError('Failed to load channel data')
    }
  }, [])

  // 提取频道信息
  const extractChannelInfo = async (channelUrl) => {
    try {
      console.log('🔍 提取频道信息:', channelUrl)
      
      // 解析不同格式的频道URL
      let channelId = null
      let channelName = null
      
      // @username 格式
      const usernameMatch = channelUrl.match(/@([a-zA-Z0-9_.-]+)/)
      if (usernameMatch) {
        channelName = usernameMatch[1]
        channelId = `@${channelName}`
      }
      
      // /channel/UCxxx 格式
      const channelIdMatch = channelUrl.match(/\/channel\/([a-zA-Z0-9_-]+)/)
      if (channelIdMatch) {
        channelId = channelIdMatch[1]
      }
      
      // /c/channelname 格式
      const customMatch = channelUrl.match(/\/c\/([a-zA-Z0-9_-]+)/)
      if (customMatch) {
        channelName = customMatch[1]
        channelId = `c_${channelName}`
      }
      
      // /user/username 格式
      const userMatch = channelUrl.match(/\/user\/([a-zA-Z0-9_-]+)/)
      if (userMatch) {
        channelName = userMatch[1]
        channelId = `user_${channelName}`
      }
      
      return {
        channelId: channelId || `unknown_${Date.now()}`,
        channelName: channelName || 'Unknown Channel',
        channelUrl: channelUrl
      }
    } catch (error) {
      console.error('频道信息提取失败:', error)
      return {
        channelId: `error_${Date.now()}`,
        channelName: 'Error Channel',
        channelUrl: channelUrl
      }
    }
  }

  // 分析单个视频并显示进度
  const analyzeVideoWithProgress = async (videoUrl, videoIndex) => {
    try {
      setAnalysisProgress({
        step: videoIndex,
        total: 3,
        message: `正在分析视频 ${videoIndex}/3...`
      })
      
      console.log(`🎬 开始分析视频 ${videoIndex}:`, videoUrl)
      
      // 使用现有的analyzeVideo函数
      const result = await analyzeVideo({ type: 'url', data: videoUrl })
      
      console.log(`✅ 视频 ${videoIndex} 分析完成:`, result)
      return result
      
    } catch (error) {
      console.error(`❌ 视频 ${videoIndex} 分析失败:`, error)
      throw error
    }
  }

  // 处理模式选择
  const handleModeSelect = (mode) => {
    if (mode === 'history') {
      setCurrentView('channelSelectionConfirm')
    } else if (mode === 'batch') {
      setCurrentView('batchInput')
    }
  }

  // 处理频道选择确认
  const handleChannelSelectionConfirm = (selectedChannelData) => {
    console.log('📊 用户选择的频道:', selectedChannelData)
    
    if (selectedChannelData.length === 1) {
      // 单个频道直接分析
      const channel = selectedChannelData[0]
      const formattedChannel = {
        channelId: `history_${channel.channelName}`,
        channelName: channel.channelName,
        totalVideos: channel.videoCount,
        canAnalyze: true,
        videos: channel.videos
      }
      setSelectedChannel(formattedChannel)
      setCurrentView('analysis')
      handleChannelSelect(formattedChannel)
    } else {
      // 多个频道显示列表让用户进一步选择
      setAvailableChannels(selectedChannelData.map(channel => ({
        channelId: `history_${channel.channelName}`,
        channelName: channel.channelName,
        totalVideos: channel.videoCount,
        canAnalyze: true,
        videos: channel.videos
      })))
      setCurrentView('channelList')
    }
  }

  // 处理批量分析
  const handleBatchAnalysis = async (batchData) => {
    console.log('🚀 开始批量分析:', batchData)
    setLoading(true)
    setError('')
    
    try {
      // 1. 解析频道URL并提取频道信息
      const channelInfo = await extractChannelInfo(batchData.channelUrl)
      console.log('📺 频道信息:', channelInfo)
      
      // 2. 分析3个视频
      const analyzedVideos = []
      for (let i = 0; i < batchData.videoUrls.length; i++) {
        const videoUrl = batchData.videoUrls[i]
        console.log(`🎬 开始分析视频 ${i + 1}/3: ${videoUrl}`)
        
        // 使用现有的视频分析流程
        const analysisResult = await analyzeVideoWithProgress(videoUrl, i + 1)
        if (analysisResult) {
          analyzedVideos.push(analysisResult)
          
          // 将视频数据添加到频道分析服务
          channelAnalysisService.addVideoToChannel(
            analysisResult.videoData || {},
            analysisResult.analysisResults || {},
            { type: 'url', data: videoUrl }
          )
        }
      }
      
      if (analyzedVideos.length === 0) {
        throw new Error('没有成功分析的视频')
      }
      
      // 3. 创建频道对象
      const channelId = channelInfo.channelId || `batch_${Date.now()}`
      const realChannel = {
        channelId: channelId,
        channelName: channelInfo.channelName || 'Batch Analysis Channel',
        totalVideos: analyzedVideos.length,
        canAnalyze: true,
        videos: analyzedVideos.map((video, index) => ({
          id: video.videoData?.videoId || `video_${index + 1}`,
          title: video.videoData?.title || `Video ${index + 1}`,
          url: batchData.videoUrls[index],
          analysisResults: video.analysisResults,
          videoData: video.videoData,
          analysisDate: new Date().toISOString()
        }))
      }
      
      console.log('✅ 批量分析完成:', realChannel)
      
      // 4. 设置选中的频道并切换到分析视图
      setSelectedChannel(realChannel)
      setCurrentView('analysis')
      
      // 5. 生成聚合数据
      await handleChannelSelect(realChannel)
      
    } catch (error) {
      console.error('❌ 批量分析失败:', error)
      setError(`批量分析失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChannelSelect = async (channel) => {
    setLoading(true)
    setError('')
    setSelectedChannel(channel)
    setCurrentView('analysis')

    try {
      console.log('🎯 Analyzing channel:', channel.channelName)
      
      // 如果是批量分析生成的频道，直接使用其视频数据
      let videosForAggregation = []
      
      if (channel.videos && Array.isArray(channel.videos)) {
        // 批量分析生成的频道，直接使用视频数据
        videosForAggregation = channel.videos
        console.log('📊 使用批量分析的视频数据:', videosForAggregation.length, '个视频')
      } else {
        // 从channelAnalysisService获取频道数据
        const channelData = channelAnalysisService.getChannelData(channel.channelId)
        if (!channelData || !channelData.videos) {
          throw new Error('Channel data not found')
        }
        videosForAggregation = channelData.videos
        console.log('📊 从服务获取频道数据:', videosForAggregation.length, '个视频')
      }

      // 使用聚合服务分析数据
      console.log('🔄 开始聚合频道数据...')
      const aggregated = channelAggregationService.aggregateChannelData(videosForAggregation)
      setAggregatedData(aggregated)
      
      console.log('✅ Channel analysis completed:', aggregated)
      
    } catch (error) {
      console.error('❌ Channel analysis failed:', error)
      setError(error.message || 'Channel analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const modules = [
    { 
      id: 'compass', 
      name: 'Channel Compass', 
      icon: '🧭',
      description: 'Overview KPIs & Health',
      component: ChannelCompass
    },
    { 
      id: 'money', 
      name: 'Money Stack', 
      icon: '💰',
      description: 'Revenue Analysis',
      component: MoneyStack
    },
    { 
      id: 'strategy', 
      name: 'Strategy Playbook', 
      icon: '📋',
      description: 'Action Plan',
      component: StrategyPlaybook
    },
    { 
      id: 'content', 
      name: 'Content Matrix', 
      icon: '🎨',
      description: 'Topic & Story Analysis',
      component: ContentMatrix
    },
    { 
      id: 'hooks', 
      name: 'Hook Leaderboard', 
      icon: '🎣',
      description: 'Best Opening Moments',
      component: HookLeaderboard
    },
    { 
      id: 'thumbnails', 
      name: 'Thumbnail Hall', 
      icon: '🖼️',
      description: 'Visual Impact Analysis',
      component: ThumbnailHall
    },
    { 
      id: 'audience', 
      name: 'Audience Pulse', 
      icon: '👥',
      description: 'Viewer Insights',
      component: AudiencePulse
    },
    { 
      id: 'retention', 
      name: 'Retention Heatmap', 
      icon: '🔥',
      description: 'Drop-off Patterns',
      component: RetentionHeatmap
    },
    { 
      id: 'shorts', 
      name: 'Shorts Mining', 
      icon: '📱',
      description: 'Clip Opportunities',
      component: ShortsMining
    },
    { 
      id: 'freshness', 
      name: 'Data Freshness', 
      icon: '📅',
      description: 'Data Quality Log',
      component: DataFreshnessLog
    }
  ]

  const renderModuleContent = () => {
    if (!aggregatedData) return null

    const activeModuleConfig = modules.find(m => m.id === activeModule)
    if (!activeModuleConfig) return null

    const ModuleComponent = activeModuleConfig.component
    const moduleData = aggregatedData[activeModule === 'money' ? 'moneyStack' : activeModule]

    return <ModuleComponent data={moduleData} metadata={aggregatedData.metadata} />
  }

  // 根据当前视图渲染不同组件
  if (currentView === 'modeSelection') {
    return (
      <ChannelModeSelection 
        onModeSelect={handleModeSelect}
        onBackToStart={onBackToStart}
      />
    )
  }

  if (currentView === 'batchInput') {
    return (
      <ChannelBatchInput 
        onStartAnalysis={handleBatchAnalysis}
        onBackToModeSelection={() => setCurrentView('modeSelection')}
        analysisProgress={analysisProgress}
      />
    )
  }

  if (currentView === 'channelSelectionConfirm') {
    return (
      <ChannelSelectionConfirm 
        onChannelSelect={handleChannelSelectionConfirm}
        onBackToModeSelection={() => setCurrentView('modeSelection')}
      />
    )
  }

  if (currentView === 'channelList') {
    return (
      <div className="channel-dashboard-container">
        <div className="channel-dashboard-header">
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
              marginBottom: '20px'
            }}
          >
            ← Back to Start
          </button>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            🎯 HitClone Channel
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Deep channel analysis based on aggregated video insights
          </p>
        </div>

        {availableChannels.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📺</div>
            <h3 style={{ color: 'white', marginBottom: '12px' }}>No Channels Available</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              You need at least 3 analyzed videos from the same channel to generate channel insights.
            </p>
            <div style={{
              background: 'rgba(219, 252, 83, 0.1)',
              border: '1px solid rgba(219, 252, 83, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              💡 <strong>Tips to get started:</strong><br/>
              • Analyze videos from the same YouTube channel<br/>
              • Use the "History Report Emergence" mode to discover existing channels<br/>
              • Try "Batch Analysis Mode" with a channel URL + 3 video URLs
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setCurrentView('modeSelection')}
                style={{
                  padding: '12px 24px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🔍 Try Channel Detection
              </button>
              <button 
                onClick={onBackToStart}
                style={{
                  padding: '12px 24px',
                  background: '#DBFC53',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                📊 Analyze More Videos
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {availableChannels.map(channel => (
              <div 
                key={channel.channelId}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onClick={() => handleChannelSelect(channel)}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                  e.target.style.borderColor = '#DBFC53'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.05)'
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #DBFC53, #A8E063)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginRight: '16px'
                  }}>
                    📺
                  </div>
                  <div>
                    <h3 style={{ 
                      color: 'white', 
                      margin: '0 0 4px 0',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {channel.channelName}
                    </h3>
                    <p style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      {channel.totalVideos} analyzed videos
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      color: '#DBFC53', 
                      fontSize: '20px', 
                      fontWeight: '700' 
                    }}>
                      {channel.totalVideos}
                    </div>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '12px' 
                    }}>
                      Videos
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      color: '#A8E063', 
                      fontSize: '20px', 
                      fontWeight: '700' 
                    }}>
                      {channel.videos ? Math.round((channel.videos.reduce((sum, v) => sum + (v.analysisResults?.viral_factors?.overall_score || v.score || 75), 0) / channel.videos.length)) : 75}
                    </div>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '12px' 
                    }}>
                      Avg Score
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      color: '#3B82F6', 
                      fontSize: '20px', 
                      fontWeight: '700' 
                    }}>
                      {channel.videos?.filter(v => v.analysisResults?.contentInfo?.hasAutoData).length || 0}
                    </div>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '12px' 
                    }}>
                      Real Data
                    </div>
                  </div>
                </div>

                {/* Video Preview List */}
                {channel.videos && channel.videos.length > 0 && (
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      📹 Recent Videos:
                    </div>
                    {channel.videos.slice(0, 3).map((video, idx) => (
                      <div key={idx} style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          flex: 1, 
                          marginRight: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {video.title || `Video ${idx + 1}`}
                        </span>
                        <span style={{
                          color: video.analysisResults?.viral_factors?.overall_score >= 80 ? '#10B981' : '#6B7280',
                          fontWeight: '600'
                        }}>
                          {video.analysisResults?.viral_factors?.overall_score || video.score || 75}
                        </span>
                      </div>
                    ))}
                    {channel.videos.length > 3 && (
                      <div style={{
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.5)',
                        textAlign: 'center',
                        marginTop: '4px'
                      }}>
                        +{channel.videos.length - 3} more videos
                      </div>
                    )}
                  </div>
                )}

                <div style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  Last analyzed: {channel.lastAnalysisDate || 'Recently'}
                </div>

                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#DBFC53',
                  color: '#1A1A1A',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  READY
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 显示频道分析仪表板
  return (
    <div className="channel-dashboard-container">
      {/* 频道信息头部 */}
      <div className="channel-dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button 
            className="back-btn-small" 
            onClick={() => setSelectedChannel(null)}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Channels
          </button>

          {aggregatedData && (
            <div style={{
              background: aggregatedData.metadata.dataQualityScore >= 80 ? '#10B981' : '#F59E0B',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Data Quality: {aggregatedData.metadata.dataQualityScore}%
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
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
            marginRight: '20px'
          }}>
            📺
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 8px 0'
            }}>
              {selectedChannel.channelName}
            </h1>
            <div style={{
              display: 'flex',
              gap: '20px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px'
            }}>
              <span>📊 {selectedChannel.totalVideos} videos analyzed</span>
              {aggregatedData && (
                <span>📅 Generated {new Date(aggregatedData.metadata.analysisDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTopColor: '#DBFC53',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>Analyzing Channel Data...</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Aggregating insights from {selectedChannel.totalVideos} videos
          </p>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #EF4444',
          borderRadius: '12px',
          padding: '16px',
          color: '#EF4444',
          marginBottom: '24px'
        }}>
          ❌ {error}
        </div>
      )}

      {aggregatedData && !loading && (
        <>
          {/* 模块导航 */}
          <div className="modules-navigation" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '24px',
            background: 'rgba(255,255,255,0.05)',
            padding: '12px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                style={{
                  padding: '12px 8px',
                  background: activeModule === module.id ? '#DBFC53' : 'transparent',
                  color: activeModule === module.id ? '#1A1A1A' : 'white',
                  border: activeModule === module.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '12px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => {
                  if (activeModule !== module.id) {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                  }
                }}
                onMouseOut={(e) => {
                  if (activeModule !== module.id) {
                    e.target.style.background = 'transparent'
                  }
                }}
              >
                <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                  {module.icon}
                </div>
                <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
                  {module.name}
                </div>
              </button>
            ))}
          </div>

          {/* 活动模块内容 */}
          <div className="module-content" style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            minHeight: '500px'
          }}>
            {renderModuleContent()}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .channel-dashboard-container {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)';
          minHeight: '100vh';
          padding: '20px';
          color: 'white';
        }
      `}</style>
    </div>
  )
}

export default HitCloneChannelDashboard