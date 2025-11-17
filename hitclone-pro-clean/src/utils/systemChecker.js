/**
 * HitClone Pro 系统自检查器
 * 提供分级检查、API护栏机制和透明化调试功能
 */

class SystemChecker {
  constructor() {
    this.apiCallCount = 0
    this.maxApiCalls = 15 // 会话级别的API调用限制
    this.userConfirmation = true
    this.checkHistory = []
    
    // 检查级别定义
    this.checkLevels = {
      light: {
        name: '轻量检查',
        cost: 0,
        description: '本地检查，不消耗API',
        checks: ['urlValidation', 'localDataSync', 'componentState', 'cacheIntegrity'],
        autoRun: true,
        icon: '🔍'
      },
      standard: {
        name: '标准检查', 
        cost: 2,
        description: '包含网络请求，消耗少量API',
        checks: ['youtubeDataFetch', 'aiFormatTest', 'dataConsistency'],
        autoRun: false,
        icon: '⚡',
        confirmation: "标准检查将消耗约2次API调用来验证YouTube数据获取和AI响应格式。是否继续？"
      },
      deep: {
        name: '深度检查',
        cost: 5,
        description: '完整分析流程测试，适用于问题诊断',
        checks: ['fullAnalysisTest', 'multiApiComparison', 'performanceTest'],
        autoRun: false,
        icon: '🔬',
        confirmation: "深度检查将消耗约5次API调用进行完整的分析流程测试。建议仅在出现严重问题时使用。是否继续？"
      }
    }
  }

