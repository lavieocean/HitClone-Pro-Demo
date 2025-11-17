import React, { useState, useEffect } from 'react'
import { ArrowLeft, Users, Play, BarChart3, Zap, RefreshCw, Download } from 'lucide-react'
import channelAnalysisService from '../../services/channelAnalysisService'
import geminiApi from '../../services/geminiApi'

const ChannelAnalysisPage = ({ channel, onBack }) => {
  const [loading, setLoading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (channel) {
      loadChannelData()
    }
  }, [channel])

  const loadChannelData = () => {
    const channelData = channelAnalysisService.getChannelData(channel.channelId)
    const channelSummary = channelAnalysisService.getChannelVideosSummary(channel.channelId)
    
    if (channelData) {
      setAnalysisResults(channelData.channelAnalysisResults)
      setSummary(channelSummary)
    }
  }

  const startChannelAnalysis = async () => {
    setLoading(true)
    setError('')

    try {
      const channelData = channelAnalysisService.getChannelData(channel.channelId)
      if (!channelData || channelData.videos.length < 3) {
        throw new Error('需要至少3个视频才能进行频道分析')
      }

      // 构建分析提示词
      const analysisPrompt = buildChannelAnalysisPrompt(channelData)
      
      console.log('🎯 开始频道级AI分析...')
      
      // 调用Gemini API进行频道分析
      const response = await geminiApi.callApi(analysisPrompt, {
        max_tokens: 8000,
        temperature: 0.7
      })

      // 解析分析结果
      let analysisData
      try {
        analysisData = JSON.parse(response)
      } catch (parseError) {
        console.warn('解析JSON失败，使用文本响应')
        analysisData = parseTextResponse(response)
      }

      // 保存分析结果
      channelAnalysisService.saveChannelAnalysis(channel.channelId, analysisData)
      setAnalysisResults(analysisData)
      
      console.log('✅ 频道分析完成:', analysisData)
      
    } catch (error) {
      console.error('❌ 频道分析失败:', error)
      setError('频道分析失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const buildChannelAnalysisPrompt = (channelData) => {
    const videos = channelData.videos.slice(0, 10) // 最多分析10个视频
    
    const videoSummaries = videos.map((video, index) => {
      return `
视频${index + 1}:
- 标题: ${video.title}
- 观看数: ${video.viewCount}
- 发布时间: ${video.publishDate || video.analysisDate}
- 有字幕: ${video.hasSubtitles ? '是' : '否'}
- 描述: ${video.description?.substring(0, 200) || '无描述'}
- 分析洞察: ${JSON.stringify(video.analysisResults?.insights || {}).substring(0, 300)}
      `
    }).join('\n')

    return `
请对YouTube频道"${channelData.channelName}"进行深度分析。

频道基本信息:
- 频道名称: ${channelData.channelName}
- 已分析视频数: ${channelData.totalVideos}
- 分析时间范围: ${channelData.firstAnalysisDate} 至 ${channelData.lastAnalysisDate}

视频详情:
${videoSummaries}

请从以下5个维度进行频道级分析，返回JSON格式结果:

{
  "channelStyleProfile": {
    "contentThemes": ["主要内容主题1", "主题2", "主题3"],
    "expressionStyle": "表达风格描述",
    "visualStyle": "视觉风格特点",
    "targetAudience": "目标受众画像",
    "uniqueValue": "独特价值主张"
  },
  "viralCommonality": {
    "titlePatterns": ["高播放标题模式1", "模式2"],
    "contentStructure": "爆款内容结构",
    "emotionalTriggers": ["情感触发器1", "触发器2"],
    "timingPatterns": "发布时机规律",
    "engagementFactors": ["互动因素1", "因素2"]
  },
  "contentEvolution": {
    "evolutionStages": [
      {
        "period": "时期描述",
        "characteristics": "该时期特点",
        "keyChanges": "关键变化"
      }
    ],
    "growthStrategy": "成长策略变化",
    "adaptationTrends": "适应趋势"
  },
  "audienceInsights": {
    "demographicProfile": "人口统计特征",
    "interestProfiles": ["兴趣点1", "兴趣点2"],
    "behaviorPatterns": "行为模式",
    "loyaltyIndicators": ["忠诚度指标1", "指标2"],
    "feedbackThemes": "反馈主题"
  },
  "competitiveAdvantage": {
    "uniqueStrengths": ["独特优势1", "优势2"],
    "differentiationFactors": ["差异化因素1", "因素2"],
    "marketPosition": "市场定位",
    "competitiveGaps": ["竞争空白1", "空白2"],
    "recommendedStrategy": "推荐策略"
  },
  "summary": {
    "overallAssessment": "整体评估",
    "keyInsights": ["关键洞察1", "洞察2", "洞察3"],
    "actionableRecommendations": ["可行建议1", "建议2", "建议3"]
  }
}

请确保分析深入、具体且具有可操作性。
`
  }

  const parseTextResponse = (response) => {
    // 简单的文本解析，如果JSON解析失败
    return {
      summary: {
        overallAssessment: response.substring(0, 500),
        keyInsights: ["基于文本分析的洞察"],
        actionableRecommendations: ["需要进一步分析"]
      },
      rawResponse: response
    }
  }

  const exportChannelReport = () => {
    if (!analysisResults || !summary) return

    const reportData = {
      channel: channel,
      summary: summary,
      analysis: analysisResults,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${channel.channelName}_频道分析报告_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">未选择频道</h2>
          <p className="text-gray-400">请先选择一个频道进行分析</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回频道列表</span>
          </button>

          <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-lg border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <Users className="w-8 h-8 text-lime-400" />
                  <span>{channel.channelName}</span>
                </h1>
                
                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-lime-400">{summary.totalVideos}</div>
                      <div className="text-sm text-gray-400">已分析视频</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{formatViews(summary.totalViews)}</div>
                      <div className="text-sm text-gray-400">总观看数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{Math.round(summary.hasSubtitlesRatio * 100)}%</div>
                      <div className="text-sm text-gray-400">字幕覆盖率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{formatViews(summary.avgViews)}</div>
                      <div className="text-sm text-gray-400">平均观看</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={startChannelAnalysis}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>分析中...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      <span>{analysisResults ? '重新分析' : '开始深度分析'}</span>
                    </>
                  )}
                </button>

                {analysisResults && (
                  <button
                    onClick={exportChannelReport}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>导出报告</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 错误显示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* 分析结果 */}
        {analysisResults ? (
          <ChannelAnalysisResults results={analysisResults} summary={summary} />
        ) : (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">准备开始频道深度分析</h3>
            <p className="text-gray-400 mb-6">
              基于 {summary?.totalVideos || 0} 个视频的数据，生成专业的频道分析报告
            </p>
            <button
              onClick={startChannelAnalysis}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-400 hover:bg-lime-500 text-gray-900 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              <span>开始AI深度分析</span>
            </button>
          </div>
        )}

        {/* 视频列表预览 */}
        {summary && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">热门视频</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.topVideos.map((video, index) => (
                <div key={video.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-lime-400/20 rounded-lg flex items-center justify-center">
                      <span className="text-lime-400 font-semibold">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm line-clamp-2 mb-2">
                        {video.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{video.viewCount}</span>
                        <span>{video.analysisDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 分析结果展示组件
const ChannelAnalysisResults = ({ results, summary }) => {
  const [activeSection, setActiveSection] = useState('summary')

  const sections = [
    { id: 'summary', name: '总结洞察', icon: '📊' },
    { id: 'channelStyleProfile', name: '频道风格画像', icon: '🎨' },
    { id: 'viralCommonality', name: '爆款共性分析', icon: '🔥' },
    { id: 'contentEvolution', name: '内容演化趋势', icon: '📈' },
    { id: 'audienceInsights', name: '观众画像洞察', icon: '👥' },
    { id: 'competitiveAdvantage', name: '竞争优势分析', icon: '⚡' }
  ]

  return (
    <div className="space-y-6">
      {/* 分析维度导航 */}
      <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-lg border border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-lime-400 text-gray-900'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{section.icon}</div>
                <div>{section.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 分析内容 */}
      <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-lg border border-gray-700">
        <AnalysisSection 
          sectionId={activeSection} 
          data={results[activeSection] || results.summary} 
          summary={summary}
        />
      </div>
    </div>
  )
}

// 分析章节组件
const AnalysisSection = ({ sectionId, data, summary }) => {
  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">暂无此维度的分析数据</div>
      </div>
    )
  }

  const renderContent = () => {
    switch (sectionId) {
      case 'summary':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">🎯 频道分析总结</h3>
            
            {data.overallAssessment && (
              <div>
                <h4 className="font-medium text-lime-400 mb-2">整体评估</h4>
                <p className="text-gray-300">{data.overallAssessment}</p>
              </div>
            )}
            
            {data.keyInsights && (
              <div>
                <h4 className="font-medium text-lime-400 mb-2">关键洞察</h4>
                <ul className="space-y-2">
                  {data.keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-300">
                      <span className="text-lime-400 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.actionableRecommendations && (
              <div>
                <h4 className="font-medium text-lime-400 mb-2">可行建议</h4>
                <ul className="space-y-2">
                  {data.actionableRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-300">
                      <span className="text-blue-400 mt-1">▶</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              {sections.find(s => s.id === sectionId)?.name || '分析结果'}
            </h3>
            <pre className="text-gray-300 whitespace-pre-wrap text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return renderContent()
}

// 格式化观看数
const formatViews = (views) => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M'
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K'
  }
  return views?.toString() || '0'
}

export default ChannelAnalysisPage