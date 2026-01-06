import React, { useState, useEffect } from 'react'

const ChannelBatchInput = ({ onStartAnalysis, onBackToModeSelection, analysisProgress }) => {
  const [formData, setFormData] = useState({
    channelUrl: '',
    videoUrls: ['', '', '']
  })
  const [validation, setValidation] = useState({
    channelUrl: { isValid: false, message: '' },
    videoUrls: [
      { isValid: false, message: '' },
      { isValid: false, message: '' },
      { isValid: false, message: '' }
    ]
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recoveredData, setRecoveredData] = useState(null)
  
  // 数据持久化键名
  const STORAGE_KEYS = {
    INPUT_DATA: 'hitclone_batch_input_data',
    ANALYSIS_STATE: 'hitclone_batch_analysis_state'
  }
  
  // 组件初始化时检查恢复数据
  useEffect(() => {
    const checkRecoveryData = () => {
      try {
        const savedInputData = localStorage.getItem(STORAGE_KEYS.INPUT_DATA)
        const savedAnalysisState = localStorage.getItem(STORAGE_KEYS.ANALYSIS_STATE)
        
        if (savedInputData || savedAnalysisState) {
          const inputData = savedInputData ? JSON.parse(savedInputData) : null
          const analysisState = savedAnalysisState ? JSON.parse(savedAnalysisState) : null
          
          setRecoveredData({
            inputData,
            analysisState,
            timestamp: inputData?.timestamp || null
          })
          
          console.log('🔄 发现可恢复的批量分析数据:', {
            hasInputData: !!inputData,
            hasAnalysisState: !!analysisState,
            timestamp: inputData?.timestamp
          })
        }
      } catch (error) {
        console.error('❌ 恢复数据检查失败:', error)
      }
    }
    
    checkRecoveryData()
  }, [])
  
  // 保存输入数据到本地存储
  const saveInputData = (data) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INPUT_DATA, JSON.stringify(data))
      console.log('💾 输入数据已保存到本地存储')
    } catch (error) {
      console.error('❌ 保存输入数据失败:', error)
    }
  }
  
  // 保存分析状态
  const saveAnalysisState = (state) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_STATE, JSON.stringify(state))
      console.log('💾 分析状态已保存:', state)
    } catch (error) {
      console.error('❌ 保存分析状态失败:', error)
    }
  }
  
  // 清除保存的数据
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.INPUT_DATA)
      localStorage.removeItem(STORAGE_KEYS.ANALYSIS_STATE)
      setRecoveredData(null)
      console.log('🗑️ 已清除保存的数据')
    } catch (error) {
      console.error('❌ 清除数据失败:', error)
    }
  }
  
  // 恢复保存的输入数据
  const recoverInputData = () => {
    if (!recoveredData?.inputData) return
    
    const { channelUrl, videoUrls } = recoveredData.inputData
    
    setFormData({
      channelUrl: channelUrl || '',
      videoUrls: videoUrls || ['', '', '']
    })
    
    // 重新验证所有URL
    if (channelUrl) {
      const channelValidation = validateYouTubeUrl(channelUrl, 'channel')
      setValidation(prev => ({
        ...prev,
        channelUrl: channelValidation
      }))
    }
    
    if (videoUrls) {
      const videoValidations = videoUrls.map(url => 
        url ? validateYouTubeUrl(url, 'video') : { isValid: false, message: '' }
      )
      setValidation(prev => ({
        ...prev,
        videoUrls: videoValidations
      }))
    }
    
    console.log('✅ 输入数据已恢复')
  }

  // 增强的YouTube URL 验证函数
  const validateYouTubeUrl = (url, expectedType = null) => {
    if (!url.trim()) {
      return { isValid: false, message: 'URL is required' }
    }

    // 更完整的频道URL模式
    const channelPatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/channel\/UC[a-zA-Z0-9_-]{22}/, // 标准频道ID
      /^https?:\/\/(www\.)?youtube\.com\/c\/[a-zA-Z0-9_-]+/, // 自定义URL
      /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_.-]+/, // @用户名
      /^https?:\/\/(www\.)?youtube\.com\/user\/[a-zA-Z0-9_-]+/, // 旧式用户URL
      /^https?:\/\/(www\.)?youtube\.com\/[a-zA-Z0-9_-]+$/ // 简短形式
    ]

    // 更完整的视频URL模式
    const videoPatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/, // 标准watch URL
      /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/, // 短链接
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/, // 嵌入链接
      /^https?:\/\/(www\.)?youtube\.com\/v\/[a-zA-Z0-9_-]{11}/ // 旧式v链接
    ]

    const isChannelUrl = channelPatterns.some(pattern => pattern.test(url))
    const isVideoUrl = videoPatterns.some(pattern => pattern.test(url))

    if (!isChannelUrl && !isVideoUrl) {
      return { 
        isValid: false, 
        message: 'Invalid YouTube URL format. Please use a valid YouTube channel or video URL.' 
      }
    }

    // 如果指定了期望类型，验证是否匹配
    if (expectedType === 'channel' && !isChannelUrl) {
      return { 
        isValid: false, 
        message: 'Please enter a YouTube channel URL (e.g., @username or /channel/UC...)' 
      }
    }

    if (expectedType === 'video' && !isVideoUrl) {
      return { 
        isValid: false, 
        message: 'Please enter a YouTube video URL (e.g., /watch?v=... or youtu.be/...)' 
      }
    }

    return { 
      isValid: true, 
      message: '', 
      type: isChannelUrl ? 'channel' : 'video',
      extractedId: extractIdFromUrl(url, isChannelUrl ? 'channel' : 'video')
    }
  }

  // 从URL中提取ID的辅助函数
  const extractIdFromUrl = (url, type) => {
    if (type === 'video') {
      // 提取视频ID
      const match = url.match(/(?:v=|\/embed\/|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      return match ? match[1] : null
    } else {
      // 提取频道ID或用户名
      const channelMatch = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/)
      if (channelMatch) return channelMatch[1]
      
      const usernameMatch = url.match(/@([a-zA-Z0-9_.-]+)/)
      if (usernameMatch) return `@${usernameMatch[1]}`
      
      const customMatch = url.match(/\/c\/([a-zA-Z0-9_-]+)/)
      if (customMatch) return `c/${customMatch[1]}`
      
      const userMatch = url.match(/\/user\/([a-zA-Z0-9_-]+)/)
      if (userMatch) return `user/${userMatch[1]}`
      
      return null
    }
  }

  // 处理频道URL变化
  const handleChannelUrlChange = (value) => {
    setFormData(prev => ({ ...prev, channelUrl: value }))
    
    const validation = validateYouTubeUrl(value, 'channel')
    setValidation(prev => ({
      ...prev,
      channelUrl: validation
    }))
  }

  // 处理视频URL变化
  const handleVideoUrlChange = (index, value) => {
    const newVideoUrls = [...formData.videoUrls]
    newVideoUrls[index] = value
    setFormData(prev => ({ ...prev, videoUrls: newVideoUrls }))

    const validation = validateYouTubeUrl(value, 'video')
    setValidation(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.map((v, i) => i === index ? validation : v)
    }))
  }

  // 检查表单是否有效
  const isFormValid = () => {
    const channelValid = validation.channelUrl.isValid
    const videosValid = validation.videoUrls.every(v => v.isValid)
    return channelValid && videosValid
  }

  // 开始分析 - 增强版数据持久化
  const handleSubmit = async () => {
    if (!isFormValid()) return

    setIsAnalyzing(true)
    
    try {
      const analysisData = {
        mode: 'batch',
        channelUrl: formData.channelUrl,
        videoUrls: formData.videoUrls.filter(url => url.trim()),
        timestamp: new Date().toISOString()
      }

      // 🔥 立即保存输入数据，防止丢失
      saveInputData(analysisData)
      
      // 保存分析开始状态
      saveAnalysisState({
        status: 'starting',
        timestamp: new Date().toISOString(),
        step: 0
      })

      console.log('🚀 开始批量分析:', analysisData)
      console.log('💾 输入数据已安全保存，可随时恢复')
      
      await onStartAnalysis(analysisData)
      
      // 分析成功启动后更新状态
      saveAnalysisState({
        status: 'running',
        timestamp: new Date().toISOString(),
        step: 1
      })
      
    } catch (error) {
      console.error('❌ 批量分析启动失败:', error)
      
      // 保存错误状态但保留输入数据
      saveAnalysisState({
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        step: 0
      })
      
      setIsAnalyzing(false)
      
      // 显示错误恢复选项
      alert('分析启动失败，但输入数据已保存。您可以重试或稍后恢复。')
    }
  }

  // 自动填充示例数据
  const fillExampleData = () => {
    const exampleChannelUrl = 'https://www.youtube.com/@DavidPerell'
    const exampleVideoUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      'https://youtu.be/dQw4w9WgXcQ'
    ]

    setFormData({
      channelUrl: exampleChannelUrl,
      videoUrls: exampleVideoUrls
    })

    // 重新验证所有URL
    const channelValidation = validateYouTubeUrl(exampleChannelUrl, 'channel')
    const videoValidations = exampleVideoUrls.map(url => validateYouTubeUrl(url, 'video'))

    setValidation({
      channelUrl: channelValidation,
      videoUrls: videoValidations
    })
  }

  if (isAnalyzing || analysisProgress?.step > 0) {
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
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTopColor: '#DBFC53',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{ color: 'white', marginBottom: '12px', fontSize: '24px' }}>
            🎯 Batch Analysis in Progress
          </h2>
          
          {/* 进度条 */}
          {analysisProgress && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                height: '8px',
                marginBottom: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#DBFC53',
                  height: '100%',
                  width: `${(analysisProgress.step / analysisProgress.total) * 100}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <p style={{ color: '#DBFC53', fontSize: '14px', fontWeight: '600' }}>
                {analysisProgress.message || `Step ${analysisProgress.step}/${analysisProgress.total}`}
              </p>
            </div>
          )}
          
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '16px' }}>
            This may take a few minutes. Please wait...
          </p>
          
          <div style={{
            background: 'rgba(219, 252, 83, 0.1)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '8px' }}>📺 Channel: {formData.channelUrl}</div>
            <div style={{ marginBottom: '8px' }}>🎬 Videos: {formData.videoUrls.filter(url => url.trim()).length} URLs</div>
            {analysisProgress?.step > 0 && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                Current: {analysisProgress.message}
              </div>
            )}
          </div>
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
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* 页面头部 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button 
            onClick={onBackToModeSelection}
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
            ← Back to Mode Selection
          </button>
          
          {/* 数据恢复提示 */}
          {recoveredData && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={recoverInputData}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(219, 252, 83, 0.1)',
                  border: '1px solid rgba(219, 252, 83, 0.3)',
                  borderRadius: '6px',
                  color: '#DBFC53',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🔄 恢复上次输入
              </button>
              <button
                onClick={clearSavedData}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🗑️ 清除
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '12px'
          }}>
            🎯 Batch Analysis Mode
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '8px'
          }}>
            Input Channel URL + 3 Video URLs for Complete Analysis
          </p>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            We'll analyze the channel profile and 3 specific videos to generate comprehensive insights
          </p>
        </div>

        {/* 输入表单 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '32px'
        }}>
          {/* 频道URL输入 */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#DBFC53',
              marginBottom: '8px'
            }}>
              📺 YouTube Channel URL
            </label>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '12px'
            }}>
              Enter the main channel URL (e.g., @username or /channel/ID)
            </p>
            <input
              type="text"
              value={formData.channelUrl}
              onChange={(e) => handleChannelUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/@DavidPerell"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: `1px solid ${validation.channelUrl.isValid ? '#10B981' : validation.channelUrl.message && !validation.channelUrl.isValid ? '#EF4444' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {validation.channelUrl.message && (
              <p style={{
                fontSize: '12px',
                color: validation.channelUrl.isValid ? '#10B981' : '#EF4444',
                marginTop: '4px'
              }}>
                {validation.channelUrl.isValid ? '✅ Valid channel URL' : `❌ ${validation.channelUrl.message}`}
              </p>
            )}
          </div>

          {/* 视频URLs输入 */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#DBFC53',
              marginBottom: '8px'
            }}>
              🎬 3 Video URLs from This Channel
            </label>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '16px'
            }}>
              Provide 3 specific video URLs for detailed analysis
            </p>

            {formData.videoUrls.map((url, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '6px'
                }}>
                  Video {index + 1}
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                  placeholder={`https://www.youtube.com/watch?v=example${index + 1}`}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.08)',
                    border: `1px solid ${validation.videoUrls[index]?.isValid ? '#10B981' : validation.videoUrls[index]?.message && !validation.videoUrls[index]?.isValid ? '#EF4444' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                {validation.videoUrls[index]?.message && (
                  <p style={{
                    fontSize: '12px',
                    color: validation.videoUrls[index]?.isValid ? '#10B981' : '#EF4444',
                    marginTop: '4px'
                  }}>
                    {validation.videoUrls[index]?.isValid ? '✅ Valid video URL' : `❌ ${validation.videoUrls[index]?.message}`}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={fillExampleData}
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
              📝 Fill Example Data
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              style={{
                padding: '12px 32px',
                background: isFormValid() ? '#DBFC53' : 'rgba(107, 114, 128, 0.5)',
                border: 'none',
                borderRadius: '8px',
                color: isFormValid() ? '#1A1A1A' : 'rgba(255,255,255,0.5)',
                cursor: isFormValid() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.2s ease'
              }}
            >
              🚀 Start Batch Analysis
            </button>
          </div>

          {/* 表单状态指示 */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px'
            }}>
              📋 Analysis Checklist:
            </h4>
            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ 
                color: validation.channelUrl.isValid ? '#10B981' : '#6B7280',
                marginBottom: '4px'
              }}>
                {validation.channelUrl.isValid ? '✅' : '⏳'} Valid channel URL provided
              </div>
              <div style={{ 
                color: validation.videoUrls.filter(v => v.isValid).length === 3 ? '#10B981' : '#6B7280',
                marginBottom: '4px'
              }}>
                {validation.videoUrls.filter(v => v.isValid).length === 3 ? '✅' : '⏳'} 3 valid video URLs provided ({validation.videoUrls.filter(v => v.isValid).length}/3)
              </div>
              <div style={{ 
                color: isFormValid() ? '#10B981' : '#6B7280'
              }}>
                {isFormValid() ? '✅' : '⏳'} Ready for comprehensive channel analysis
              </div>
            </div>
          </div>
        </div>

        {/* 帮助信息 */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(219, 252, 83, 0.05)',
          border: '1px solid rgba(219, 252, 83, 0.1)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#DBFC53',
            marginBottom: '12px'
          }}>
            💡 Tips for Best Results:
          </h4>
          <ul style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: '1.6',
            paddingLeft: '20px',
            margin: 0
          }}>
            <li>Choose videos from different time periods to see evolution</li>
            <li>Select videos with varying performance levels</li>
            <li>Include both popular and typical videos for balanced insights</li>
            <li>Make sure all URLs are from the same channel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ChannelBatchInput