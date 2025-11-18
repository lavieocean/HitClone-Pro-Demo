import React, { useState, useRef, useEffect } from 'react'
import { SRTParser } from '../../utils/srtParser'
import { DebugHelper } from '../../utils/debugHelper'
import youTubeDataService from '../../services/youTubeDataService'
import popularCasesService from '../../services/popularCasesService'
import DemoVideoSelector from '../DemoVideoSelector'
import demoDataService from '../../services/demoDataService'

const HitCloneStart = ({ onAnalyze }) => {
  const [url, setUrl] = useState('')
  const [srtFile, setSrtFile] = useState(null)
  const [srtContent, setSrtContent] = useState(null)
  const [inputMode, setInputMode] = useState('url') // url, srt
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  
  // YouTube自动抓取相关状态
  const [fetchingData, setFetchingData] = useState(false)
  const [videoData, setVideoData] = useState(null)
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(true)
  const [ytSrtContent, setYtSrtContent] = useState(null)
  const [autoAnalysisTriggered, setAutoAnalysisTriggered] = useState(false) // 跟踪是否已自动触发分析

  // 动态热门案例状态
  const [popularCases, setPopularCases] = useState([])
  const [stats, setStats] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // 组件挂载时的调试信息和加载热门案例
  useEffect(() => {
    console.log('🏠 HitCloneStart组件已挂载')
    console.log('🔧 初始状态:', {
      autoFetchEnabled,
      url: url || '(空)',
      inputMode
    })
    
    // 加载热门案例和统计信息
    loadPopularCases()
  }, [])

  // 加载热门案例
  const loadPopularCases = () => {
    try {
      console.log('🔥 开始加载热门案例...')
      const cases = popularCasesService.getPopularCases(6)
      const statistics = popularCasesService.getStats()
      
      setPopularCases(cases)
      setStats(statistics)
      
      console.log('✅ 热门案例加载完成:', {
        casesCount: cases.length,
        stats: statistics
      })
    } catch (error) {
      console.error('❌ 加载热门案例失败:', error)
      // 失败时使用空数组，避免崩溃
      setPopularCases([])
    }
  }

  // 刷新热门案例
  const refreshPopularCases = async () => {
    setRefreshing(true)
    try {
      // 清除缓存
      popularCasesService.clearCache()
      // 重新加载
      loadPopularCases()
      
      console.log('🔄 热门案例已刷新')
    } catch (error) {
      console.error('❌ 刷新热门案例失败:', error)
    } finally {
      setTimeout(() => setRefreshing(false), 500) // 延迟500ms显示动画效果
    }
  }

  // URL变化时自动抓取YouTube数据
  useEffect(() => {
    // 🔄 URL变化时重置相关状态
    setAutoAnalysisTriggered(false) // 重置自动分析状态
    setVideoData(null) // 清除之前的视频数据
    setYtSrtContent(null) // 清除之前的字幕数据
    setError('') // 清除错误状态
    
    if (!url.trim() || !isYouTubeUrl(url.trim()) || !autoFetchEnabled) {
      console.log('⏭️ 跳过自动抓取:', { 
        hasUrl: !!url.trim(), 
        isYoutube: isYouTubeUrl(url.trim()), 
        autoEnabled: autoFetchEnabled 
      })
      return
    }

    console.log('⏰ 设置0.5秒延迟，准备自动抓取:', url.trim())
    const timeoutId = setTimeout(() => {
      console.log('🎯 延迟结束，开始自动抓取:', url.trim())
      handleAutoFetch(url.trim())
    }, 500)

    return () => {
      console.log('🚫 清除抓取延迟计时器')
      clearTimeout(timeoutId)
    }
  }, [url, autoFetchEnabled])

  // 检查是否为YouTube URL
  const isYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  // 自动抓取YouTube数据
  const handleAutoFetch = async (videoUrl) => {
    if (!autoFetchEnabled || !isYouTubeUrl(videoUrl)) {
      return
    }

    setFetchingData(true)
    setError('')
    
    try {
      console.log('🤖 开始自动抓取YouTube数据...')
      const result = await youTubeDataService.fetchVideoData(videoUrl)
      
      if (result.success) {
        setVideoData(result.data)
        
        if (result.data.hasSubtitles && result.data.srtContent) {
          setYtSrtContent(result.data.srtContent)
          console.log('✅ 自动获取字幕成功，长度:', result.data.srtContent.length)
          
          // 🚀 自动触发分析流程（防重复）
          if (!autoAnalysisTriggered) {
            console.log('🎯 字幕获取成功，自动开始分析...')
            setAutoAnalysisTriggered(true) // 标记已触发自动分析
            
            // 构建分析数据
            const analyzeData = {
              type: 'url',
              data: videoUrl,
              videoData: result.data,
              autoFetched: true,
              hasValidSubtitles: true
            }
            
            // 短暂延迟，让用户看到成功状态
            setTimeout(async () => {
              console.log('🚀 自动触发分析:', analyzeData)
              await onAnalyze(analyzeData)
            }, 1000)
          } else {
            console.log('⏭️ 已自动触发过分析，跳过重复触发')
          }
          
        } else {
          console.warn('⚠️ 未能获取字幕文件')
          setError('未能获取字幕，请手动点击分析按钮或上传SRT文件')
        }
        
        console.log('✅ YouTube数据抓取成功')
      } else {
        console.warn('⚠️ YouTube数据抓取失败:', result.error)
        setError(`字幕自动获取失败: ${result.error}。您仍然可以点击"分析"按钮进行基础分析，或上传SRT字幕文件以获得更准确的结果。`)
      }
    } catch (error) {
      console.error('❌ YouTube数据抓取失败:', error)
      setError(`自动抓取失败: ${error.message}`)
    } finally {
      setFetchingData(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // 🚫 防止重复分析：如果正在加载或已经自动触发过，跳过重复操作
    if (loading || fetchingData) {
      console.log('⏭️ 分析已在进行中，跳过重复提交')
      return
    }
    
    setLoading(true)

    try {
      if (inputMode === 'url') {
        if (!url.trim()) {
          setError('请输入视频URL')
          return
        }
        
        // 🔍 检查是否有真实的YouTube数据
        const hasRealData = videoData && videoData.title !== 'YouTube视频分析' && videoData.videoId !== 'unknown'
        
        // 🔧 优化：如果已经自动触发过分析且有真实数据，直接使用现有数据
        if (autoAnalysisTriggered && hasRealData && ytSrtContent) {
          console.log('✅ 已有完整数据，直接使用现有数据进行分析')
          
          const analyzeData = {
            type: 'url',
            data: url.trim(),
            videoData: videoData,
            autoFetched: true,
            hasValidSubtitles: true,
            dataQuality: 'real'
          }
          
          console.log('🚀 准备发送数据到分析器:', analyzeData)
          await onAnalyze(analyzeData)
          return
        }
        
        // 如果没有真实数据，强制获取
        if (!hasRealData && isYouTubeUrl(url.trim())) {
          console.log('🚀 没有真实数据，强制获取YouTube信息...')
          setFetchingData(true)
          
          try {
            const result = await youTubeDataService.fetchVideoData(url.trim())
            if (result.success) {
              setVideoData(result.data)
              if (result.data.srtContent) {
                setYtSrtContent(result.data.srtContent)
              }
              console.log('✅ 强制获取YouTube数据成功')
            } else {
              console.warn('⚠️ 强制获取失败，使用基础信息:', result.error)
            }
          } catch (error) {
            console.error('❌ 强制获取YouTube数据失败:', error)
          } finally {
            setFetchingData(false)
          }
        }
        
        // ✅ 智能字幕检查 - 允许无字幕分析
        const hasValidSubtitles = ytSrtContent && ytSrtContent.trim().length > 0
        if (!hasValidSubtitles) {
          console.warn('⚠️ 没有字幕内容，将使用基础视频信息进行分析')
        }
        
        console.log('✅ 开始分析，字幕状态:', hasValidSubtitles ? '有字幕' : '无字幕')
        console.log('📝 字幕内容长度:', ytSrtContent ? ytSrtContent.length : 0)
        // 重新检查数据质量（可能在强制获取后已更新）
        const finalHasRealData = videoData && videoData.title !== 'YouTube视频分析' && videoData.videoId !== 'unknown'
        console.log('📊 最终数据质量:', finalHasRealData ? '真实数据' : '基础数据')
        
        // 构建包含视频数据的分析对象
        let finalVideoData = videoData || {
          url: url,
          videoId: 'unknown',
          title: `YouTube视频分析`,
          channelName: '未知频道',
          description: hasValidSubtitles ? '基于字幕内容进行分析' : '基于视频基础信息进行分析',
          viewCount: '未知观看数',
          publishDate: '未知日期'
        }
        
        // 添加字幕数据（如果有的话）
        if (hasValidSubtitles) {
          finalVideoData.srtContent = ytSrtContent
          finalVideoData.hasSubtitles = true
        } else {
          finalVideoData.hasSubtitles = false
          // 添加无字幕分析标记
          finalVideoData.analysisMode = 'no-subtitles'
        }
        
        const analyzeData = {
          type: 'url', 
          data: url,
          videoData: finalVideoData,
          autoFetched: !!videoData,
          hasValidSubtitles: hasValidSubtitles,
          dataQuality: finalHasRealData ? 'real' : 'basic', // 添加数据质量标识
          forceRealData: true // 标识要求使用真实数据
        }
        
        console.log('🚀 准备发送数据到分析器:', analyzeData)
        await onAnalyze(analyzeData)
        
      } else if (inputMode === 'srt') {
        if (!srtContent) {
          setError('请上传SRT字幕文件')
          return
        }
        await onAnalyze({ 
          type: 'srt', 
          data: srtContent,
          fileName: srtFile?.name
        })
      }
    } catch (err) {
      setError('分析启动失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.srt')) {
      setError('请选择SRT格式的字幕文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('文件大小不能超过5MB')
      return
    }

    setSrtFile(file)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        const subtitles = SRTParser.parseSRT(content)
        
        if (subtitles.length === 0) {
          setError('SRT文件格式错误或为空')
          return
        }

        const analysisData = SRTParser.getAnalysisData(subtitles)
        setSrtContent({ subtitles, analysisData })
      } catch (err) {
        setError('SRT文件解析失败，请检查文件格式')
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // 加载案例报告
  const loadCaseReport = (caseItem) => {
    console.log('📊 加载案例报告:', caseItem.title)
    
    // 如果是真实的分析报告，直接加载
    if (caseItem.analysisResults) {
      onAnalyze({ 
        type: 'saved_report', 
        analysisResults: caseItem.analysisResults,
        data: {
          title: caseItem.title,
          channel: caseItem.channel,
          views: caseItem.views,
          score: caseItem.score || caseItem.calculatedScore
        }
      })
    } else {
      // 如果是备用案例，生成示例报告
      onAnalyze({ 
        type: 'example', 
        data: {
          title: caseItem.title,
          channel: caseItem.channel,
          views: caseItem.views,
          score: caseItem.score
        }
      })
    }
  }

  // 处理演示视频选择
  const handleDemoSelect = async (demoAnalysisPackage) => {
    console.log('🎬 演示视频被选中:', demoAnalysisPackage)
    await onAnalyze(demoAnalysisPackage)
  }

  return (
    <div className="hitclone-start fade-in">
      <div className="start-header fade-in">
        <h1 className="start-title">HitClone Pro</h1>
        <p className="start-subtitle">AI驱动的内容结构分析，揭示爆款视频的成功密码</p>
      </div>
      
      {/* 演示视频选择器 */}
      <DemoVideoSelector onSelectDemo={handleDemoSelect} />
      
      <div className="start-input-section fade-in">
        <div className="input-mode-selector">
          <button 
            className={`mode-btn ${inputMode === 'url' ? 'active' : ''}`}
            onClick={() => setInputMode('url')}
          >
            🔗 视频链接分析
          </button>
          <button 
            className={`mode-btn ${inputMode === 'srt' ? 'active' : ''}`}
            onClick={() => setInputMode('srt')}
          >
            📄 SRT字幕分析
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {inputMode === 'url' ? (
            <div>
              <h3 className="input-title">开始分析您的YouTube视频</h3>
              
              {/* 自动抓取状态提示 */}
              {fetchingData && (
                <div className="auto-fetch-status" style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div className="spinner" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    borderTopColor: '#10B981',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  <span style={{ color: '#10B981' }}>正在获取视频数据和字幕...</span>
                </div>
              )}
              
              {/* 自动分析即将开始提示 */}
              {videoData && ytSrtContent && !fetchingData && (
                <div className="auto-analysis-notice" style={{
                  background: 'rgba(219, 252, 83, 0.1)',
                  border: '1px solid rgba(219, 252, 83, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  color: '#DBFC53'
                }}>
                  ✅ 字幕获取成功！自动分析即将开始...
                </div>
              )}
              
              <div className="input-group">
                <input 
                  type="text" 
                  className="url-input" 
                  placeholder="粘贴YouTube视频链接..." 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading || fetchingData}
                />
                <button 
                  type="submit"
                  className="analyze-btn"
                  disabled={loading || !url.trim() || fetchingData}
                >
                  {fetchingData ? (
                    <>
                      <div className="spinner"></div>
                      <span>获取数据中...</span>
                    </>
                  ) : loading ? (
                    <>
                      <div className="spinner"></div>
                      <span>分析中...</span>
                    </>
                  ) : ytSrtContent ? (
                    <>
                      <span>✅ 手动分析</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 开始分析</span>
                    </>
                  )}
                </button>
              </div>
              <p className="input-help">
                支持YouTube视频URL · 消耗50积分 · 约需2-3分钟
              </p>
            </div>
          ) : (
            <div>
              <h3 className="input-title">上传SRT字幕文件进行分析</h3>
              <div 
                className={`srt-upload-zone ${dragOver ? 'dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-content">
                  <div className="upload-icon">📄</div>
                  <h4 className="upload-title">
                    {srtFile ? srtFile.name : '拖拽或点击上传SRT文件'}
                  </h4>
                  <p className="upload-desc">
                    支持 .srt 格式，最大 5MB
                  </p>
                  
                  {srtContent && (
                    <div className="srt-preview">
                      <div className="preview-stats">
                        <div className="stat-item">
                          <span className="stat-value">{srtContent.analysisData.totalSubtitles}</span>
                          <span className="stat-label">字幕条数</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">
                            {DebugHelper.safeToFixed(srtContent.analysisData.totalDuration / 60, 1, 'HitCloneStart-duration')}分
                          </span>
                          <span className="stat-label">总时长</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{srtContent.analysisData.totalWords}</span>
                          <span className="stat-label">总词数</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">
                            {DebugHelper.safeToFixed(srtContent.analysisData.avgWordsPerMinute, 1, 'HitCloneStart-wpm')}
                          </span>
                          <span className="stat-label">词/分钟</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".srt"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              <button 
                type="submit"
                className="analyze-btn full-width"
                disabled={loading || !srtContent}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>AI分析中...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 开始AI分析</span>
                  </>
                )}
              </button>
              
              <p className="input-help">
                SRT字幕分析 · 消耗30积分 · 约需1-2分钟
              </p>
            </div>
          )}
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <div className="examples-section fade-in">
        <div className="examples-header">
          <div className="examples-title-group">
            <h2 className="examples-title">🔥 热门分析案例</h2>
            {stats && (
              <p className="examples-subtitle">
                已分析 {stats.totalAnalyses} 个视频 · 平均评分 {stats.averageScore} 分
                {stats.totalChannels > 0 && ` · 覆盖 ${stats.totalChannels} 个频道`}
              </p>
            )}
          </div>
          <button 
            className="refresh-btn"
            onClick={refreshPopularCases}
            disabled={refreshing}
            style={{
              padding: '8px 16px',
              background: refreshing ? 'rgba(255,255,255,0.1)' : 'rgba(219,252,83,0.1)',
              border: '1px solid rgba(219,252,83,0.3)',
              borderRadius: '8px',
              color: '#DBFC53',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s'
            }}
          >
            <span style={{ 
              display: 'inline-block',
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}>
              🔄
            </span>
            {refreshing ? '刷新中...' : '换一批'}
          </button>
        </div>
        
        <div className="examples-grid">
          {popularCases.map((caseItem, index) => (
            <div 
              key={caseItem.id || index}
              className="example-card enhanced" 
              onClick={() => loadCaseReport(caseItem)}
            >
              {/* 缩略图区域 */}
              <div className="example-thumbnail-wrapper">
                {caseItem.analysisResults?.contentInfo?.thumbnails ? (
                  <img 
                    src={caseItem.analysisResults.contentInfo.thumbnails.medium || 
                         caseItem.analysisResults.contentInfo.thumbnails.high ||
                         caseItem.analysisResults.contentInfo.thumbnails.default}
                    alt={caseItem.title}
                    className="example-thumbnail-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className="example-thumbnail-fallback"
                  style={{ 
                    display: caseItem.analysisResults?.contentInfo?.thumbnails ? 'none' : 'flex'
                  }}
                >
                  {caseItem.thumbnail || '🎥'}
                </div>
                
                {/* 评分标识 */}
                {(caseItem.score || caseItem.calculatedScore) && (
                  <div className="case-score">
                    {caseItem.score || caseItem.calculatedScore}
                  </div>
                )}
                
                {/* 动态标签 */}
                {caseItem.tags && caseItem.tags.length > 0 && (
                  <div className="case-tags">
                    {caseItem.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="case-tag"
                        style={{
                          background: tag.color || '#DBFC53',
                          color: '#000'
                        }}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 信息区域 */}
              <div className="example-info">
                <div className="example-title">{caseItem.title}</div>
                <div className="example-meta">
                  <span>{caseItem.channel} · {caseItem.views}</span>
                  {caseItem.timeAgo && (
                    <span className="time-ago"> · {caseItem.timeAgo}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {popularCases.length === 0 && (
          <div className="no-cases-placeholder">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3>暂无分析案例</h3>
            <p>开始分析您的第一个视频，让这里变得热闹起来！</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HitCloneStart