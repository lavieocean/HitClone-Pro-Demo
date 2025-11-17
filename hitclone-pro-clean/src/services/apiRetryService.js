/**
 * API重试服务 - 实现智能重试机制和限流处理
 */

class ApiRetryService {
  constructor() {
    this.retryConfigs = {
      scrapingdog: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
        rateLimitDelay: 60000 // 1分钟
      },
      gemini: {
        maxRetries: 2,
        baseDelay: 2000,
        maxDelay: 8000,
        backoffFactor: 1.5,
        rateLimitDelay: 30000 // 30秒
      }
    }
    
    this.callHistory = {
      scrapingdog: [],
      gemini: []
    }
  }

  /**
   * 带重试的API调用
   */
  async callWithRetry(apiName, apiFunction, ...args) {
    const config = this.retryConfigs[apiName]
    if (!config) {
      throw new Error(`未知的API服务: ${apiName}`)
    }

    let lastError = null
    let attempt = 0

    while (attempt <= config.maxRetries) {
      try {
        // 检查速率限制
        if (this.isRateLimited(apiName)) {
          const waitTime = this.getRateLimitWaitTime(apiName)
          console.log(`⏱️ ${apiName} API速率受限，等待 ${Math.round(waitTime/1000)}秒...`)
          await this.sleep(waitTime)
        }

        // 记录调用开始
        const callStart = Date.now()
        this.recordApiCall(apiName, 'started', callStart)

        // 执行API调用
        console.log(`🚀 ${apiName} API调用尝试 ${attempt + 1}/${config.maxRetries + 1}`)
        const result = await apiFunction(...args)

        // 记录成功
        this.recordApiCall(apiName, 'success', callStart)
        console.log(`✅ ${apiName} API调用成功`)
        
        return result

      } catch (error) {
        lastError = error
        attempt++

        // 记录失败
        this.recordApiCall(apiName, 'failed', Date.now() - 1000, error)

        console.warn(`❌ ${apiName} API调用失败 (尝试 ${attempt}/${config.maxRetries + 1}):`, error.message)

        // 如果是最后一次尝试，抛出错误
        if (attempt > config.maxRetries) {
          console.error(`💥 ${apiName} API所有重试都失败了`)
          throw error
        }

        // 计算退避延迟
        const delay = this.calculateBackoffDelay(config, attempt)
        console.log(`⏳ ${Math.round(delay/1000)}秒后重试...`)
        await this.sleep(delay)
      }
    }

    throw lastError
  }

  /**
   * 计算指数退避延迟
   */
  calculateBackoffDelay(config, attempt) {
    const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1)
    return Math.min(delay, config.maxDelay)
  }

  /**
   * 检查是否受速率限制
   */
  isRateLimited(apiName) {
    const history = this.callHistory[apiName]
    if (!history || history.length === 0) return false

    const now = Date.now()
    const recentCalls = history.filter(call => 
      now - call.timestamp < 60000 && call.status === 'success'
    )

    // ScrapingDog: 30次/分钟限制
    // Gemini: 更宽松的限制
    const limits = {
      scrapingdog: 25, // 留5次缓冲
      gemini: 50
    }

    return recentCalls.length >= (limits[apiName] || 30)
  }

  /**
   * 获取速率限制等待时间
   */
  getRateLimitWaitTime(apiName) {
    const history = this.callHistory[apiName]
    const now = Date.now()
    const oldestRecentCall = history
      .filter(call => now - call.timestamp < 60000)
      .sort((a, b) => a.timestamp - b.timestamp)[0]

    if (!oldestRecentCall) return 0

    return 60000 - (now - oldestRecentCall.timestamp) + 1000 // 加1秒缓冲
  }

  /**
   * 记录API调用
   */
  recordApiCall(apiName, status, timestamp, error = null) {
    if (!this.callHistory[apiName]) {
      this.callHistory[apiName] = []
    }

    this.callHistory[apiName].push({
      timestamp,
      status,
      error: error ? error.message : null
    })

    // 保持历史记录在合理大小
    if (this.callHistory[apiName].length > 100) {
      this.callHistory[apiName] = this.callHistory[apiName].slice(-50)
    }
  }

  /**
   * 获取API统计信息
   */
  getApiStats(apiName) {
    const history = this.callHistory[apiName] || []
    const now = Date.now()
    const last24h = history.filter(call => now - call.timestamp < 24 * 60 * 60 * 1000)
    const lastHour = history.filter(call => now - call.timestamp < 60 * 60 * 1000)

    const stats = {
      total: history.length,
      last24h: last24h.length,
      lastHour: lastHour.length,
      successRate: 0,
      avgResponseTime: 0,
      isRateLimited: this.isRateLimited(apiName)
    }

    if (last24h.length > 0) {
      const successful = last24h.filter(call => call.status === 'success').length
      stats.successRate = Math.round((successful / last24h.length) * 100)
    }

    return stats
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 重置API历史（用于测试）
   */
  resetHistory(apiName = null) {
    if (apiName) {
      this.callHistory[apiName] = []
    } else {
      this.callHistory = {
        scrapingdog: [],
        gemini: []
      }
    }
  }
}

export default new ApiRetryService()