  /**
   * 获取当前系统状态概览
   */
  async getSystemOverview() {
    const lightChecks = await this.runLightChecks()
    const apiStatus = await this.checkApiStatus()
    
    return {
      overall: this.calculateOverallHealth(lightChecks, apiStatus),
      details: {
        ...lightChecks,
        api: apiStatus,
        apiCalls: {
          used: this.apiCallCount,
          remaining: this.maxApiCalls - this.apiCallCount,
          percentage: (this.apiCallCount / this.maxApiCalls) * 100
        }
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * 运行指定级别的检查
   */
  async runCheck(level) {
    const checkConfig = this.checkLevels[level]
    if (!checkConfig) {
      throw new Error(`未知的检查级别: ${level}`)
    }

    // 检查API预算
    if (this.apiCallCount + checkConfig.cost > this.maxApiCalls) {
      return {
        success: false,
        error: 'API_BUDGET_EXCEEDED',
        message: `API调用预算不足。当前已用：${this.apiCallCount}/${this.maxApiCalls}，需要：${checkConfig.cost}`
      }
    }

    // 记录检查开始
    const checkId = `check_${Date.now()}`
    this.checkHistory.push({
      id: checkId,
      level,
      startTime: new Date(),
      status: 'running'
    })

    try {
      const results = await this.executeChecks(checkConfig.checks, checkId)
      
      // 更新API调用计数
      this.apiCallCount += checkConfig.cost
      
      // 记录检查完成
      this.updateCheckHistory(checkId, { status: 'completed', results })
      
      return {
        success: true,
        level,
        cost: checkConfig.cost,
        results,
        apiUsed: this.apiCallCount,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      this.updateCheckHistory(checkId, { status: 'failed', error: error.message })
      return {
        success: false,
        level,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 执行轻量级检查（不消耗API）
   */
  async runLightChecks() {
    const results = {}
    
    try {
      // URL验证检查
      results.urlValidation = this.checkUrlValidation()
      
      // 本地数据同步检查
      results.localDataSync = this.checkLocalDataSync()
      
      // 组件状态检查
      results.componentState = this.checkComponentState()
      
      // 缓存完整性检查
      results.cacheIntegrity = this.checkCacheIntegrity()
      
      return results
    } catch (error) {
      console.error('轻量检查失败:', error)
      return { error: error.message }
    }
  }

  /**
   * URL验证检查
   */
  checkUrlValidation() {
    const currentUrl = this.getCurrentVideoUrl()
    
    if (!currentUrl) {
      return {
        status: 'info',
        message: '当前未输入视频URL',
        details: '这是正常状态，输入URL后此项将被验证'
      }
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    const bilibiliRegex = /^(https?:\/\/)?(www\.)?bilibili\.com\/.+/
    
    const isValid = youtubeRegex.test(currentUrl) || bilibiliRegex.test(currentUrl)
    
    if (isValid) {
      // 提取videoId验证
      const videoIdMatch = currentUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const videoId = videoIdMatch ? videoIdMatch[1] : null
      
      return {
        status: 'success',
        message: 'URL格式正确',
        details: {
          url: currentUrl,
          platform: youtubeRegex.test(currentUrl) ? 'YouTube' : 'Bilibili',
          videoId: videoId || '未检测到',
          valid: true
        }
      }
    } else {
      return {
        status: 'error',
        message: 'URL格式无效',
        details: {
          url: currentUrl,
          valid: false,
          suggestion: '请输入有效的YouTube或Bilibili视频链接'
        }
      }
    }
  }

  /**
   * 本地数据同步检查
   */
  checkLocalDataSync() {
    try {
      const currentUrl = this.getCurrentVideoUrl()
      const storedVideoData = this.getStoredVideoData()
      
      if (!currentUrl && !storedVideoData) {
        return {
          status: 'info',
          message: '无活跃的分析会话',
          details: '当前没有正在分析的视频数据'
        }
      }

      // 检查URL与存储数据的一致性
      if (currentUrl && storedVideoData) {
        const urlMatches = storedVideoData.url === currentUrl
        const hasVideoId = storedVideoData.videoId && storedVideoData.videoId !== 'unknown'
        
        return {
          status: urlMatches ? 'success' : 'warning',
          message: urlMatches ? '数据同步正常' : '检测到数据不一致',
          details: {
            currentUrl,
            storedUrl: storedVideoData.url,
            videoId: storedVideoData.videoId,
            hasValidData: hasVideoId,
            synchronized: urlMatches
          }
        }
      }

      return {
        status: 'info',
        message: '部分数据可用',
        details: {
          hasUrl: !!currentUrl,
          hasStoredData: !!storedVideoData
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: '数据同步检查失败',
        details: error.message
      }
    }
  }

  /**
   * 组件状态检查
   */
  checkComponentState() {
    try {
      const issues = []
      const componentChecks = {}

      // 检查关键DOM元素
      const videoInput = document.querySelector('input[type="url"]')
      componentChecks.videoInput = !!videoInput
      if (!videoInput) issues.push('视频输入框未找到')

      // 检查React根元素
      const reactRoot = document.querySelector('#root')
      componentChecks.reactRoot = !!reactRoot
      if (!reactRoot) issues.push('React根元素未找到')

      // 检查是否有错误边界触发
      const errorElements = document.querySelectorAll('[data-error="true"]')
      componentChecks.hasErrors = errorElements.length > 0
      if (errorElements.length > 0) issues.push(`发现${errorElements.length}个组件错误`)

      return {
        status: issues.length === 0 ? 'success' : 'warning',
        message: issues.length === 0 ? '组件状态正常' : `发现${issues.length}个问题`,
        details: {
          checks: componentChecks,
          issues: issues,
          elementsFound: {
            videoInput: !!videoInput,
            reactRoot: !!reactRoot,
            errorCount: errorElements.length
          }
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: '组件状态检查失败',
        details: error.message
      }
    }
  }

  /**
   * 缓存完整性检查
   */
  checkCacheIntegrity() {
    try {
      const cacheStats = {}
      
      // 检查localStorage
      try {
        const historyData = localStorage.getItem('hitclone-analysis-history')
        cacheStats.historyCache = {
          exists: !!historyData,
          size: historyData ? historyData.length : 0,
          entries: historyData ? JSON.parse(historyData).length : 0
        }
      } catch (e) {
        cacheStats.historyCache = { error: '历史记录缓存损坏' }
      }

      // 检查sessionStorage
      try {
        const sessionKeys = Object.keys(sessionStorage)
        cacheStats.sessionCache = {
          keyCount: sessionKeys.length,
          keys: sessionKeys.filter(key => key.includes('hitclone'))
        }
      } catch (e) {
        cacheStats.sessionCache = { error: '会话缓存访问失败' }
      }

      const hasIssues = Object.values(cacheStats).some(cache => cache.error)

      return {
        status: hasIssues ? 'warning' : 'success',
        message: hasIssues ? '缓存存在问题' : '缓存状态正常',
        details: cacheStats
      }
    } catch (error) {
      return {
        status: 'error',
        message: '缓存检查失败',
        details: error.message
      }
    }
  }

  /**
   * API状态检查（不消耗API调用）
   */
  async checkApiStatus() {
    try {
      // 检查第三方API配置
      const thirdPartyStatus = await this.checkThirdPartyApiConfig()
      
      // 检查网络连接（使用不消耗API的ping）
      const networkStatus = await this.checkNetworkConnection()
      
      return {
        status: 'success',
        message: 'API状态检查完成',
        details: {
          thirdParty: thirdPartyStatus,
          network: networkStatus,
          budget: {
            used: this.apiCallCount,
            total: this.maxApiCalls,
            remaining: this.maxApiCalls - this.apiCallCount
          }
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'API状态检查失败',
        details: error.message
      }
    }
  }

  /**
   * 执行检查项目
   */
  async executeChecks(checks, checkId) {
    const results = {}
    
    for (const checkName of checks) {
      try {
        console.log(`🔍 执行检查: ${checkName}`)
        results[checkName] = await this.executeIndividualCheck(checkName)
      } catch (error) {
        console.error(`❌ 检查失败 ${checkName}:`, error)
        results[checkName] = {
          status: 'error',
          message: `检查执行失败: ${error.message}`
        }
      }
    }
    
    return results
  }

  /**
   * 执行单个检查项目
   */
  async executeIndividualCheck(checkName) {
    switch (checkName) {
      case 'urlValidation':
        return this.checkUrlValidation()
      
      case 'localDataSync':
        return this.checkLocalDataSync()
      
      case 'componentState':
        return this.checkComponentState()
      
      case 'cacheIntegrity':
        return this.checkCacheIntegrity()
      
      case 'youtubeDataFetch':
        return await this.testYouTubeDataFetch()
      
      case 'aiFormatTest':
        return await this.testAiResponseFormat()
      
      case 'dataConsistency':
        return await this.testDataConsistency()
      
      case 'fullAnalysisTest':
        return await this.testFullAnalysisFlow()
      
      case 'multiApiComparison':
        return await this.testMultiApiComparison()
      
      case 'performanceTest':
        return await this.testSystemPerformance()
      
      default:
        throw new Error(`未知的检查项目: ${checkName}`)
    }
  }

  /**
   * 工具方法：获取当前视频URL
   */
  getCurrentVideoUrl() {
    const urlInput = document.querySelector('input[type="url"]')
    return urlInput ? urlInput.value.trim() : null
  }

  /**
   * 工具方法：获取存储的视频数据
   */
  getStoredVideoData() {
    try {
      const stored = sessionStorage.getItem('hitclone-current-video-data')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      return null
    }
  }

  /**
   * 工具方法：计算整体健康度
   */
  calculateOverallHealth(lightChecks, apiStatus) {
    const allChecks = { ...lightChecks, api: apiStatus }
    const checkResults = Object.values(allChecks)
    
    const successCount = checkResults.filter(r => r.status === 'success').length
    const warningCount = checkResults.filter(r => r.status === 'warning').length
    const errorCount = checkResults.filter(r => r.status === 'error').length
    
    if (errorCount > 0) {
      return {
        status: 'error',
        message: `发现${errorCount}个错误`,
        score: Math.max(0, 100 - (errorCount * 30) - (warningCount * 10))
      }
    } else if (warningCount > 0) {
      return {
        status: 'warning', 
        message: `发现${warningCount}个警告`,
        score: Math.max(60, 100 - (warningCount * 15))
      }
    } else {
      return {
        status: 'success',
        message: '系统运行正常',
        score: 100
      }
    }
  }

  /**
   * 更新检查历史
   */
  updateCheckHistory(checkId, updates) {
    const checkIndex = this.checkHistory.findIndex(check => check.id === checkId)
    if (checkIndex !== -1) {
      this.checkHistory[checkIndex] = {
        ...this.checkHistory[checkIndex],
        ...updates,
        endTime: new Date()
      }
    }
  }

  // 占位符方法 - 待实现的网络和API检查
  async checkThirdPartyApiConfig() {
    return { configured: false, message: '第三方API配置检查待实现' }
  }

  async checkNetworkConnection() {
    return { online: navigator.onLine, message: '基础网络连接检查' }
  }

  async testYouTubeDataFetch() {
    try {
      console.log('🧪 测试YouTube数据获取服务')
      
      // 测试URL - 使用一个公开的YouTube视频
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      
      // 动态导入YouTube服务
      const { default: youTubeDataService } = await import('../services/youTubeDataService')
      
      // 执行测试
      const result = await youTubeDataService.fetchVideoData(testUrl)
      
      if (result.success && result.data) {
        return {
          status: 'success',
          message: 'YouTube数据获取正常',
          details: {
            title: result.data.title || '测试视频',
            channel: result.data.channelName || '测试频道',
            hasSubtitles: result.data.hasSubtitles,
            thumbnails: !!result.data.thumbnails
          }
        }
      } else if (result.fallbackData) {
        return {
          status: 'warning',
          message: 'YouTube数据获取部分成功',
          details: {
            error: result.error,
            fallbackTitle: result.fallbackData.title,
            suggestion: '网络限制，但基础功能可用'
          }
        }
      } else {
        return {
          status: 'error',
          message: 'YouTube数据获取失败',
          details: {
            error: result.error || '未知错误',
            suggestion: '检查网络连接或CORS代理状态'
          }
        }
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'YouTube服务测试失败',
        details: {
          error: error.message,
          suggestion: '请检查服务是否正常加载'
        }
      }
    }
  }

  async testAiResponseFormat() {
    return { status: 'info', message: 'AI响应格式测试待实现' }
  }

  async testDataConsistency() {
    return { status: 'info', message: '数据一致性测试待实现' }
  }

  async testFullAnalysisFlow() {
    return { status: 'info', message: '完整分析流程测试待实现' }
  }

  async testMultiApiComparison() {
    return { status: 'info', message: '多API对比测试待实现' }
  }

  async testSystemPerformance() {
    return { status: 'info', message: '系统性能测试待实现' }
  }
}

export default SystemChecker