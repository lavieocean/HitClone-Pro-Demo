/**
 * 频道分析服务
 * 管理频道-视频映射关系，提供频道级分析功能
 */

class ChannelAnalysisService {
  constructor() {
    this.storageKey = 'hitclone-channel-data'
    this.minVideosForAnalysis = 3 // 至少需要3个视频才能进行频道分析
  }

  /**
   * 获取所有频道数据
   */
  getAllChannels() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('获取频道数据失败:', error)
      return {}
    }
  }

  /**
   * 保存频道数据
   */
  saveChannelData(channelData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(channelData))
      return true
    } catch (error) {
      console.error('保存频道数据失败:', error)
      return false
    }
  }

  /**
   * 从视频数据中提取频道信息
   */
  extractChannelInfo(videoData, analysisResults) {
    // 优先使用自动抓取的数据
    if (videoData && videoData.channelId && videoData.channelName) {
      return {
        channelId: videoData.channelId,
        channelName: videoData.channelName,
        channelUrl: `https://www.youtube.com/channel/${videoData.channelId}`
      }
    }

    // 从URL中提取频道信息（如果可能）
    if (videoData && videoData.url) {
      const channelMatch = videoData.url.match(/\/channel\/([^\/\?]+)/)
      if (channelMatch) {
        return {
          channelId: channelMatch[1],
          channelName: videoData.channelName || '未知频道',
          channelUrl: `https://www.youtube.com/channel/${channelMatch[1]}`
        }
      }
    }

    // 从分析结果中提取
    const channelName = analysisResults?.contentInfo?.channel || 
                       analysisResults?.meta?.channel_name || 
                       videoData?.channelName || 
                       '未知频道'

    // 生成一个基于频道名的简单ID（用于没有API的情况）
    const channelId = this.generateChannelId(channelName)

    return {
      channelId: channelId,
      channelName: channelName,
      channelUrl: null
    }
  }

  /**
   * 为频道名生成唯一ID
   */
  generateChannelId(channelName) {
    return 'ch_' + channelName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').toLowerCase()
  }

  /**
   * 添加视频到频道记录
   */
  addVideoToChannel(videoData, analysisResults, inputData) {
    try {
      const channelInfo = this.extractChannelInfo(videoData, analysisResults)
      const allChannels = this.getAllChannels()

      // 创建视频记录
      const videoRecord = {
        id: this.generateVideoId(inputData.data),
        url: inputData.data,
        title: videoData?.title || analysisResults?.contentInfo?.title || '未知标题',
        description: videoData?.description || '',
        viewCount: videoData?.viewCount || analysisResults?.contentInfo?.views || '0',
        publishDate: videoData?.publishDate || '',
        analysisResults: analysisResults,
        videoData: videoData,
        hasSubtitles: videoData?.hasSubtitles || false,
        timestamp: new Date().toISOString(),
        analysisDate: new Date().toLocaleDateString('zh-CN')
      }

      // 如果频道不存在，创建新频道记录
      if (!allChannels[channelInfo.channelId]) {
        allChannels[channelInfo.channelId] = {
          channelId: channelInfo.channelId,
          channelName: channelInfo.channelName,
          channelUrl: channelInfo.channelUrl,
          videos: [],
          totalVideos: 0,
          firstAnalysisDate: new Date().toLocaleDateString('zh-CN'),
          lastAnalysisDate: new Date().toLocaleDateString('zh-CN'),
          canAnalyze: false,
          channelAnalysisResults: null
        }
      }

      const channel = allChannels[channelInfo.channelId]

      // 检查是否已存在相同视频（避免重复）
      const existingIndex = channel.videos.findIndex(v => v.url === videoRecord.url)
      if (existingIndex >= 0) {
        // 更新现有记录
        channel.videos[existingIndex] = videoRecord
        console.log('🔄 更新现有视频记录:', videoRecord.title)
      } else {
        // 添加新视频
        channel.videos.push(videoRecord)
        console.log('➕ 添加新视频到频道:', channelInfo.channelName)
      }

      // 更新频道统计
      channel.totalVideos = channel.videos.length
      channel.lastAnalysisDate = new Date().toLocaleDateString('zh-CN')
      channel.canAnalyze = channel.totalVideos >= this.minVideosForAnalysis

      // 按时间排序（最新的在前）
      channel.videos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // 保存数据
      this.saveChannelData(allChannels)

      console.log(`✅ 频道数据已更新: ${channelInfo.channelName} (${channel.totalVideos}个视频)`)

      return {
        success: true,
        channelId: channelInfo.channelId,
        channelName: channelInfo.channelName,
        totalVideos: channel.totalVideos,
        canAnalyze: channel.canAnalyze
      }
    } catch (error) {
      console.error('添加视频到频道失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 生成视频唯一ID
   */
  generateVideoId(url) {
    // 从YouTube URL提取视频ID
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    // 如果不是YouTube URL，生成hash
    return 'vid_' + btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
  }

  /**
   * 获取特定频道的数据
   */
  getChannelData(channelId) {
    const allChannels = this.getAllChannels()
    return allChannels[channelId] || null
  }

  /**
   * 获取可以进行分析的频道列表
   */
  getAnalyzableChannels() {
    const allChannels = this.getAllChannels()
    return Object.values(allChannels).filter(channel => channel.canAnalyze)
  }

  /**
   * 获取频道统计信息
   */
  getChannelStats() {
    const allChannels = this.getAllChannels()
    const channels = Object.values(allChannels)

    return {
      totalChannels: channels.length,
      analyzableChannels: channels.filter(c => c.canAnalyze).length,
      totalVideos: channels.reduce((sum, c) => sum + c.totalVideos, 0),
      channelsWithSubtitles: channels.filter(c => 
        c.videos.some(v => v.hasSubtitles)
      ).length
    }
  }

  /**
   * 删除频道数据
   */
  deleteChannel(channelId) {
    try {
      const allChannels = this.getAllChannels()
      if (allChannels[channelId]) {
        delete allChannels[channelId]
        this.saveChannelData(allChannels)
        console.log('🗑️ 频道数据已删除:', channelId)
        return true
      }
      return false
    } catch (error) {
      console.error('删除频道失败:', error)
      return false
    }
  }

  /**
   * 删除特定视频
   */
  deleteVideo(channelId, videoId) {
    try {
      const allChannels = this.getAllChannels()
      const channel = allChannels[channelId]
      
      if (channel) {
        channel.videos = channel.videos.filter(v => v.id !== videoId)
        channel.totalVideos = channel.videos.length
        channel.canAnalyze = channel.totalVideos >= this.minVideosForAnalysis

        if (channel.totalVideos === 0) {
          // 如果没有视频了，删除整个频道
          delete allChannels[channelId]
        }

        this.saveChannelData(allChannels)
        console.log('🗑️ 视频已删除:', videoId)
        return true
      }
      return false
    } catch (error) {
      console.error('删除视频失败:', error)
      return false
    }
  }

  /**
   * 清空所有频道数据
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey)
      console.log('🧹 所有频道数据已清空')
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      return false
    }
  }

  /**
   * 导出频道数据
   */
  exportChannelData() {
    try {
      const data = this.getAllChannels()
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: data
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `hitclone-channels-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      console.log('📋 频道数据已导出')
      return true
    } catch (error) {
      console.error('导出数据失败:', error)
      return false
    }
  }

  /**
   * 导入频道数据
   */
  async importChannelData(file) {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (importData.data) {
        this.saveChannelData(importData.data)
        console.log('📥 频道数据已导入')
        return { success: true, channels: Object.keys(importData.data).length }
      } else {
        throw new Error('导入文件格式错误')
      }
    } catch (error) {
      console.error('导入数据失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 保存频道分析结果
   */
  saveChannelAnalysis(channelId, analysisResults) {
    try {
      const allChannels = this.getAllChannels()
      const channel = allChannels[channelId]
      
      if (channel) {
        channel.channelAnalysisResults = analysisResults
        channel.lastChannelAnalysisDate = new Date().toISOString()
        this.saveChannelData(allChannels)
        
        console.log('✅ 频道分析结果已保存:', channelId)
        return true
      }
      return false
    } catch (error) {
      console.error('保存频道分析失败:', error)
      return false
    }
  }

  /**
   * 获取频道的视频分析摘要
   */
  getChannelVideosSummary(channelId) {
    const channel = this.getChannelData(channelId)
    if (!channel) return null

    const videos = channel.videos
    const totalViews = videos.reduce((sum, video) => {
      const viewCount = parseInt(video.viewCount?.replace(/[^0-9]/g, '') || '0')
      return sum + viewCount
    }, 0)

    const avgViews = totalViews / videos.length
    const hasSubtitlesCount = videos.filter(v => v.hasSubtitles).length

    return {
      totalVideos: videos.length,
      totalViews: totalViews,
      avgViews: Math.round(avgViews),
      hasSubtitlesRatio: hasSubtitlesCount / videos.length,
      dateRange: {
        first: videos[videos.length - 1]?.analysisDate,
        last: videos[0]?.analysisDate
      },
      topVideos: videos
        .sort((a, b) => {
          const aViews = parseInt(a.viewCount?.replace(/[^0-9]/g, '') || '0')
          const bViews = parseInt(b.viewCount?.replace(/[^0-9]/g, '') || '0')
          return bViews - aViews
        })
        .slice(0, 3)
    }
  }
}

// 创建全局实例
const channelAnalysisService = new ChannelAnalysisService()

export default channelAnalysisService