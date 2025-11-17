/**
 * YouTube数据爬虫服务
 * 自动抓取视频基础信息和字幕数据
 */

import demoDataService from './demoDataService.js'

class YouTubeDataService {
  constructor() {
    this.corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://cors.bridged.cc/',
      'https://api.codetabs.com/v1/proxy?quest='
    ]
    this.currentProxyIndex = 0
    this.cache = new Map() // 添加缓存管理
    this.cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
    
    // Scrapingdog API配置
    this.scrapingdogApiKey = import.meta.env.VITE_SCRAPINGDOG_API_KEY || ''
    this.scrapingdogBaseUrl = 'https://api.scrapingdog.com/youtube/transcripts'
    
    // API调用历史记录
    this.apiCallHistory = []
    this.maxHistorySize = 50
  }

  /**
   * 从YouTube URL提取视频ID
   */
  extractVideoId(url) {
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
    
    throw new Error('无法从URL中提取视频ID')
  }

  /**
   * 获取下一个CORS代理
   */
  getNextProxy() {
    const proxy = this.corsProxies[this.currentProxyIndex]
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.corsProxies.length
    return proxy
  }

  /**
   * 通过代理请求YouTube页面
   */
  async fetchWithProxy(url, maxRetries = 3) {
    let lastError = null
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const proxy = this.getNextProxy()
        const proxyUrl = proxy + encodeURIComponent(url)
        
        console.log(`🔗 尝试代理 ${i + 1}/${maxRetries}:`, proxy)
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return await response.text()
      } catch (error) {
        console.warn(`代理 ${i + 1} 失败:`, error.message)
        lastError = error
        
        // 等待一下再尝试下一个代理
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    
    throw new Error(`所有代理都失败了。最后错误: ${lastError?.message}`)
  }

  /**
   * 从YouTube页面HTML中提取视频信息
   */
  parseVideoInfo(html) {
    try {
      const videoInfo = {
        title: '',
        description: '',
        channelName: '',
        channelId: '',
        channelUrl: '',
        channelAvatar: '',
        subscriberCount: '',
        viewCount: '',
        likeCount: '',
        commentCount: '',
        duration: '',
        publishDate: '',
        category: '',
        tags: [],
        thumbnails: {
          maxres: '',      // 1280x720
          standard: '',    // 640x480  
          high: '',        // 480x360
          medium: '',      // 320x180
          default: ''      // 120x90
        }
      }

      // 生成缩略图URLs (优先使用videoId)
      let videoId = null
      const videoIdMatch = html.match(/"videoId":"([^"]+)"/)
      if (videoIdMatch) {
        videoId = videoIdMatch[1]
      } else {
        // 从URL提取作为fallback
        try {
          videoId = this.extractVideoId(html.match(/canonical.*?youtube\.com\/watch\?v=([^"&]+)/)?.[1] || '')
        } catch (e) {
          console.warn('无法提取videoId:', e)
        }
      }
      
      if (videoId) {
        const thumbnailUrls = this.generateThumbnailUrls(videoId)
        videoInfo.thumbnails = {
          ...thumbnailUrls,
          best: thumbnailUrls.high,
          bestQuality: 'high'
        }
      }

      // 提取标题
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/)
      if (titleMatch) {
        videoInfo.title = titleMatch[1].replace(' - YouTube', '').trim()
      }

      // 尝试从JSON数据中提取更详细信息
      const jsonDataMatches = html.match(/var ytInitialData = ({.+?});/)
      if (jsonDataMatches) {
        try {
          const data = JSON.parse(jsonDataMatches[1])
          const contents = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents
          
          if (contents) {
            const primaryInfo = contents.find(c => c.videoPrimaryInfoRenderer)
            const secondaryInfo = contents.find(c => c.videoSecondaryInfoRenderer)
            
            if (primaryInfo) {
              const info = primaryInfo.videoPrimaryInfoRenderer
              
              // 标题
              if (info.title?.runs?.[0]?.text) {
                videoInfo.title = info.title.runs[0].text
              }
              
              // 观看数
              if (info.viewCount?.videoViewCountRenderer?.viewCount?.simpleText) {
                videoInfo.viewCount = info.viewCount.videoViewCountRenderer.viewCount.simpleText
              }
              
              // 发布日期
              if (info.dateText?.simpleText) {
                videoInfo.publishDate = info.dateText.simpleText
              }
              
              // 时长信息
              if (info.lengthText?.simpleText) {
                videoInfo.duration = info.lengthText.simpleText
              }
            }
            
            if (secondaryInfo) {
              const info = secondaryInfo.videoSecondaryInfoRenderer
              
              // 频道名称
              if (info.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text) {
                videoInfo.channelName = info.owner.videoOwnerRenderer.title.runs[0].text
              }
              
              // 频道ID
              if (info.owner?.videoOwnerRenderer?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId) {
                videoInfo.channelId = info.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId
                videoInfo.channelUrl = `https://www.youtube.com/channel/${videoInfo.channelId}`
              }
              
              // 频道头像
              if (info.owner?.videoOwnerRenderer?.thumbnail?.thumbnails?.[0]?.url) {
                videoInfo.channelAvatar = info.owner.videoOwnerRenderer.thumbnail.thumbnails[0].url
              }
              
              // 订阅数
              if (info.owner?.videoOwnerRenderer?.subscriberCountText?.simpleText) {
                videoInfo.subscriberCount = info.owner.videoOwnerRenderer.subscriberCountText.simpleText
              }
              
              // 描述
              if (info.description?.runs) {
                videoInfo.description = info.description.runs.map(r => r.text).join('')
              }
            }
            
            // 从其他地方尝试获取点赞数、评론数等
            try {
              // 查找engagement数据
              const engagementData = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.find(c => 
                c.videoPrimaryInfoRenderer?.videoActions?.menuRenderer?.topLevelButtons
              )
              
              if (engagementData) {
                const buttons = engagementData.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons
                
                // 点赞数
                const likeButton = buttons.find(b => b.toggleButtonRenderer?.defaultIcon?.iconType === 'LIKE')
                if (likeButton?.toggleButtonRenderer?.defaultText?.accessibility?.accessibilityData?.label) {
                  videoInfo.likeCount = likeButton.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label
                }
              }
              
              // 评论数据
              const commentsSection = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.find(c =>
                c.itemSectionRenderer?.contents?.find(item => 
                  item.commentsEntryPointHeaderRenderer || item.continuationItemRenderer
                )
              )
              
              if (commentsSection) {
                const commentsHeader = commentsSection.itemSectionRenderer?.contents?.find(item => 
                  item.commentsEntryPointHeaderRenderer
                )?.commentsEntryPointHeaderRenderer
                
                if (commentsHeader?.commentCount?.simpleText) {
                  videoInfo.commentCount = commentsHeader.commentCount.simpleText
                }
              }
              
              // 标签/关键词
              try {
                const metaTags = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.find(c =>
                  c.videoSecondaryInfoRenderer
                )?.videoSecondaryInfoRenderer?.metadataRowContainer?.metadataRowContainerRenderer?.rows
                
                if (metaTags) {
                  const categoryRow = metaTags.find(row => 
                    row.metadataRowRenderer?.title?.simpleText?.includes('类别') ||
                    row.metadataRowRenderer?.title?.simpleText?.includes('Category')
                  )
                  
                  if (categoryRow?.metadataRowRenderer?.contents?.[0]?.runs?.[0]?.text) {
                    videoInfo.category = categoryRow.metadataRowRenderer.contents[0].runs[0].text
                  }
                }
              } catch (e) {
                console.warn('提取标签信息失败:', e)
              }
              
            } catch (e) {
              console.warn('提取engagement数据失败:', e)
            }
          }
        } catch (e) {
          console.warn('解析JSON数据失败:', e)
        }
      }

      // 如果JSON解析失败，尝试备用方法
      if (!videoInfo.channelName) {
        const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/)
        if (channelMatch) {
          videoInfo.channelName = channelMatch[1]
        }
      }

      // 提取描述（备用方法）
      if (!videoInfo.description) {
        const descMatch = html.match(/"shortDescription":"([^"]+)"/)
        if (descMatch) {
          videoInfo.description = descMatch[1].replace(/\\n/g, '\n')
        }
      }

      console.log('📋 提取的视频信息:', videoInfo)
      return videoInfo
    } catch (error) {
      console.error('解析视频信息失败:', error)
      throw new Error('视频信息解析失败')
    }
  }

  /**
   * 尝试获取字幕URL
   */
  async extractSubtitleUrls(html, videoId) {
    try {
      const subtitleUrls = []
      
      // 查找字幕配置
      const captionTracksMatch = html.match(/"captionTracks":(\[.+?\])/)
      if (captionTracksMatch) {
        const captionTracks = JSON.parse(captionTracksMatch[1])
        
        for (const track of captionTracks) {
          if (track.baseUrl && (track.languageCode === 'zh' || track.languageCode === 'zh-CN' || track.languageCode === 'en')) {
            subtitleUrls.push({
              url: track.baseUrl,
              language: track.name?.simpleText || track.languageCode,
              languageCode: track.languageCode,
              isAutoGenerated: track.kind === 'asr'
            })
          }
        }
      }
      
      console.log('🎬 找到字幕链接:', subtitleUrls)
      return subtitleUrls
    } catch (error) {
      console.warn('提取字幕链接失败:', error)
      return []
    }
  }

  /**
   * 下载并解析字幕
   */
  async downloadSubtitles(subtitleUrl) {
    try {
      console.log('⬇️ 下载字幕:', subtitleUrl)
      
      const response = await this.fetchWithProxy(subtitleUrl)
      
      // 解析XML字幕为SRT格式
      const srtContent = this.convertXmlToSrt(response)
      
      if (!srtContent) {
        throw new Error('字幕内容为空')
      }
      
      console.log('✅ 字幕下载成功，长度:', srtContent.length)
      return srtContent
    } catch (error) {
      console.error('下载字幕失败:', error)
      throw new Error('字幕下载失败: ' + error.message)
    }
  }

  /**
   * 将YouTube XML字幕转换为SRT格式
   */
  convertXmlToSrt(xmlContent) {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
      const textElements = xmlDoc.querySelectorAll('text')
      
      let srtContent = ''
      let index = 1
      
      for (const element of textElements) {
        const start = parseFloat(element.getAttribute('start') || '0')
        const duration = parseFloat(element.getAttribute('dur') || '0')
        const end = start + duration
        const text = element.textContent?.trim() || ''
        
        if (text) {
          srtContent += `${index}\n`
          srtContent += `${this.formatTime(start)} --> ${this.formatTime(end)}\n`
          srtContent += `${text}\n\n`
          index++
        }
      }
      
      return srtContent
    } catch (error) {
      console.error('XML转SRT失败:', error)
      return null
    }
  }

  /**
   * 格式化时间为SRT格式
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  /**
   * 通过Scrapingdog API获取字幕 - 增强版本
   */
  async fetchTranscriptViaAPI(videoId) {
    const startTime = Date.now()
    const callId = `scraping_${videoId}_${startTime}`
    
    try {
      console.log('🚀 使用Scrapingdog API获取字幕 (增强版):', videoId)
      
      // 检查运行环境
      const isNode = typeof window === 'undefined'
      
      if (isNode) {
        // Node.js 环境：使用重试服务
        const { default: apiRetryService } = await import('./apiRetryService.js')
        const result = await apiRetryService.callWithRetry(
          'scrapingdog',
          this._fetchTranscriptDirect.bind(this),
          videoId,
          callId
        )
        return result
      } else {
        // 浏览器环境：直接调用，内置简单重试
        console.log('🌐 浏览器环境，使用内置重试机制')
        return await this._fetchTranscriptDirectBrowser(videoId, callId)
      }
      
    } catch (error) {
      console.error('❌ Scrapingdog API所有重试失败:', error.message)
      
      // 记录最终失败
      const callRecord = this.getApiCall(callId)
      if (callRecord) {
        callRecord.status = 'failed'
        callRecord.error = `所有重试失败: ${error.message}`
        this.updateApiCall(callRecord)
      }
      
      return null
    }
  }

  /**
   * 浏览器环境专用的字幕获取方法
   */
  async _fetchTranscriptDirectBrowser(videoId, callId, maxRetries = 3) {
    let lastError = null
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`📡 浏览器API尝试 ${attempt + 1}/${maxRetries}`)
        
        const url = `${this.scrapingdogBaseUrl}?api_key=${this.scrapingdogApiKey}&v=${videoId}`
        
        // 记录API调用开始
        const startTime = Date.now()
        const callRecord = {
          id: callId,
          videoId: videoId,
          url: url,
          startTime: startTime,
          endTime: null,
          duration: null,
          status: 'pending',
          httpStatus: null,
          responseSize: null,
          transcriptLength: null,
          error: null,
          success: false
        }
        
        this.recordApiCall(callRecord)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; HitClone/1.0)'
          }
        })
        
        const responseTime = Date.now()
        callRecord.endTime = responseTime
        callRecord.duration = responseTime - startTime
        callRecord.httpStatus = response.status
        
        console.log(`📊 浏览器API响应: ${response.status} ${response.statusText} (耗时: ${callRecord.duration}ms)`)
        
        if (!response.ok) {
          callRecord.status = 'error'
          callRecord.error = `HTTP ${response.status}: ${response.statusText}`
          this.updateApiCall(callRecord)
          
          if (response.status === 429 && attempt < maxRetries - 1) {
            console.log(`⏳ 速率限制，等待 ${(attempt + 1) * 2}秒 后重试...`)
            await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000))
            continue
          }
          
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        const responseText = JSON.stringify(data)
        callRecord.responseSize = responseText.length
        
        console.log('📝 浏览器API响应结构:', {
          hasError: !!data.error,
          hasTranscripts: !!(data.transcripts && data.transcripts.length > 0),
          transcriptsLength: data.transcripts?.length || 0,
          responseSize: callRecord.responseSize
        })
        
        if (data.error) {
          throw new Error(`API返回错误: ${data.error}`)
        }
        
        const transcripts = data.transcripts || data.transcript || []
        
        if (!transcripts || transcripts.length === 0) {
          throw new Error('视频无可用字幕')
        }
        
        // 转换为SRT格式
        console.log('🔄 浏览器环境转换字幕，条数:', transcripts.length)
        const srtContent = this.convertTranscriptToSRT(transcripts)
        
        // 更新成功记录
        callRecord.status = 'success'
        callRecord.success = true
        callRecord.transcriptLength = transcripts.length
        this.updateApiCall(callRecord)
        
        console.log(`✅ 浏览器字幕获取成功 - 原始条数: ${transcripts.length}, SRT长度: ${srtContent.length}`)
        
        return srtContent
        
      } catch (error) {
        lastError = error
        console.warn(`❌ 浏览器API尝试 ${attempt + 1} 失败:`, error.message)
        
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000) // 指数退避，最大5秒
          console.log(`⏳ ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError || new Error('所有重试都失败了')
  }

  /**
   * 直接的API调用方法（供重试服务使用）
   */
  async _fetchTranscriptDirect(videoId, callId) {
    const url = `${this.scrapingdogBaseUrl}?api_key=${this.scrapingdogApiKey}&v=${videoId}`
    console.log('📡 API请求URL:', url)
    
    // 记录API调用开始
    const startTime = Date.now()
    const callRecord = {
      id: callId,
      videoId: videoId,
      url: url,
      startTime: startTime,
      endTime: null,
      duration: null,
      status: 'pending',
      httpStatus: null,
      responseSize: null,
      transcriptLength: null,
      error: null,
      success: false
    }
    
    this.recordApiCall(callRecord)
    
    const response = await fetch(url)
    const responseTime = Date.now()
    
    // 更新调用记录
    callRecord.endTime = responseTime
    callRecord.duration = responseTime - startTime
    callRecord.httpStatus = response.status
    
    console.log(`📊 API响应状态: ${response.status} ${response.statusText} (耗时: ${callRecord.duration}ms)`)
    
    if (!response.ok) {
      callRecord.status = 'error'
      callRecord.error = `HTTP ${response.status}: ${response.statusText}`
      this.updateApiCall(callRecord)
      
      // 根据HTTP状态码决定是否重试
      if (response.status === 429) {
        throw new Error('API配额超限，需要等待')
      } else if (response.status >= 500) {
        throw new Error(`服务器错误: ${response.status} ${response.statusText}`)
      } else if (response.status === 400) {
        throw new Error(`请求错误: 视频可能不存在或无字幕`)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    }
    
    const data = await response.json()
    const responseText = JSON.stringify(data)
    callRecord.responseSize = responseText.length
    
    // 🔧 修复：API返回的是 transcripts (复数)，不是 transcript (单数)
    const transcripts = data.transcripts || data.transcript || []
    
    console.log('📝 Scrapingdog API响应结构:', {
      hasError: !!data.error,
      hasTranscripts: !!transcripts && transcripts.length > 0,
      transcriptsLength: transcripts.length,
      responseSize: callRecord.responseSize
    })
    
    if (data.error) {
      callRecord.status = 'error'
      callRecord.error = data.error
      this.updateApiCall(callRecord)
      throw new Error(`API返回错误: ${data.error}`)
    }
    
    if (!transcripts || transcripts.length === 0) {
      callRecord.status = 'no_transcript'
      callRecord.error = '视频无可用字幕'
      this.updateApiCall(callRecord)
      throw new Error('视频无可用字幕')
    }
    
    // 转换为SRT格式
    console.log('🔄 开始转换字幕到SRT格式，条数:', transcripts.length)
    console.log('📋 前3条字幕样本:', transcripts.slice(0, 3))
    
    const srtContent = this.convertTranscriptToSRT(transcripts)
    console.log('📄 SRT转换结果长度:', srtContent ? srtContent.length : 'null')
    
    // 更新成功记录
    callRecord.status = 'success'
    callRecord.success = true
    callRecord.transcriptLength = transcripts.length
    this.updateApiCall(callRecord)
    
    console.log(`✅ 字幕转换成功 - 原始条数: ${transcripts.length}, SRT长度: ${srtContent.length}`)
    
    return srtContent
  }

  /**
   * 将Scrapingdog的transcript格式转换为SRT
   */
  convertTranscriptToSRT(transcript) {
    let srtContent = ''
    let index = 1
    
    for (const item of transcript) {
      const start = item.start || 0
      const duration = item.duration || 3
      const end = start + duration
      const text = item.text || ''
      
      if (text.trim()) {
        srtContent += `${index}\n`
        srtContent += `${this.formatTime(start)} --> ${this.formatTime(end)}\n`
        srtContent += `${text.trim()}\n\n`
        index++
      }
    }
    
    return srtContent
  }

  /**
   * 生成YouTube缩略图URL
   */
  generateThumbnailUrls(videoId) {
    const baseUrl = `https://img.youtube.com/vi/${videoId}`
    return {
      maxres: `${baseUrl}/maxresdefault.jpg`,      // 1280x720
      standard: `${baseUrl}/sddefault.jpg`,        // 640x480
      high: `${baseUrl}/hqdefault.jpg`,            // 480x360
      medium: `${baseUrl}/mqdefault.jpg`,          // 320x180
      default: `${baseUrl}/default.jpg`            // 120x90
    }
  }

  /**
   * 检测缩略图是否存在
   */
  async validateThumbnail(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * 获取最佳可用缩略图
   */
  async getBestThumbnail(videoId) {
    const thumbnails = this.generateThumbnailUrls(videoId)
    
    // 按质量从高到低检查
    const priorities = ['maxres', 'standard', 'high', 'medium', 'default']
    
    for (const quality of priorities) {
      const url = thumbnails[quality]
      const isAvailable = await this.validateThumbnail(url)
      if (isAvailable) {
        return {
          ...thumbnails,
          best: url,
          bestQuality: quality
        }
      }
    }
    
    // 如果都不可用，返回默认的
    return {
      ...thumbnails,
      best: thumbnails.high, // 通常都会有high质量
      bestQuality: 'high'
    }
  }

  /**
   * 从URL提取基本信息（不依赖抓取）
   */
  extractBasicInfoFromUrl(url) {
    try {
      const videoId = this.extractVideoId(url)
      const thumbnails = this.generateThumbnailUrls(videoId)
      
      return {
        url: url,
        videoId: videoId,
        title: `YouTube视频 ${videoId}`,
        channelName: '未知频道',
        description: '',
        hasSubtitles: false,
        viewCount: '未知',
        publishDate: '',
        thumbnails: {
          ...thumbnails,
          best: thumbnails.high,
          bestQuality: 'high'
        }
      }
    } catch (error) {
      return {
        url: url,
        title: '未知视频',
        channelName: '未知频道',
        description: '',
        hasSubtitles: false,
        thumbnails: {
          maxres: '',
          standard: '',
          high: '',
          medium: '',
          default: '',
          best: '',
          bestQuality: 'none'
        }
      }
    }
  }

  /**
   * 清除特定URL的缓存
   */
  clearCache(url) {
    const videoId = this.extractVideoId(url)
    this.cache.delete(videoId)
    console.log('🧹 清除缓存:', videoId)
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this.cache.clear()
    console.log('🧹 清除所有YouTube数据缓存')
  }

  /**
   * 记录API调用
   */
  recordApiCall(callRecord) {
    this.apiCallHistory.unshift(callRecord)
    if (this.apiCallHistory.length > this.maxHistorySize) {
      this.apiCallHistory = this.apiCallHistory.slice(0, this.maxHistorySize)
    }
    console.log(`📝 记录API调用: ${callRecord.id}`)
  }

  /**
   * 更新API调用记录
   */
  updateApiCall(updatedRecord) {
    const index = this.apiCallHistory.findIndex(record => record.id === updatedRecord.id)
    if (index !== -1) {
      this.apiCallHistory[index] = updatedRecord
      console.log(`📝 更新API调用记录: ${updatedRecord.id} - ${updatedRecord.status}`)
    }
  }

  /**
   * 获取API调用记录
   */
  getApiCall(callId) {
    return this.apiCallHistory.find(record => record.id === callId)
  }

  /**
   * 获取API调用历史
   */
  getApiCallHistory(limit = 10) {
    const history = this.apiCallHistory.slice(0, limit).map(record => ({
      ...record,
      timeAgo: this.formatTimeAgo(record.startTime),
      statusDisplay: this.getStatusDisplay(record.status),
      durationDisplay: record.duration ? `${record.duration}ms` : '-'
    }))
    
    console.log(`📊 获取API调用历史: 总共${this.apiCallHistory.length}条，返回${history.length}条`)
    return history
  }

  /**
   * 格式化时间差
   */
  formatTimeAgo(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return `${seconds}秒前`
  }

  /**
   * 获取状态显示
   */
  getStatusDisplay(status) {
    const statusMap = {
      'pending': '🔄 进行中',
      'success': '✅ 成功',
      'error': '❌ 失败',
      'no_transcript': '⚠️ 无字幕'
    }
    return statusMap[status] || status
  }

  /**
   * 清除API调用历史
   */
  clearApiHistory() {
    this.apiCallHistory = []
    console.log('🧹 清除API调用历史')
  }

  /**
   * 从缓存获取数据
   */
  getCachedData(videoId) {
    const cached = this.cache.get(videoId)
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log('📦 使用缓存数据:', videoId)
      return cached.data
    }
    return null
  }

  /**
   * 保存数据到缓存
   */
  setCachedData(videoId, data) {
    this.cache.set(videoId, {
      data: data,
      timestamp: Date.now()
    })
    console.log('💾 保存数据到缓存:', videoId)
  }

  /**
   * 主要方法：获取完整的YouTube视频数据
   */
  async fetchVideoData(url) {
    const timestamp = new Date().toISOString()
    console.log('🎥 [PROBE] 开始抓取YouTube数据:', url)
    console.log('🔗 [PROBE] 输入URL:', url)
    console.log('⏰ [PROBE] 开始时间:', timestamp)
    
    // 🚀 优先检查演示数据缓存
    try {
      const demoData = demoDataService.getDemoVideoData(url)
      if (demoData) {
        console.log('⚡ [DEMO] 使用预缓存演示数据，跳过网络请求')
        return demoData
      }
    } catch (e) {
      console.warn('演示数据检查失败:', e)
    }
    
    // 清除这个URL的旧缓存，确保获取最新数据
    try {
      const videoId = this.extractVideoId(url)
      this.clearCache(url)
      console.log('🔍 提取的videoId:', videoId)
    } catch (e) {
      console.warn('URL解析失败:', e)
    }
    
    // 先提取基本信息作为fallback
    const basicInfo = this.extractBasicInfoFromUrl(url)
    console.log('📋 基础信息:', basicInfo)
    
    try {
      const videoId = this.extractVideoId(url)
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
      
      // 只使用基础URL解析获取视频信息
      let videoInfo = null
      
      console.log('🔍 使用增强URL解析获取基础视频信息')
      try {
        videoInfo = await this.enhancedUrlParsing(url, videoId)
        console.log('📈 URL解析结果:', videoInfo)
      } catch (enhanceError) {
        console.warn('❌ URL解析失败:', enhanceError.message)
        // 使用最基础的信息
        videoInfo = {
          ...basicInfo,
          title: `YouTube视频 - ${videoId}`,
          description: '基于视频ID进行分析'
        }
      }
      
      // 获取字幕 - 只使用Scrapingdog API
      let subtitles = null
      let srtContent = null
      
      console.log('🚀 [PROBE] 使用Scrapingdog API获取字幕...')
      console.log('🔍 [PROBE] 目标videoId:', videoId)
      try {
        console.log('📡 [PROBE] 调用fetchTranscriptViaAPI开始...')
        srtContent = await this.fetchTranscriptViaAPI(videoId)
        console.log('📡 [PROBE] fetchTranscriptViaAPI返回结果类型:', typeof srtContent)
        console.log('📡 [PROBE] fetchTranscriptViaAPI返回结果长度:', srtContent?.length || 'null')
        if (srtContent) {
          console.log('✅ [PROBE] Scrapingdog API获取字幕成功，长度:', srtContent.length)
          
          // 解析SRT内容
          if (window.SRTParser) {
            try {
              subtitles = window.SRTParser.parseSRT(srtContent)
              console.log('✅ SRT解析成功，条数:', subtitles?.length || 0)
            } catch (e) {
              console.warn('SRT解析失败，使用原始内容:', e)
            }
          }
        } else {
          console.warn('⚠️ [PROBE] Scrapingdog API未返回字幕内容')
          console.log('🔍 [PROBE] 调试信息: srtContent类型:', typeof srtContent, '值:', srtContent)
        }
      } catch (apiError) {
        console.error('❌ [PROBE] Scrapingdog API失败:', apiError.message)
        console.error('❌ [PROBE] 详细错误信息:', apiError)
        console.error('❌ [PROBE] 错误堆栈:', apiError.stack)
      }
      
      const result = {
        success: true,
        data: {
          url: videoUrl,
          videoId: videoId,
          ...videoInfo,
          subtitles: subtitles,
          srtContent: srtContent,
          hasSubtitles: !!srtContent
        }
      }
      
      console.log('✅ [PROBE] YouTube数据抓取完成!')
      console.log('📊 [PROBE] 结果统计:')
      console.log(`   - 视频ID: ${videoId}`)
      console.log(`   - 有字幕数据: ${!!srtContent}`)
      console.log(`   - SRT内容长度: ${srtContent ? srtContent.length : 0}`)
      console.log(`   - 解析字幕条数: ${subtitles ? subtitles.length : 0}`)
      console.log(`   - 视频标题: ${videoInfo?.title || '未知'}`)
      console.log('📦 [PROBE] 最终返回的result对象:')
      console.log('   - result.success:', result.success)
      console.log('   - result.data.hasSubtitles:', result.data.hasSubtitles)
      console.log('   - result.data.srtContent长度:', result.data.srtContent?.length || 0)
      console.log('⏰ [PROBE] 结束时间:', new Date().toISOString())
      
      return result
      
    } catch (error) {
      console.error('❌ YouTube数据抓取失败:', error)
      
      return {
        success: false,
        error: error.message,
        fallbackData: basicInfo
      }
    }
  }

  /**
   * 增强的URL解析 - 当HTML抓取失败时使用
   */
  async enhancedUrlParsing(url, videoId) {
    console.log('🔍 增强URL解析:', url)
    
    // 从URL中尝试提取一些信息
    const urlParts = new URL(url)
    const searchParams = urlParts.searchParams
    
    // 基础视频信息
    const videoInfo = {
      title: `无法获取标题 - ${videoId}`,
      description: '',
      channelName: '未知频道',
      channelId: '',
      channelUrl: '',
      channelAvatar: '',
      subscriberCount: '',
      viewCount: '未知',
      likeCount: '',
      commentCount: '',
      duration: '',
      publishDate: '',
      category: '',
      tags: [],
      thumbnails: this.generateThumbnailUrls(videoId)
    }
    
    // 尝试通过oEmbed API获取基本信息
    try {
      console.log('🔗 尝试oEmbed API')
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      
      // 直接请求，不通过代理（oEmbed通常允许跨域）
      const response = await fetch(oembedUrl)
      if (response.ok) {
        const data = await response.json()
        console.log('📺 oEmbed数据:', data)
        
        if (data.title) {
          videoInfo.title = data.title
        }
        if (data.author_name) {
          videoInfo.channelName = data.author_name
        }
        if (data.author_url) {
          videoInfo.channelUrl = data.author_url
          // 从频道URL提取频道ID
          const channelMatch = data.author_url.match(/\/channel\/([^/?]+)/)
          if (channelMatch) {
            videoInfo.channelId = channelMatch[1]
          }
        }
        
        console.log('✅ oEmbed解析成功')
      }
    } catch (oembedError) {
      console.warn('❌ oEmbed API失败:', oembedError.message)
    }
    
    // 设置缩略图
    videoInfo.thumbnails = {
      ...this.generateThumbnailUrls(videoId),
      best: this.generateThumbnailUrls(videoId).high,
      bestQuality: 'high'
    }
    
    return videoInfo
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      const testUrl = 'https://www.youtube.com'
      await this.fetchWithProxy(testUrl, 1)
      return { success: true, message: '连接正常' }
    } catch (error) {
      return { success: false, message: '连接失败: ' + error.message }
    }
  }
}

// 创建全局实例
const youTubeDataService = new YouTubeDataService()

export default youTubeDataService