/**
 * 历史数据与频道分析集成服务
 * 自动将历史报告数据整合到频道分析中
 */

import channelAnalysisService from './channelAnalysisService'

class HistoryChannelIntegration {
  constructor() {
    this.integratedKey = 'hitclone-channel-history-integrated'
  }

  /**
   * 从历史报告构建频道数据
   */
  integrateHistoryData() {
    try {
      console.log('🔄 开始整合历史报告数据到频道分析...')
      
      // 获取历史报告数据
      const historyData = this.getHistoryReports()
      if (!historyData || historyData.length === 0) {
        console.log('📭 没有找到历史报告数据')
        return { success: false, message: 'No history data found' }
      }

      console.log(`📊 找到 ${historyData.length} 个历史报告`)

      // 按频道分组
      const channelGroups = this.groupByChannel(historyData)
      console.log(`🎯 识别出 ${Object.keys(channelGroups).length} 个频道`)

      // 为每个频道添加视频数据
      let integratedCount = 0
      Object.entries(channelGroups).forEach(([channelKey, videos]) => {
        videos.forEach(video => {
          const inputData = {
            type: video.type || 'url',
            data: video.url || video.title
          }

          channelAnalysisService.addVideoToChannel(
            video.videoData || {},
            video.analysisResults || {},
            inputData
          )
          integratedCount++
        })
      })

      // 标记已整合
      this.markAsIntegrated()

      console.log(`✅ 成功整合 ${integratedCount} 个视频到频道分析`)
      return {
        success: true,
        integratedVideos: integratedCount,
        channelCount: Object.keys(channelGroups).length
      }

    } catch (error) {
      console.error('❌ 历史数据整合失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取历史报告数据
   */
  getHistoryReports() {
    try {
      const saved = localStorage.getItem('hitclone-analysis-history')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('获取历史报告失败:', error)
      return []
    }
  }

  /**
   * 按频道分组视频
   */
  groupByChannel(historyData) {
    const groups = {}
    
    historyData.forEach(item => {
      // 尝试多种方式提取频道信息
      let channelKey = this.extractChannelKey(item)
      
      if (!groups[channelKey]) {
        groups[channelKey] = []
      }
      
      groups[channelKey].push(item)
    })

    // 过滤掉只有1个视频的频道（不足以进行频道分析）
    const filtered = {}
    Object.entries(groups).forEach(([key, videos]) => {
      if (videos.length >= 3) { // 至少3个视频
        filtered[key] = videos
      }
    })

    return filtered
  }

  /**
   * 增强的频道标识提取
   */
  extractChannelKey(item) {
    console.log('🔍 提取频道标识:', { title: item.title, channel: item.channel })
    
    // 1. 优先使用分析结果中的频道信息
    if (item.analysisResults?.contentInfo?.channel) {
      const channelName = item.analysisResults.contentInfo.channel.trim()
      console.log('✅ 从分析结果获取频道:', channelName)
      return this.normalizeChannelName(channelName)
    }
    
    // 2. 使用存储的频道信息
    if (item.channel && item.channel.trim()) {
      const channelName = item.channel.trim()
      console.log('✅ 从存储获取频道:', channelName)
      return this.normalizeChannelName(channelName)
    }

    // 3. 从URL中提取频道信息（如果有）
    if (item.url) {
      const channelFromUrl = this.extractChannelFromUrl(item.url)
      if (channelFromUrl) {
        console.log('✅ 从URL提取频道:', channelFromUrl)
        return this.normalizeChannelName(channelFromUrl)
      }
    }

    // 4. 从标题模式推断频道（更智能的推断）
    if (item.title) {
      const inferredChannel = this.inferChannelFromTitle(item.title)
      if (inferredChannel) {
        console.log('⚠️ 从标题推断频道:', inferredChannel)
        return `推断_${this.normalizeChannelName(inferredChannel)}`
      }
    }

    console.log('❌ 无法识别频道，使用默认值')
    return '未知频道'
  }

  /**
   * 标准化频道名称
   */
  normalizeChannelName(channelName) {
    return channelName
      .replace(/[@#]/g, '') // 移除特殊字符
      .replace(/\s+/g, ' ') // 标准化空格
      .trim()
      .toLowerCase()
  }

  /**
   * 从URL中提取频道信息
   */
  extractChannelFromUrl(url) {
    try {
      // YouTube频道URL模式
      const channelPatterns = [
        /youtube\.com\/channel\/([^\/\?&]+)/,
        /youtube\.com\/@([^\/\?&]+)/,
        /youtube\.com\/c\/([^\/\?&]+)/,
        /youtube\.com\/user\/([^\/\?&]+)/
      ]
      
      for (const pattern of channelPatterns) {
        const match = url.match(pattern)
        if (match) {
          return match[1]
        }
      }
      
      return null
    } catch (error) {
      console.warn('URL解析失败:', error)
      return null
    }
  }

  /**
   * 从标题推断频道名称
   */
  inferChannelFromTitle(title) {
    // 常见的标题模式
    const patterns = [
      // "频道名 - 标题" 格式
      /^([^-]+)\s*-\s*.+/,
      // "频道名: 标题" 格式  
      /^([^:]+):\s*.+/,
      // "频道名 | 标题" 格式
      /^([^|]+)\|\s*.+/,
      // "[频道名] 标题" 格式
      /^\[([^\]]+)\]\s*.+/,
      // "频道名【标题】" 格式
      /^([^【]+)【.+】/
    ]
    
    for (const pattern of patterns) {
      const match = title.match(pattern)
      if (match && match[1].trim().length > 2) {
        return match[1].trim()
      }
    }
    
    // 如果没有明显模式，使用前几个词作为可能的频道名
    const words = title.split(/\s+/)
    if (words.length >= 2) {
      const possibleChannel = words.slice(0, 2).join(' ')
      if (possibleChannel.length <= 30) { // 避免过长的推断
        return possibleChannel
      }
    }
    
    return null
  }

  /**
   * 检查是否已经整合过
   */
  isAlreadyIntegrated() {
    return localStorage.getItem(this.integratedKey) === 'true'
  }

  /**
   * 标记为已整合
   */
  markAsIntegrated() {
    localStorage.setItem(this.integratedKey, 'true')
  }

  /**
   * 重置整合状态（用于开发测试）
   */
  resetIntegrationStatus() {
    localStorage.removeItem(this.integratedKey)
    console.log('🔄 重置历史数据整合状态')
  }

  /**
   * 自动整合（只在首次运行时执行）
   */
  autoIntegrateIfNeeded() {
    if (!this.isAlreadyIntegrated()) {
      console.log('🎯 首次运行，开始自动整合历史数据...')
      return this.integrateHistoryData()
    } else {
      console.log('✅ 历史数据已经整合过，跳过')
      return { success: true, message: 'Already integrated' }
    }
  }

  /**
   * 强制重新整合
   */
  forceReintegrate() {
    this.resetIntegrationStatus()
    return this.integrateHistoryData()
  }

  /**
   * 获取整合统计信息
   */
  getIntegrationStats() {
    const channels = channelAnalysisService.getAllChannels()
    const stats = channelAnalysisService.getChannelStats()
    const historyCount = this.getHistoryReports().length

    return {
      historyReports: historyCount,
      integratedChannels: stats.totalChannels,
      analyzableChannels: stats.analyzableChannels,
      totalVideos: stats.totalVideos,
      isIntegrated: this.isAlreadyIntegrated()
    }
  }

  /**
   * 获取可用于频道分析的频道列表（超过3个视频的频道）
   */
  getAnalyzableChannelsFromHistory() {
    const historyData = this.getHistoryReports()
    const channelGroups = this.groupByChannel(historyData)
    
    return Object.entries(channelGroups).map(([channelKey, videos]) => ({
      channelName: channelKey,
      videoCount: videos.length,
      videos: videos.map(v => ({
        title: v.title,
        url: v.url,
        analysisDate: v.analysisDate,
        score: v.score
      }))
    }))
  }

  /**
   * 获取详细的频道检测报告
   */
  getDetectionReport() {
    const historyData = this.getHistoryReports()
    console.log(`📊 历史报告总数: ${historyData.length}`)
    
    // 所有频道分组（包括不足3个视频的）
    const allChannelGroups = {}
    historyData.forEach(item => {
      const channelKey = this.extractChannelKey(item)
      if (!allChannelGroups[channelKey]) {
        allChannelGroups[channelKey] = []
      }
      allChannelGroups[channelKey].push(item)
    })

    // 分类统计
    const analyzableChannels = []
    const insufficientChannels = []
    
    Object.entries(allChannelGroups).forEach(([channelKey, videos]) => {
      const channelData = {
        channelName: channelKey,
        videoCount: videos.length,
        videos: videos.map(v => ({
          title: v.title,
          url: v.url,
          analysisDate: v.analysisDate,
          score: v.score,
          hasRealChannelData: !!(v.analysisResults?.contentInfo?.channel || v.channel)
        })),
        avgScore: Math.round(videos.reduce((sum, v) => sum + (v.score || 0), 0) / videos.length),
        latestDate: videos.sort((a, b) => new Date(b.analysisDate) - new Date(a.analysisDate))[0]?.analysisDate
      }
      
      if (videos.length >= 3) {
        analyzableChannels.push(channelData)
      } else {
        insufficientChannels.push(channelData)
      }
    })

    const report = {
      totalReports: historyData.length,
      totalChannels: Object.keys(allChannelGroups).length,
      analyzableChannels: analyzableChannels.length,
      insufficientChannels: insufficientChannels.length,
      channels: {
        analyzable: analyzableChannels.sort((a, b) => b.videoCount - a.videoCount),
        insufficient: insufficientChannels.sort((a, b) => b.videoCount - a.videoCount)
      },
      detectionTimestamp: new Date().toISOString()
    }

    console.log('📋 频道检测报告:', report)
    return report
  }

  /**
   * 实时重新检测和整合
   */
  refreshDetectionAndIntegration() {
    console.log('🔄 开始实时重新检测...')
    
    // 重置整合状态，强制重新整合
    this.resetIntegrationStatus()
    
    // 重新整合数据
    const integrationResult = this.integrateHistoryData()
    
    // 获取最新的检测报告
    const detectionReport = this.getDetectionReport()
    
    return {
      integrationResult,
      detectionReport,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 手动合并频道（解决频道识别问题）
   */
  mergeChannels(targetChannelName, sourceChannelNames) {
    try {
      console.log(`🔗 合并频道: ${sourceChannelNames.join(', ')} -> ${targetChannelName}`)
      
      const historyData = this.getHistoryReports()
      const updatedData = historyData.map(item => {
        const currentChannel = this.extractChannelKey(item)
        if (sourceChannelNames.includes(currentChannel)) {
          return { ...item, channel: targetChannelName }
        }
        return item
      })
      
      // 保存更新后的数据
      localStorage.setItem('hitclone-analysis-history', JSON.stringify(updatedData))
      
      // 重新整合
      this.resetIntegrationStatus()
      const result = this.integrateHistoryData()
      
      console.log('✅ 频道合并完成')
      return result
    } catch (error) {
      console.error('❌ 频道合并失败:', error)
      return { success: false, error: error.message }
    }
  }
}

// 创建全局实例
const historyChannelIntegration = new HistoryChannelIntegration()

export default historyChannelIntegration