import React, { useState, useRef, useEffect } from 'react'
import { Link, Upload, AlertCircle, FileText, Play, Zap, Download, CheckCircle } from 'lucide-react'
import { SRTParser } from '../utils/srtParser'
import { DebugHelper } from '../utils/debugHelper'
import youTubeDataService from '../services/youTubeDataService'

const VideoInput = ({ onAnalyze }) => {
  const [url, setUrl] = useState('')
  const [srtFile, setSrtFile] = useState(null)
  const [srtContent, setSrtContent] = useState(null)
  const [srtPreview, setSrtPreview] = useState(null)
  const [srtUrl, setSrtUrl] = useState('') // 新增：SRT对应的YouTube URL
  const [activeTab, setActiveTab] = useState('url') // 'url' or 'srt'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  
  // YouTube自动抓取相关状态
  const [fetchingData, setFetchingData] = useState(false)
  const [videoData, setVideoData] = useState(null)
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(true)
  
  // 调试状态
  const [debugInfo, setDebugInfo] = useState('')
  
  // 智能字幕处理状态
  const [showSubtitleUploadModal, setShowSubtitleUploadModal] = useState(false)
  const [subtitleFetchFailed, setSubtitleFetchFailed] = useState(false)
  const [autoPromptShown, setAutoPromptShown] = useState(false) // 防止重复弹窗

  // 组件挂载时的调试信息
  useEffect(() => {
    console.log('🎬 VideoInput组件已挂载')
    console.log('🔧 初始状态:', {
      autoFetchEnabled,
      url: url || '(空)',
      activeTab
    })
    setDebugInfo(`组件初始化 - 自动抓取: ${autoFetchEnabled ? '启用' : '禁用'}`)
  }, [])

  const validateUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    const bilibiliRegex = /^(https?:\/\/)?(www\.)?bilibili\.com\/.+/
    return youtubeRegex.test(url) || bilibiliRegex.test(url)
  }

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
        
        // 如果抓取到了字幕，自动填充SRT相关数据
        if (result.data.hasSubtitles && result.data.srtContent) {
          try {
            const subtitles = SRTParser.parseSRT(result.data.srtContent)
            const analysisData = SRTParser.getAnalysisData(subtitles)
            const preview = SRTParser.generatePreview(subtitles)
            
            setSrtContent({ subtitles, analysisData })
            setSrtPreview(preview)
            
            // 创建虚拟SRT文件对象
            setSrtFile({
              name: `${result.data.title?.substring(0, 30) || 'video'}_auto.srt`,
              size: result.data.srtContent.length,
              type: 'text/srt'
            })
            
            setSubtitleFetchFailed(false)
            console.log('✅ 自动获取字幕成功')
          } catch (srtError) {
            console.warn('字幕解析失败:', srtError)
            setSubtitleFetchFailed(true)
            
            // 延迟3秒后自动显示上传提示
            setTimeout(() => {
              if (!autoPromptShown) {
                setShowSubtitleUploadModal(true)
                setAutoPromptShown(true)
              }
            }, 3000)
          }
        } else {
          // 如果没有获取到字幕，标记为失败
          console.warn('⚠️ 未能获取字幕文件')
          setSubtitleFetchFailed(true)
          
          // 延迟3秒后自动显示上传提示
          setTimeout(() => {
            if (!autoPromptShown) {
              setShowSubtitleUploadModal(true)
              setAutoPromptShown(true)
            }
          }, 3000)
        }
        
        console.log('✅ YouTube数据抓取成功')
        console.log('📺 抓取到的videoData:', result.data)
      } else {
        console.warn('⚠️ YouTube数据抓取部分失败:', result.error)
        // 即使失败也保存部分数据
        if (result.fallbackData) {
          setVideoData(result.fallbackData)
          console.log('📺 使用fallback数据:', result.fallbackData)
        }
        // 显示友好的错误提示，但不阻止分析
        setError(`⚠️ ${result.error}，但仍可进行基础分析`)
        setSubtitleFetchFailed(true)
        
        // 延迟3秒后自动显示上传提示
        setTimeout(() => {
          if (!autoPromptShown) {
            setShowSubtitleUploadModal(true)
            setAutoPromptShown(true)
          }
        }, 3000)
      }
    } catch (error) {
      console.error('❌ YouTube数据抓取失败:', error)
      setError(`自动抓取失败: ${error.message}`)
    } finally {
      setFetchingData(false)
    }
  }

  // URL输入变化处理（使用useEffect实现防抖）
  const handleUrlChange = (newUrl) => {
    console.log('🔄 URL变化:', newUrl)
    
    const isValid = validateUrl(newUrl.trim())
    const isYoutube = isYouTubeUrl(newUrl.trim())
    
    console.log('🔍 URL验证结果:', {
      url: newUrl.trim(),
      isValid,
      isYoutube,
      autoFetchEnabled
    })
    
    setDebugInfo(`URL变化: ${newUrl.substring(0, 50)}... | 有效: ${isValid} | YouTube: ${isYoutube}`)
    
    // 清除所有相关状态
    setUrl(newUrl)
    setVideoData(null)
    setSrtContent(null)
    setSrtPreview(null)
    setSrtFile(null)
    setSubtitleFetchFailed(false)
    setAutoPromptShown(false)
    setShowSubtitleUploadModal(false)
    setError('')
    
    // 清除YouTube服务的缓存
    if (newUrl.trim() && validateUrl(newUrl.trim())) {
      try {
        youTubeDataService.clearCache(newUrl.trim())
        console.log('🧹 已清除YouTube缓存')
      } catch (e) {
        console.warn('清除缓存失败:', e)
      }
    }
    
    console.log('✅ 状态已重置，准备处理新URL')
  }

  // 手动强制抓取（用于调试）
  const handleManualFetch = async () => {
    if (!url.trim()) {
      setError('请先输入YouTube URL')
      return
    }
    
    if (!validateUrl(url.trim())) {
      setError('URL格式无效')
      return
    }
    
    console.log('🚀 手动强制抓取:', url.trim())
    setDebugInfo(`手动抓取: ${url.trim()}`)
    await handleAutoFetch(url.trim())
  }

  // 防抖处理自动抓取
  useEffect(() => {
    if (!url.trim() || !validateUrl(url.trim()) || !autoFetchEnabled) {
      console.log('⏭️ 跳过自动抓取:', { 
        hasUrl: !!url.trim(), 
        isValid: validateUrl(url.trim()), 
        autoEnabled: autoFetchEnabled 
      })
      return
    }

    console.log('⏰ 设置1.5秒延迟，准备自动抓取:', url.trim())
    const timeoutId = setTimeout(() => {
      console.log('🎯 延迟结束，开始自动抓取:', url.trim())
      handleAutoFetch(url.trim())
    }, 1500) // 1.5秒延迟

    return () => {
      console.log('🚫 清除抓取延迟计时器')
      clearTimeout(timeoutId)
    }
  }, [url, autoFetchEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (activeTab === 'url') {
      if (!url.trim()) {
        setError('请输入视频URL')
        return
      }
      
      if (!validateUrl(url)) {
        setError('请输入有效的YouTube或Bilibili视频URL')
        return
      }
      
      // 🚨 改进的字幕检查逻辑 - 同时处理对象和字符串数据
      const hasValidSubtitles = (
        (srtContent && srtContent.subtitles && Array.isArray(srtContent.subtitles) && srtContent.subtitles.length > 0) || // 从SRT文件解析的字幕对象
        (videoData && videoData.srtContent && typeof videoData.srtContent === 'string' && videoData.srtContent.trim().length > 0) // 从YouTube服务获取的字幕字符串
      )
      
      console.log('🔍 字幕状态检查:', {
        srtContentType: typeof srtContent,
        srtContentSubtitles: srtContent?.subtitles?.length || 0,
        videoDataSrtContent: videoData?.srtContent?.length || 0,
        hasSubtitles: !!srtContent,
        videoDataHasSubtitles: videoData?.hasSubtitles,
        subtitleFetchFailed,
        hasValidSubtitles,
        canProceed: hasValidSubtitles || !!url.trim() // 允许基于URL的基础分析
      })
      
      if (!hasValidSubtitles && !url.trim()) {
        setError('❌ 需要视频URL或字幕内容进行分析')
        console.warn('🚫 阻止分析: 没有URL也没有字幕内容')
        return
      }
      
      // 如果没有字幕但有URL，给出友好提示但仍允许分析
      if (!hasValidSubtitles) {
        console.warn('⚠️ 进行无字幕分析: 基于URL元数据')
        setError('') // 清除任何之前的错误
      }
      
      console.log('✅ 字幕检查通过，开始分析')
      console.log('📝 字幕内容统计:', {
        srtContentSubtitles: srtContent?.subtitles?.length || 0,
        videoDataSrtContentLength: videoData?.srtContent?.length || 0
      })
      
      setLoading(true)
      try {
        // 如果没有抓取到数据，基于当前URL创建基础数据
        let finalVideoData = videoData
        if (!videoData) {
          // 从当前URL提取videoId作为基础数据
          const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
          const videoId = videoIdMatch ? videoIdMatch[1] : 'unknown'
          
          finalVideoData = {
            url: url,
            videoId: videoId,
            title: `YouTube视频分析 ${videoId}`,
            channelName: '未知频道',
            description: '基于URL进行推断分析，建议上传SRT字幕以获得更准确的结果。',
            viewCount: '未知观看数',
            publishDate: '未知日期',
            hasSubtitles: true // 标记为有字幕，因为有SRT内容
          }
          console.log('🔍 基于当前URL创建基础数据:', finalVideoData)
          console.log('🔗 当前分析的URL:', url)
        }
        
        // 确保字幕数据正确嵌入到videoData中
        if (srtContent && srtContent.subtitles) {
          // 如果是从SRT文件解析的字幕，转换为字符串格式
          const srtString = srtContent.subtitles.map((sub, index) => 
            `${index + 1}\n${sub.startTime} --> ${sub.endTime}\n${sub.text}\n`
          ).join('\n')
          finalVideoData.srtContent = srtString
          finalVideoData.hasSubtitles = true
        } else if (videoData && videoData.srtContent) {
          // 如果是从YouTube服务获取的字幕，直接使用
          finalVideoData.srtContent = videoData.srtContent
          finalVideoData.hasSubtitles = true
        } else {
          // 即使没有字幕，也明确标记状态
          finalVideoData.srtContent = null
          finalVideoData.hasSubtitles = false
        }
        
        const analyzeData = {
          type: 'url', 
          data: finalVideoData, // 🔧 直接传递完整的视频数据对象
          url: url, // 保留原始URL
          autoFetched: !!videoData, // 只有真正抓取成功才标记为true
          hasValidSubtitles: hasValidSubtitles, // 真实反映字幕状态
          masterPromptVersion: '2.2' // 🔧 明确标记使用Master Prompt v2.2
        }
        
        console.log('🚀 准备发送数据到分析器:', analyzeData)
        await onAnalyze(analyzeData)
      } catch (err) {
        setError('分析启动失败，请重试')
      } finally {
        setLoading(false)
      }
    } else if (activeTab === 'srt') {
      if (!srtContent) {
        setError('请上传SRT字幕文件')
        return
      }
      
      // 验证YouTube URL（如果提供了）
      if (srtUrl.trim() && !validateUrl(srtUrl.trim())) {
        setError('请输入有效的YouTube或Bilibili视频URL')
        return
      }
      
      setLoading(true)
      try {
        await onAnalyze({ 
          type: 'srt', 
          data: srtContent,
          fileName: srtFile?.name,
          preview: srtPreview,
          associatedUrl: srtUrl.trim() || null, // 关联的视频URL
          masterPromptVersion: '2.2' // 🔧 明确标记使用Master Prompt v2.2
        })
      } catch (err) {
        setError('SRT文件分析失败，请重试')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFileSelect = (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.srt')) {
      setError('请选择SRT格式的字幕文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB限制
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
        const preview = SRTParser.generatePreview(subtitles)
        
        setSrtContent({ subtitles, analysisData })
        setSrtPreview(preview)
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

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-lime-400 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-gray-900" />
          </div>
          <h2 className="text-4xl font-bold glow-text">
            HitClone Pro
          </h2>
        </div>
        <p className="text-xl text-gray-300 mb-2">
          AI驱动的内容分析工具
        </p>
        <p className="text-gray-400">
          支持视频链接分析和SRT字幕文件上传
        </p>
      </div>

      {/* 标签页切换 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800/50 p-1 rounded-2xl border border-gray-700">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'url' 
                ? 'bg-lime-400 text-gray-900 shadow-lg' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>视频链接</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('srt')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'srt' 
                ? 'bg-lime-400 text-gray-900 shadow-lg' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>SRT字幕</span>
            </div>
          </button>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'url' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-200 mb-3">
                  视频URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="url"
                    id="videoUrl"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... 或 https://www.bilibili.com/..."
                    className="input-field pl-12"
                    disabled={loading || fetchingData}
                  />
                </div>
                
                {/* 调试信息和手动控制 */}
                {url && url.trim() && (
                  <div className="mt-3 space-y-2">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleManualFetch}
                        disabled={fetchingData || loading}
                        className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        🚀 强制抓取
                      </button>
                      <button
                        type="button"
                        onClick={() => setAutoFetchEnabled(!autoFetchEnabled)}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          autoFetchEnabled 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                      >
                        自动抓取: {autoFetchEnabled ? '开' : '关'}
                      </button>
                    </div>
                    {debugInfo && (
                      <div className="text-xs text-gray-400 bg-gray-800/50 rounded px-2 py-1">
                        🔍 {debugInfo}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 自动抓取状态 */}
                {fetchingData && (
                  <div className="mt-4 p-3 bg-blue-900/20 rounded-xl border border-blue-700/30">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Download className="w-4 h-4 animate-spin" />
                      <span className="text-sm">正在自动抓取视频信息和字幕...</span>
                    </div>
                  </div>
                )}
                
                {/* 抓取成功的视频信息预览 */}
                {videoData && !fetchingData && (
                  <div className="mt-4 p-4 bg-green-900/20 rounded-xl border border-green-700/30">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-400 mb-2">✅ 自动抓取成功</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>
                            <span className="text-gray-400">标题：</span>
                            <span>{videoData.title || '未获取到标题'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">频道：</span>
                            <span>{videoData.channelName || '未知频道'}</span>
                          </div>
                          {videoData.viewCount && (
                            <div>
                              <span className="text-gray-400">观看数：</span>
                              <span>{videoData.viewCount}</span>
                            </div>
                          )}
                          {videoData.hasSubtitles ? (
                            <div className="text-green-400">
                              🎬 已自动获取字幕文件
                            </div>
                          ) : (
                            <div className="text-yellow-400">
                              ⚠️ 未获取到字幕文件
                            </div>
                          )}
                        </div>
                        
                        {/* 字幕状态提示 */}
                        {(srtContent && srtContent.subtitles) || (videoData.srtContent) ? (
                          <div className="mt-3 p-2 bg-lime-400/10 rounded-lg border border-lime-400/20">
                            <p className="text-xs text-lime-400">
                              ✅ 字幕已准备就绪 ({
                                srtContent?.subtitles?.length || 
                                (videoData.srtContent?.length / 50) || 0
                              } 条) - 可以开始分析
                            </p>
                          </div>
                        ) : videoData.hasSubtitles ? (
                          <div className="mt-3 p-2 bg-blue-400/10 rounded-lg border border-blue-400/20">
                            <p className="text-xs text-blue-400">
                              🔄 字幕正在处理中...
                            </p>
                          </div>
                        ) : subtitleFetchFailed ? (
                          <div className="mt-3 p-2 bg-red-400/10 rounded-lg border border-red-400/20">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-red-400">
                                ❌ 字幕获取失败 - 需要字幕才能进行分析
                              </p>
                              <button
                                onClick={() => setShowSubtitleUploadModal(true)}
                                className="ml-2 px-2 py-1 bg-red-400 text-white text-xs rounded hover:bg-red-300 transition-colors"
                              >
                                上传字幕
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 自动抓取开关 */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoFetchToggle"
                      checked={autoFetchEnabled}
                      onChange={(e) => setAutoFetchEnabled(e.target.checked)}
                      className="w-4 h-4 text-lime-400 bg-gray-700 border-gray-600 rounded focus:ring-lime-400 focus:ring-2"
                    />
                    <label htmlFor="autoFetchToggle" className="text-sm text-gray-400">
                      自动抓取YouTube视频信息和字幕
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* YouTube URL输入框 */}
              <div>
                <label htmlFor="srtUrl" className="block text-sm font-medium text-gray-200 mb-3">
                  视频URL（可选）
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="url"
                    id="srtUrl"
                    value={srtUrl}
                    onChange={(e) => setSrtUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... （便于频道分析）"
                    className="input-field pl-12"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  📋 提供视频URL有助于未来的频道分析功能
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  SRT字幕文件
                </label>
                
                {/* 文件上传区域 */}
                <div
                  className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors duration-300 ${
                      dragOver ? 'text-lime-400' : 'text-gray-500'
                    }`} />
                    <h3 className="text-lg font-medium text-white mb-2">
                      {srtFile ? '已选择文件' : '上传SRT字幕文件'}
                    </h3>
                    <p className="text-gray-400 mb-2">
                      {srtFile ? srtFile.name : '拖拽文件到此处或点击选择'}
                    </p>
                    <p className="text-sm text-gray-500">
                      支持 .srt 格式，最大 5MB
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".srt"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                {/* SRT预览 */}
                {srtPreview && srtContent && (
                  <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h4 className="font-medium text-white mb-3 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-lime-400" />
                      <span>文件预览</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <div className="text-lime-400 font-semibold text-lg">
                          {srtContent.analysisData.totalSubtitles}
                        </div>
                        <div className="text-gray-400">字幕条数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lime-400 font-semibold text-lg">
                          {DebugHelper.safeToFixed(srtContent.analysisData.totalDuration / 60, 1, 'VideoInput-totalDuration')}分
                        </div>
                        <div className="text-gray-400">总时长</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lime-400 font-semibold text-lg">
                          {srtContent.analysisData.totalWords}
                        </div>
                        <div className="text-gray-400">总词数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lime-400 font-semibold text-lg">
                          {srtContent.analysisData.avgWordsPerMinute}
                        </div>
                        <div className="text-gray-400">词/分钟</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {srtPreview.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm">
                          <span className="text-lime-400 font-mono">
                            {item.timeRange}
                          </span>
                          <span className="text-gray-300 flex-1">
                            {item.text}
                          </span>
                          <span className="text-gray-500">
                            {item.duration}
                          </span>
                        </div>
                      ))}
                      {srtContent.analysisData.totalSubtitles > 5 && (
                        <div className="text-center text-gray-500 text-sm mt-2">
                          还有 {srtContent.analysisData.totalSubtitles - 5} 条字幕...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-xl border border-red-900/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || fetchingData || (activeTab === 'url' ? !url.trim() : !srtContent)}
            className="w-full btn-primary flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                <span>启动分析中...</span>
              </>
            ) : fetchingData ? (
              <>
                <Download className="w-5 h-5 animate-pulse" />
                <span>抓取数据中...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>开始AI分析</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-lime-400" />
            <span>智能分析流程</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lime-400/20 rounded-xl flex items-center justify-center">
                <span className="text-lime-400 font-semibold">🤖</span>
              </div>
              <span className="text-gray-300">自动抓取视频信息和字幕</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lime-400/20 rounded-xl flex items-center justify-center">
                <span className="text-lime-400 font-semibold">1</span>
              </div>
              <span className="text-gray-300">内容提取与理解</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lime-400/20 rounded-xl flex items-center justify-center">
                <span className="text-lime-400 font-semibold">2</span>
              </div>
              <span className="text-gray-300">情感分析与情绪识别</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lime-400/20 rounded-xl flex items-center justify-center">
                <span className="text-lime-400 font-semibold">3</span>
              </div>
              <span className="text-gray-300">参与度与热度分析</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-lime-400/20 rounded-xl flex items-center justify-center">
                <span className="text-lime-400 font-semibold">4</span>
              </div>
              <span className="text-gray-300">综合洞察与可视化</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-400/20 rounded-xl flex items-center justify-center">
                <span className="text-blue-400 font-semibold">📊</span>
              </div>
              <span className="text-gray-300">频道级深度分析（3个视频后）</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-400/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 font-semibold">🔍</span>
              </div>
              <span className="text-gray-300">实时系统健康监控</span>
            </div>
          </div>
          
          {autoFetchEnabled && (
            <div className="mt-4 p-3 bg-lime-400/10 rounded-lg border border-lime-400/20">
              <p className="text-xs text-lime-400">
                💡 <strong>智能功能已启用</strong>：输入YouTube链接后将自动抓取视频信息、字幕和频道数据，大大提升分析效率
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 智能字幕上传弹窗 */}
      {showSubtitleUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span>手动上传字幕</span>
            </h3>
            
            <p className="text-gray-300 text-sm mb-4">
              {subtitleFetchFailed ? (
                <>
                  自动字幕获取失败，可能的原因：
                  <ul className="mt-2 ml-4 list-disc text-xs">
                    <li>视频没有字幕或字幕被禁用</li>
                    <li>网络限制或访问受限</li>
                    <li>字幕格式不支持</li>
                  </ul>
                  <div className="mt-3 text-lime-400">
                    💡 手动上传SRT字幕文件可获得更精确的分析结果
                  </div>
                </>
              ) : (
                "手动上传SRT字幕文件以获得更精确的分析结果。"
              )}
            </p>
            
            <div className="space-y-4">
              {/* 简化的文件上传区域 */}
              <div
                className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const files = Array.from(e.dataTransfer.files)
                  if (files.length > 0) {
                    handleFileSelect(files[0])
                    setShowSubtitleUploadModal(false)
                    setActiveTab('srt') // 切换到SRT标签
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                }}
                onClick={() => {
                  fileInputRef.current?.click()
                  fileInputRef.current.onchange = (e) => {
                    if (e.target.files[0]) {
                      handleFileSelect(e.target.files[0])
                      setShowSubtitleUploadModal(false)
                      setActiveTab('srt')
                    }
                  }
                }}
                style={{ 
                  minHeight: '120px',
                  cursor: 'pointer',
                  border: '2px dashed #6B7280',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: dragOver ? '#374151' : '#1F2937'
                }}
              >
                <Upload className={`mx-auto h-8 w-8 mb-2 transition-colors duration-300 ${
                  dragOver ? 'text-lime-400' : 'text-gray-500'
                }`} />
                <p className="text-gray-300 text-sm">
                  点击选择或拖拽SRT文件
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowSubtitleUploadModal(false)
                    // 继续基础分析，不清除失败状态
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                >
                  继续基础分析
                </button>
                <button
                  onClick={() => {
                    setActiveTab('srt')
                    setShowSubtitleUploadModal(false)
                  }}
                  className="flex-1 px-3 py-2 bg-lime-400 text-gray-900 rounded-lg hover:bg-lime-300 transition-colors font-medium text-sm"
                >
                  前往上传
                </button>
                <button
                  onClick={() => {
                    setShowSubtitleUploadModal(false)
                    setSubtitleFetchFailed(false)
                  }}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                >
                  稍后
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoInput