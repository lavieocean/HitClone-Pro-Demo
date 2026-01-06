import React, { useState, useRef } from 'react'
import { Link, Upload, AlertCircle, FileText, Play, Sparkles, TrendingUp, BarChart3, Zap } from 'lucide-react'
import { SRTParser } from '../utils/srtParser'
import { DebugHelper } from '../utils/debugHelper'

const StartPage = ({ onAnalyze, activeTab }) => {
  const [url, setUrl] = useState('')
  const [srtFile, setSrtFile] = useState(null)
  const [srtContent, setSrtContent] = useState(null)
  const [srtPreview, setSrtPreview] = useState(null)
  const [inputMode, setInputMode] = useState('url') // 'url' or 'srt'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const examples = [
    {
      title: "爆款视频分析案例",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      views: "1.4B",
      engagement: "97%"
    },
    {
      title: "热门内容趋势分析",
      url: "https://www.bilibili.com/video/BV1GJ411x7h7",
      views: "23M",
      engagement: "92%"
    },
    {
      title: "用户互动模式研究",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      views: "19M", 
      engagement: "88%"
    }
  ]

  const validateUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    const bilibiliRegex = /^(https?:\/\/)?(www\.)?bilibili\.com\/.+/
    return youtubeRegex.test(url) || bilibiliRegex.test(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (inputMode === 'url') {
      if (!url.trim()) {
        setError('请输入视频URL')
        return
      }
      
      if (!validateUrl(url)) {
        setError('请输入有效的YouTube或Bilibili视频URL')
        return
      }
      
      setLoading(true)
      try {
        await onAnalyze({ type: 'url', data: url })
      } catch (err) {
        setError('分析启动失败，请重试')
      } finally {
        setLoading(false)
      }
    } else if (inputMode === 'srt') {
      if (!srtContent) {
        setError('请上传SRT字幕文件')
        return
      }
      
      setLoading(true)
      try {
        await onAnalyze({ 
          type: 'srt', 
          data: srtContent,
          fileName: srtFile?.name,
          preview: srtPreview
        })
      } catch (err) {
        setError('SRT文件分析失败，请重试')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFileSelect = (file) => {
    DebugHelper.logWithStack('文件选择开始', file)
    
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
        DebugHelper.logWithStack('SRT文件读取完成', { fileSize: e.target.result.length })
        
        const content = e.target.result
        console.log('📝 文件内容预览:', content.substring(0, 200) + '...')
        
        const subtitles = SRTParser.parseSRT(content)
        DebugHelper.logWithStack('SRT解析完成', { subtitleCount: subtitles.length })
        
        if (subtitles.length === 0) {
          console.error('❌ SRT解析失败: 没有找到有效字幕')
          setError('SRT文件格式错误或为空')
          return
        }

        const analysisData = SRTParser.getAnalysisData(subtitles)
        DebugHelper.checkSRTData({ subtitles, analysisData }, 'getAnalysisData结果')
        
        const preview = SRTParser.generatePreview(subtitles)
        DebugHelper.logWithStack('预览生成完成', preview)
        
        const finalSrtContent = { subtitles, analysisData }
        DebugHelper.checkSRTData(finalSrtContent, '最终SRT内容')
        
        setSrtContent(finalSrtContent)
        setSrtPreview(preview)
        console.log('✅ SRT文件处理完成')
      } catch (err) {
        console.error('❌ SRT解析错误:', err)
        console.error('❌ 错误堆栈:', err.stack)
        setError('SRT文件解析失败，请检查文件格式: ' + err.message)
      }
    }
    
    reader.onerror = (err) => {
      DebugHelper.logWithStack('文件读取错误', err)
      setError('文件读取失败')
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
    <div className="max-w-5xl mx-auto">
      {/* 头部标题 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-white">HitClone </span>
          <span className="text-[#DBFC53]">Pro</span>
        </h1>
        <p className="text-xl text-gray-400">
          AI驱动的视频内容分析平台
        </p>
      </div>

      {/* 主输入区域 */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-8">
        {/* 输入模式切换 */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setInputMode('url')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              inputMode === 'url'
                ? 'bg-[#DBFC53] text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>视频链接</span>
          </button>
          <button
            onClick={() => setInputMode('srt')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              inputMode === 'srt'
                ? 'bg-[#DBFC53] text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SRT字幕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {inputMode === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                输入视频URL进行分析
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... 或 https://www.bilibili.com/..."
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#DBFC53] transition-colors"
                  disabled={loading}
                />
                <Link className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                上传SRT字幕文件
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragOver 
                    ? 'border-[#DBFC53] bg-[#DBFC53]/5' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`mx-auto h-12 w-12 mb-4 ${
                  dragOver ? 'text-[#DBFC53]' : 'text-gray-500'
                }`} />
                <h3 className="text-lg font-medium text-white mb-2">
                  {srtFile ? srtFile.name : '拖拽或点击上传SRT文件'}
                </h3>
                <p className="text-sm text-gray-400">
                  支持 .srt 格式，最大 5MB
                </p>
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
                <div className="mt-4 p-4 bg-black rounded-xl border border-gray-700">
                  <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-[#DBFC53] font-semibold text-lg">
                        {srtContent.analysisData.totalSubtitles || 0}
                      </div>
                      <div className="text-xs text-gray-400">字幕条数</div>
                    </div>
                    <div>
                      <div className="text-[#DBFC53] font-semibold text-lg">
                        {DebugHelper.safeToFixed(
                          srtContent.analysisData.totalDuration ? srtContent.analysisData.totalDuration / 60 : 0, 
                          1, 
                          'StartPage-总时长显示'
                        )}分
                      </div>
                      <div className="text-xs text-gray-400">总时长</div>
                    </div>
                    <div>
                      <div className="text-[#DBFC53] font-semibold text-lg">
                        {srtContent.analysisData.totalWords || 0}
                      </div>
                      <div className="text-xs text-gray-400">总词数</div>
                    </div>
                    <div>
                      <div className="text-[#DBFC53] font-semibold text-lg">
                        {DebugHelper.safeToFixed(
                          srtContent.analysisData.avgWordsPerMinute, 
                          1, 
                          'StartPage-平均语速显示'
                        )}
                      </div>
                      <div className="text-xs text-gray-400">词/分钟</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (inputMode === 'url' ? !url.trim() : !srtContent)}
            className="w-full bg-[#DBFC53] hover:bg-[#c7e847] text-black font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>启动分析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>开始AI分析</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 示例展示 */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-[#DBFC53]" />
          <span>热门分析案例</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setUrl(example.url)}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-4 text-left transition-all group"
            >
              <h4 className="font-medium text-white mb-2 group-hover:text-[#DBFC53] transition-colors">
                {example.title}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">观看: {example.views}</span>
                <span className="text-[#DBFC53]">参与度: {example.engagement}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI分析流程说明 */}
      <div className="mt-12 bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
        <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-[#DBFC53]" />
          <span>4步AI分析流程</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: 1, label: "内容提取", icon: FileText },
            { step: 2, label: "情感分析", icon: BarChart3 },
            { step: 3, label: "热度计算", icon: TrendingUp },
            { step: 4, label: "综合洞察", icon: Sparkles }
          ].map((item) => (
            <div key={item.step} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#DBFC53]/10 rounded-xl flex items-center justify-center">
                <item.icon className="w-5 h-5 text-[#DBFC53]" />
              </div>
              <div>
                <div className="text-xs text-gray-400">步骤 {item.step}</div>
                <div className="text-sm font-medium text-white">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StartPage