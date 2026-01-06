import { useState, useCallback } from 'react'
import geminiApi from '../services/geminiApi'
import { DebugHelper } from '../utils/debugHelper'
import channelAnalysisService from '../services/channelAnalysisService'

export const useVideoAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [error, setError] = useState(null)

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // 添加API调用超时包装函数
  const withTimeout = (promise, timeoutMs = 30000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API调用超时')), timeoutMs)
      )
    ])
  }

  const extractVideoInfo = async (input) => {
    let prompt = ''
    
    if (input.type === 'url') {
      // 检查是否有视频数据
      const hasVideoData = input.videoData && input.videoData.success
      const hasSubtitles = hasVideoData && input.videoData.data?.hasSubtitles
      
      if (hasVideoData) {
        const videoData = input.videoData.data
        
        // 构建基于实际数据的分析prompt
        prompt = `请分析这个YouTube视频的详细信息：

视频基础数据：
- 标题: ${videoData.title || '未知'}
- 描述: ${videoData.description || '无描述'}
- 频道: ${videoData.channelName || '未知'}
- 观看数: ${videoData.viewCount || '未知'}
- 点赞数: ${videoData.likeCount || '未知'}
- 评论数: ${videoData.commentCount || '未知'}
- 时长: ${videoData.duration || '未知'}
- 发布日期: ${videoData.publishDate || '未知'}
- 标签: ${videoData.tags?.join(', ') || '无标签'}
- 字幕状态: ${hasSubtitles ? '有字幕' : '无字幕'}

${hasSubtitles ? `
字幕内容片段:
${videoData.srtContent ? videoData.srtContent.substring(0, 1000) + '...' : '字幕加载中...'}
` : `
由于此视频没有字幕，请基于标题、描述、频道信息等元数据进行深度分析。
分析要点：
1. 从标题判断视频主题和目标受众
2. 从描述分析内容定位和价值主张  
3. 从频道信息推测内容质量和专业性
4. 结合数据指标评估视频表现
`}

请返回JSON格式，包含详细的内容分析结果。`
      } else {
        // 没有视频数据时的基础分析
        prompt = `请分析这个视频URL并提取基础信息: ${input.data}
        
由于无法获取详细的视频数据，请基于URL进行基础分析，并返回JSON格式的视频信息。

请返回JSON格式的视频基础信息，包括：
- 标题
- 时长  
- 观看数
- 点赞数
- 评论数
- 标签
- 描述
- 发布日期

视频内容提取分析：请提供基于URL的视频元数据分析。`
      }
    } else if (input.type === 'srt') {
      const { subtitles, analysisData } = input.data
      prompt = `请分析这个SRT字幕文件的内容信息:

文件名: ${input.fileName}
字幕条数: ${analysisData.totalSubtitles || 0}
总时长: ${analysisData.totalDuration ? DebugHelper.safeToFixed(analysisData.totalDuration / 60, 1, 'useVideoAnalysis-prompt总时长1') : 0}分钟
总词数: ${analysisData.totalWords || 0}

前5条字幕内容:
${subtitles.slice(0, 5).map(s => `${DebugHelper.safeToFixed(s.startTime || 0, 1, 'useVideoAnalysis-prompt字幕时间')}s: ${s.text || ''}`).join('\n')}

请返回JSON格式的内容基础信息，包括：
- 标题 (根据内容推测)
- 时长 (${analysisData.totalDuration ? DebugHelper.safeToFixed(analysisData.totalDuration / 60, 1, 'useVideoAnalysis-prompt总时长2') : 0}分钟)
- 字幕条数
- 总词数
- 平均语速
- 主要话题
- 内容类型
- 语言

SRT内容提取分析：请提供详细的字幕内容分析。`
    }

    try {
      console.log('📡 发送API请求: extractVideoInfo')
      const response = await withTimeout(geminiApi.callApi(prompt), 30000)
      console.log('✅ API响应收到: extractVideoInfo')
      
      return typeof response === 'string' ? JSON.parse(response) : response
    } catch (error) {
      console.error('❌ extractVideoInfo失败:', error)
      if (error.message === 'API调用超时') {
        // 超时时返回模拟数据
        return {
          title: `视频分析 - ${new Date().toLocaleString()}`,
          duration: '未知',
          views: '分析中...',
          likes: '分析中...',
          comments: '分析中...',
          tags: [],
          description: '正在分析视频内容...',
          publishDate: new Date().toISOString()
        }
      }
      throw new Error('内容提取失败：' + error.message)
    }
  }

  const analyzeSentiment = async (videoInfo, originalInput) => {
    let prompt = ''
    
    if (originalInput?.type === 'srt') {
      const { subtitles } = originalInput.data
      const sampleTexts = subtitles.slice(0, 20).map(s => s.text).join(' ')
      
      prompt = `基于SRT字幕内容进行情感分析:
      
内容信息: ${JSON.stringify(videoInfo)}
字幕样本: ${sampleTexts}

请分析这段内容的情感特征，返回JSON格式包括：
- 整体情感倾向
- 情感得分 (0-1)
- 情感分布 (积极/中性/消极百分比)
- 关键情绪
- 情感时间线 (按时间段分析)

SRT情感分析：请分析字幕内容的情感倾向和情绪变化。`
    } else {
      // URL类型 - 检查是否有字幕数据
      const hasVideoData = originalInput.videoData && originalInput.videoData.success
      const hasSubtitles = hasVideoData && originalInput.videoData.data?.hasSubtitles
      
      if (hasSubtitles) {
        // 有字幕时基于字幕进行情感分析
        const subtitleSample = originalInput.videoData.data.srtContent 
          ? originalInput.videoData.data.srtContent.substring(0, 1500)
          : ''
        
        prompt = `基于视频内容和字幕进行深度情感分析:

视频信息: ${JSON.stringify(videoInfo)}

字幕内容样本:
${subtitleSample}

请进行详细的情感分析，返回JSON格式包括：
- 整体情感倾向 (positive/neutral/negative)
- 情感得分 (0-1)
- 情感分布 (积极/中性/消极百分比)
- 关键情绪词汇
- 情感变化时间线
- 观众可能的情感反应

情感分析：基于字幕和视频数据分析观众情绪反应。`
      } else {
        // 无字幕时基于元数据进行情感分析
        prompt = `基于视频元数据进行情感分析:

视频信息: ${JSON.stringify(videoInfo)}

由于该视频没有字幕，请基于以下信息进行情感分析：
- 视频标题的情感色彩
- 描述内容的情感倾向
- 频道的内容风格
- 观看数、点赞数等数据指标
- 标签的情感暗示

请分析观众对这个视频可能的情感反应，返回JSON格式包括：
- 整体情感倾向 (positive/neutral/negative)
- 情感得分 (0-1，基于标题描述推测)
- 预期情感分布 (积极/中性/消极百分比)
- 关键情绪词汇 (从标题描述提取)
- 情感影响因素分析

无字幕情感分析：基于视频元数据预测观众情感反应。`
      }
    }

    try {
      console.log('📡 发送API请求: analyzeSentiment')
      const response = await withTimeout(geminiApi.callApi(prompt), 30000)
      console.log('✅ API响应收到: analyzeSentiment')
      
      return typeof response === 'string' ? JSON.parse(response) : response
    } catch (error) {
      console.error('❌ analyzeSentiment失败:', error)
      if (error.message === 'API调用超时') {
        // 超时时返回模拟数据
        return {
          overallSentiment: 'positive',
          sentimentScore: 0.7,
          sentimentDistribution: { positive: 60, neutral: 30, negative: 10 },
          keyEmotions: ['兴奋', '好奇'],
          timeline: []
        }
      }
      throw new Error('情感分析失败：' + error.message)
    }
  }

  const analyzeEngagement = async (videoInfo, sentimentData, originalInput) => {
    let prompt = ''
    
    if (originalInput?.type === 'srt') {
      prompt = `基于SRT字幕内容和情感数据分析内容质量:
内容信息: ${JSON.stringify(videoInfo)}
情感数据: ${JSON.stringify(sentimentData)}

请分析字幕内容的质量指标，返回JSON格式包括：
- 内容密度评分
- 信息传达效率
- 语言流畅度
- 重点时间段
- 内容节奏评估
- 小时内容分布

SRT内容质量分析：评估内容节奏、语言质量和信息密度。`
    } else {
      // URL类型 - 检查是否有字幕数据
      const hasVideoData = originalInput.videoData && originalInput.videoData.success
      const hasSubtitles = hasVideoData && originalInput.videoData.data?.hasSubtitles
      
      if (hasSubtitles) {
        prompt = `基于视频信息、字幕内容和情感数据分析参与度: 
视频信息: ${JSON.stringify(videoInfo)}
情感数据: ${JSON.stringify(sentimentData)}

字幕数据可用，可以进行深度参与度分析：
      
请分析视频的参与度指标，返回JSON格式包括：
- 参与度率 (基于字幕节奏和情感变化)
- 高峰参与时间段
- 潜在流失点
- 内容吸引力评分
- 观众留存预测`
      } else {
        prompt = `基于视频元数据和情感数据分析参与度: 
视频信息: ${JSON.stringify(videoInfo)}
情感数据: ${JSON.stringify(sentimentData)}

由于该视频没有字幕，请基于可用数据进行参与度分析：
- 观看数与点赞比例
- 评论数与观看数比例  
- 视频时长与内容类型的匹配度
- 标题吸引力评估
- 发布时间对参与度的影响

请分析视频的参与度指标，返回JSON格式包括：
- 参与度率估算 (基于数据比例)
- 关键参与因素
- 内容吸引力评分
- 观众互动质量
- 改进建议`
      }
    }

    try {
      console.log('📡 发送API请求: analyzeEngagement')
      const response = await withTimeout(geminiApi.callApi(prompt), 30000)
      console.log('✅ API响应收到: analyzeEngagement')
      
      return typeof response === 'string' ? JSON.parse(response) : response
    } catch (error) {
      console.error('❌ analyzeEngagement失败:', error)
      if (error.message === 'API调用超时') {
        // 超时时返回模拟数据
        return {
          engagementRate: 75,
          peakTimes: ['0:30', '2:15', '4:45'],
          dropoffPoints: ['1:20', '3:30'],
          retentionRate: 68,
          interactionPattern: 'high',
          hourlyViews: []
        }
      }
      throw new Error('参与度分析失败：' + error.message)
    }
  }

  const generateInsights = async (videoInfo, sentimentData, engagementData, originalInput) => {
    let prompt = ''
    
    if (originalInput?.type === 'srt') {
      prompt = `基于SRT字幕分析数据生成综合洞察:
内容信息: ${JSON.stringify(videoInfo)}
情感数据: ${JSON.stringify(sentimentData)}  
质量数据: ${JSON.stringify(engagementData)}

请生成SRT内容综合分析报告，返回JSON格式包括：
- 总结
- 内容优势
- 表达改进建议
- 内容趋势分析
- 优化推荐策略

SRT综合洞察：生成最终内容分析报告和优化建议。`
    } else {
      // URL类型 - 检查是否有字幕数据
      const hasVideoData = originalInput.videoData && originalInput.videoData.success
      const hasSubtitles = hasVideoData && originalInput.videoData.data?.hasSubtitles
      
      if (hasSubtitles) {
        prompt = `基于完整视频数据和字幕分析生成综合洞察:
视频信息: ${JSON.stringify(videoInfo)}
情感数据: ${JSON.stringify(sentimentData)}  
参与度数据: ${JSON.stringify(engagementData)}

拥有字幕数据，可以提供深度洞察：

请生成综合分析报告，返回JSON格式包括：
- 总结 (基于字幕内容和数据指标)
- 内容优势分析
- 改进建议 (具体可执行)
- 观众洞察
- 竞争优势分析
- 内容策略建议`
      } else {
        prompt = `基于视频元数据分析生成综合洞察:
视频信息: ${JSON.stringify(videoInfo)}
情感数据: ${JSON.stringify(sentimentData)}  
参与度数据: ${JSON.stringify(engagementData)}

虽然没有字幕，但基于现有数据仍可提供有价值的洞察：

请生成综合分析报告，返回JSON格式包括：
- 总结 (基于可获得的数据)
- 元数据优势分析
- 改进建议 (标题、描述、标签优化)
- 数据表现洞察
- 内容定位建议
- 未来优化策略
- 字幕添加建议`
      }
    }

    try {
      console.log('📡 发送API请求: generateInsights')
      const response = await withTimeout(geminiApi.callApi(prompt), 30000)
      console.log('✅ API响应收到: generateInsights')
      
      return typeof response === 'string' ? JSON.parse(response) : response
    } catch (error) {
      console.error('❌ generateInsights失败:', error)
      if (error.message === 'API调用超时') {
        // 超时时返回模拟数据
        return {
          summary: '视频分析完成，数据正在处理中',
          strengths: ['内容结构清晰', '观众参与度良好'],
          improvements: ['可以增强开场吸引力', '优化标题表达'],
          trends: ['内容趋向积极正面'],
          recommendations: ['继续保持当前风格', '增加互动元素']
        }
      }
      throw new Error('综合洞察生成失败：' + error.message)
    }
  }

  const startAnalysis = useCallback(async (input) => {
    const analysisId = `analysis_${Date.now()}`
    console.log(`🚀 [PROBE-${analysisId}] 开始AI分析:`, input)
    console.log(`📊 [PROBE-${analysisId}] 输入数据深度分析:`)
    console.log(`   - 分析ID: ${analysisId}`)
    console.log(`   - 类型: ${input.type}`)
    console.log(`   - 开始时间: ${new Date().toISOString()}`)
    
    if (input.type === 'url') {
      console.log(`   - URL: ${input.data}`)
      console.log(`   - 完整input对象:`, JSON.stringify(input, null, 2))
      
      // 详细检查videoData结构
      console.log(`   - videoData存在: ${!!input.videoData}`)
      if (input.videoData) {
        console.log(`   - videoData.success: ${input.videoData.success}`)
        console.log(`   - videoData结构:`, Object.keys(input.videoData))
        
        if (input.videoData.success && input.videoData.data) {
          console.log(`   - videoData.data存在: ${!!input.videoData.data}`)
          console.log(`   - videoData.data.hasSubtitles: ${input.videoData.data.hasSubtitles}`)
          console.log(`   - videoData.data.srtContent长度: ${input.videoData.data.srtContent?.length || 0}`)
          console.log(`   - videoData.data字段:`, Object.keys(input.videoData.data))
          
          // 检查srtContent的实际内容
          if (input.videoData.data.srtContent) {
            console.log(`   - srtContent类型: ${typeof input.videoData.data.srtContent}`)
            console.log(`   - srtContent前100字符:`, input.videoData.data.srtContent.substring(0, 100))
          } else {
            console.log(`   - ⚠️ srtContent为空:`, input.videoData.data.srtContent)
          }
        } else {
          console.log(`   - ❌ videoData失败或data为空`)
          if (input.videoData.error) {
            console.log(`   - videoData错误:`, input.videoData.error)
          }
        }
      }
    }
    
    setIsAnalyzing(true)
    setAnalysisStep(1)
    setError(null)
    setAnalysisResults(null)

    try {
      // 步骤1: 内容提取
      console.log(`📝 [PROBE-${analysisId}] 步骤1: 开始内容提取...`)
      console.log(`📝 [PROBE-${analysisId}] 传入extractVideoInfo的input:`, JSON.stringify(input, null, 2))
      setAnalysisStep(1)
      await sleep(2000)
      const contentInfo = await extractVideoInfo(input)
      console.log(`✅ [PROBE-${analysisId}] 步骤1完成 - 内容信息:`, contentInfo)
      
      // 步骤2: 情感分析
      console.log(`😊 [PROBE-${analysisId}] 步骤2: 开始情感分析...`)
      setAnalysisStep(2)
      await sleep(2500)
      const sentimentData = await analyzeSentiment(contentInfo, input)
      console.log(`✅ [PROBE-${analysisId}] 步骤2完成 - 情感数据:`, sentimentData)
      
      // 步骤3: 参与度分析
      console.log(`📊 [PROBE-${analysisId}] 步骤3: 开始参与度分析...`)
      setAnalysisStep(3)
      await sleep(2000)
      const engagementData = await analyzeEngagement(contentInfo, sentimentData, input)
      console.log(`✅ [PROBE-${analysisId}] 步骤3完成 - 参与度数据:`, engagementData)
      
      // 步骤4: 综合洞察
      console.log(`🧠 [PROBE-${analysisId}] 步骤4: 生成综合洞察...`)
      setAnalysisStep(4)
      await sleep(2200)
      const insights = await generateInsights(contentInfo, sentimentData, engagementData, input)
      console.log(`✅ [PROBE-${analysisId}] 步骤4完成 - 综合洞察:`, insights)
      
      // 完成分析
      const results = {
        contentInfo,
        sentimentData,
        engagementData,
        insights,
        inputType: input.type,
        analyzedAt: new Date().toISOString()
      }
      
      console.log(`🎉 [PROBE-${analysisId}] AI分析完成! 最终结果:`, results)
      console.log(`🎉 [PROBE-${analysisId}] 分析耗时:`, Date.now() - parseInt(analysisId.split('_')[1]), 'ms')
      
      // 如果有视频数据，保存到频道分析系统
      if (input.videoData || input.associatedUrl) {
        try {
          const channelResult = channelAnalysisService.addVideoToChannel(
            input.videoData, 
            results, 
            input
          )
          
          if (channelResult.success) {
            console.log(`📊 频道数据已更新: ${channelResult.channelName} (${channelResult.totalVideos}个视频)`)
            if (channelResult.canAnalyze) {
              console.log('✨ 频道现在可以进行深度分析了!')
            }
          }
        } catch (channelError) {
          console.warn('频道数据保存失败:', channelError)
          // 不影响主要分析流程
        }
      }
      
      setAnalysisResults(results)
      setIsAnalyzing(false)
      setAnalysisStep(0)
      
    } catch (err) {
      console.error('❌ 分析失败:', err)
      console.error('错误详情:', {
        message: err.message,
        stack: err.stack,
        input: input,
        step: analysisStep
      })
      setError(err.message || '分析过程中发生错误')
      setIsAnalyzing(false)
      setAnalysisStep(0)
    }
  }, [])

  const resetAnalysis = useCallback(() => {
    setIsAnalyzing(false)
    setAnalysisStep(0)
    setAnalysisResults(null)
    setError(null)
  }, [])

  return {
    isAnalyzing,
    analysisStep,
    analysisResults,
    error,
    startAnalysis,
    analyzeVideo: startAnalysis, // 添加别名以保持兼容性
    resetAnalysis
  }
}