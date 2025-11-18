import React, { useState, useRef, useEffect } from 'react'
import { Link, Upload, AlertCircle, FileText, Play, Sparkles, TrendingUp, BarChart3, Zap, Brain, Target, Rocket, Eye, LineChart, MessageSquare, Clock, ArrowRight, ChevronRight } from 'lucide-react'
import { SRTParser } from '../utils/srtParser'
import { DebugHelper } from '../utils/debugHelper'

const StartPageUpgraded = ({ onAnalyze, activeTab }) => {
  const [url, setUrl] = useState('')
  const [srtFile, setSrtFile] = useState(null)
  const [srtContent, setSrtContent] = useState(null)
  const [srtPreview, setSrtPreview] = useState(null)
  const [inputMode, setInputMode] = useState('url')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [selectedCapability, setSelectedCapability] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const fileInputRef = useRef(null)

  // 自动轮播能力展示
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedCapability((prev) => (prev + 1) % capabilities.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const capabilities = [
    {
      icon: Brain,
      title: "AI内容理解",
      description: "深度分析视频内容结构、叙事节奏和信息密度",
      color: "from-purple-500 to-pink-500",
      features: ["语义分析", "主题提取", "内容分段"]
    },
    {
      icon: Target,
      title: "情感波动追踪",
      description: "实时捕捉观众情绪变化，精准定位高潮与低谷",
      color: "from-blue-500 to-cyan-500",
      features: ["情感曲线", "高潮点识别", "参与度预测"]
    },
    {
      icon: TrendingUp,
      title: "爆款基因解码",
      description: "识别视频中的病毒式传播元素和用户粘性因子",
      color: "from-green-500 to-emerald-500",
      features: ["热点识别", "传播因子", "病毒潜力"]
    },
    {
      icon: MessageSquare,
      title: "互动策略优化",
      description: "分析观众留存模式，提供精准的内容优化建议",
      color: "from-orange-500 to-red-500",
      features: ["留存分析", "优化建议", "A/B测试"]
    }
  ]

  const analysisSteps = [
    { label: "内容提取", description: "解析视频字幕和元数据", icon: FileText },
    { label: "AI理解", description: "深度语义分析和主题识别", icon: Brain },
    { label: "情感计算", description: "追踪情绪波动和节奏变化", icon: BarChart3 },
    { label: "洞察生成", description: "生成可执行的优化建议", icon: Sparkles }
  ]

  const examples = [
    {
      title: "教育讲解视频",
      thumbnail: "🎓",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      views: "1.4M",
      engagement: "97%",
      tag: "教育"
    },
    {
      title: "产品评测内容",
      thumbnail: "📱",
      url: "https://www.bilibili.com/video/BV1GJ411x7h7",
      views: "890K",
      engagement: "94%",
      tag: "评测"
    },
    {
      title: "Vlog生活记录",
      thumbnail: "🎬",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      views: "2.1M",
      engagement: "91%",
      tag: "生活"
    },
    {
      title: "技术教程分享",
      thumbnail: "💻",
      url: "https://www.youtube.com/watch?v=example1",
      views: "567K",
      engagement: "88%",
      tag: "技术"
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
      setIsAnalyzing(true)

      // 模拟分析步骤进度
      for (let i = 0; i < analysisSteps.length; i++) {
        setAnalysisStep(i)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      try {
        await onAnalyze({ type: 'url', data: url })
      } catch (err) {
        setError('分析启动失败，请重试')
      } finally {
        setLoading(false)
        setIsAnalyzing(false)
        setAnalysisStep(0)
      }
    } else if (inputMode === 'srt') {
      if (!srtContent) {
        setError('请上传SRT字幕文件')
        return
      }

      setLoading(true)
      setIsAnalyzing(true)

      for (let i = 0; i < analysisSteps.length; i++) {
        setAnalysisStep(i)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

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
        setIsAnalyzing(false)
        setAnalysisStep(0)
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
        const subtitles = SRTParser.parseSRT(content)
        DebugHelper.logWithStack('SRT解析完成', { subtitleCount: subtitles.length })

        if (subtitles.length === 0) {
          setError('SRT文件格式错误或为空')
          return
        }

        const analysisData = SRTParser.getAnalysisData(subtitles)
        const preview = SRTParser.generatePreview(subtitles)
        const finalSrtContent = { subtitles, analysisData }

        setSrtContent(finalSrtContent)
        setSrtPreview(preview)
      } catch (err) {
        setError('SRT文件解析失败，请检查文件格式: ' + err.message)
      }
    }

    reader.onerror = () => {
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
    <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-16 pt-8">
        <div className="inline-block mb-6">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">AI驱动的视频分析革命</span>
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">解码视频的</span>
          <br />
          <span className="bg-gradient-to-r from-[#DBFC53] via-yellow-300 to-[#DBFC53] bg-clip-text text-transparent">
            爆款基因
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
          利用Claude AI深度分析视频内容，挖掘情感波动、识别病毒元素，
          <br />
          让每个视频都有成为爆款的可能
        </p>

        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>60秒快速分析</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>4维度深度洞察</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>精准优化建议</span>
          </div>
        </div>
      </div>

      {/* 能力展示区域 */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 左侧：能力选择 */}
          <div className="space-y-3">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon
              const isSelected = selectedCapability === index

              return (
                <div
                  key={index}
                  onClick={() => setSelectedCapability(index)}
                  className={`
                    relative cursor-pointer rounded-2xl p-6 transition-all duration-500
                    ${isSelected
                      ? 'bg-gradient-to-br ' + capability.color + ' shadow-2xl scale-105'
                      : 'bg-gray-900 hover:bg-gray-800 border border-gray-800'
                    }
                  `}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-white/20' : 'bg-gray-800'}
                    `}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    </div>

                    <div className="flex-1">
                      <h3 className={`font-semibold mb-2 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {capability.title}
                      </h3>
                      <p className={`text-sm mb-3 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {capability.description}
                      </p>

                      {isSelected && (
                        <div className="flex flex-wrap gap-2 animate-fadeIn">
                          {capability.features.map((feature, idx) => (
                            <span key={idx} className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <ChevronRight className="w-5 h-5 text-white animate-pulse" />
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 blur-xl -z-10"
                         style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 右侧：能力演示 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 blur-3xl"
                 style={{ background: `linear-gradient(to bottom right, ${capabilities[selectedCapability].color})` }}></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${capabilities[selectedCapability].color} flex items-center justify-center`}>
                  {React.createElement(capabilities[selectedCapability].icon, { className: "w-5 h-5 text-white" })}
                </div>
                <h4 className="text-lg font-semibold text-white">{capabilities[selectedCapability].title}</h4>
              </div>

              {/* 模拟数据可视化 */}
              <div className="space-y-4">
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">分析进度</span>
                    <span className="text-sm text-[#DBFC53] font-semibold">100%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${capabilities[selectedCapability].color} animate-pulse`}></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "识别精度", value: "98.5%" },
                    { label: "处理速度", value: "45s" },
                    { label: "洞察点", value: "24+" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-black/50 rounded-xl p-3 text-center">
                      <div className={`text-lg font-bold bg-gradient-to-r ${capabilities[selectedCapability].color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* 模拟图表 */}
                <div className="bg-black/50 rounded-xl p-4 h-32 flex items-end justify-between space-x-1">
                  {[...Array(20)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 bg-gradient-to-t ${capabilities[selectedCapability].color} rounded-t opacity-60 hover:opacity-100 transition-opacity`}
                      style={{ height: `${Math.random() * 100}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主输入区域 */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-gray-800 p-8 md:p-10 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#DBFC53]/5 to-transparent blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => setInputMode('url')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all font-medium ${
                inputMode === 'url'
                  ? 'bg-[#DBFC53] text-black shadow-lg shadow-[#DBFC53]/20'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Link className="w-5 h-5" />
              <span>视频链接</span>
            </button>
            <button
              onClick={() => setInputMode('srt')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all font-medium ${
                inputMode === 'srt'
                  ? 'bg-[#DBFC53] text-black shadow-lg shadow-[#DBFC53]/20'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>SRT字幕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {inputMode === 'url' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  输入视频URL，开始AI深度分析
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... 或 https://www.bilibili.com/..."
                    className="w-full px-6 py-4 bg-black border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#DBFC53] transition-all text-lg"
                    disabled={loading}
                  />
                  <Link className="absolute right-4 top-4 w-6 h-6 text-gray-500" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  上传SRT字幕文件进行分析
                </label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                    dragOver
                      ? 'border-[#DBFC53] bg-[#DBFC53]/5 scale-105'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`mx-auto h-16 w-16 mb-4 ${
                    dragOver ? 'text-[#DBFC53] animate-bounce' : 'text-gray-500'
                  }`} />
                  <h3 className="text-xl font-medium text-white mb-2">
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

                {srtPreview && srtContent && (
                  <div className="mt-6 p-6 bg-black rounded-2xl border border-gray-700">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-900 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#DBFC53] mb-1">
                          {srtContent.analysisData.totalSubtitles || 0}
                        </div>
                        <div className="text-xs text-gray-400">字幕条数</div>
                      </div>
                      <div className="bg-gray-900 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#DBFC53] mb-1">
                          {DebugHelper.safeToFixed(
                            srtContent.analysisData.totalDuration ? srtContent.analysisData.totalDuration / 60 : 0,
                            1,
                            'StartPage-总时长显示'
                          )}分
                        </div>
                        <div className="text-xs text-gray-400">总时长</div>
                      </div>
                      <div className="bg-gray-900 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#DBFC53] mb-1">
                          {srtContent.analysisData.totalWords || 0}
                        </div>
                        <div className="text-xs text-gray-400">总词数</div>
                      </div>
                      <div className="bg-gray-900 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#DBFC53] mb-1">
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
              <div className="flex items-center space-x-3 text-red-400 bg-red-900/20 border border-red-800 p-4 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (inputMode === 'url' ? !url.trim() : !srtContent)}
              className="w-full bg-gradient-to-r from-[#DBFC53] to-yellow-300 hover:from-yellow-300 hover:to-[#DBFC53] text-black font-bold py-4 px-8 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg shadow-[#DBFC53]/20 hover:shadow-[#DBFC53]/40 hover:scale-105 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                  <span>AI分析中...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-6 h-6" />
                  <span>开始AI深度分析</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* 分析进度展示 */}
          {isAnalyzing && (
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800">
              <h4 className="text-white font-semibold mb-6 text-center text-lg">AI分析进行中...</h4>
              <div className="space-y-4">
                {analysisSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = analysisStep === index
                  const isCompleted = analysisStep > index

                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center transition-all
                        ${isActive ? 'bg-[#DBFC53] animate-pulse' : isCompleted ? 'bg-green-500' : 'bg-gray-800'}
                      `}>
                        <Icon className={`w-6 h-6 ${isActive || isCompleted ? 'text-black' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${isActive ? 'text-[#DBFC53]' : isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                          {step.label}
                        </div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                      {isCompleted && (
                        <div className="text-green-400">✓</div>
                      )}
                      {isActive && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#DBFC53]"></div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 进度条 */}
              <div className="mt-6">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#DBFC53] to-yellow-300 transition-all duration-500"
                    style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 示例展示 */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
            <TrendingUp className="w-7 h-7 text-[#DBFC53]" />
            <span>热门分析案例</span>
          </h3>
          <button className="text-gray-400 hover:text-white flex items-center space-x-2 transition-colors">
            <span className="text-sm">查看全部</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setUrl(example.url)}
              className="bg-gradient-to-br from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 text-left transition-all group hover:scale-105 hover:shadow-xl"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {example.thumbnail}
              </div>

              <div className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded mb-3">
                {example.tag}
              </div>

              <h4 className="font-semibold text-white mb-3 group-hover:text-[#DBFC53] transition-colors">
                {example.title}
              </h4>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{example.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[#DBFC53] font-medium">{example.engagement}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 底部说明 */}
      <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 rounded-3xl border border-purple-500/20 p-8 mb-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">为什么选择 HitClone Pro？</h3>
          <p className="text-gray-400">基于Claude AI的4步智能分析链</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {analysisSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                  <Icon className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-sm text-gray-400 mb-1">步骤 {index + 1}</div>
                <div className="font-semibold text-white mb-1">{step.label}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StartPageUpgraded
