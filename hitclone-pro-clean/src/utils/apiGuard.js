/**
 * API护栏机制
 * 提供API调用控制、预算管理和用户确认功能
 */

class ApiGuard {
  constructor() {
    this.sessionBudget = 15 // 每个会话的API调用限制
    this.callHistory = []
    this.warningThresholds = {
      yellow: 0.6, // 60%时显示警告
      red: 0.8     // 80%时显示严重警告
    }
  }

  /**
   * 检查API调用是否可以执行
   */
  async canMakeApiCall(requestedCalls = 1, context = {}) {
    const currentUsage = this.getCurrentUsage()
    const newTotal = currentUsage + requestedCalls
    
    // 检查预算
    if (newTotal > this.sessionBudget) {
      return {
        allowed: false,
        reason: 'BUDGET_EXCEEDED',
        message: `API调用预算不足。当前已用：${currentUsage}/${this.sessionBudget}，请求：${requestedCalls}`,
        suggestion: '建议刷新页面重置会话或减少检查项目'
      }
    }

    // 检查是否需要用户确认
    const confirmationNeeded = this.needsUserConfirmation(requestedCalls, context)
    if (confirmationNeeded) {
      const confirmed = await this.requestUserConfirmation({
        requestedCalls,
        currentUsage,
        newTotal,
        context
      })
      
      if (!confirmed) {
        return {
          allowed: false,
          reason: 'USER_CANCELLED',
          message: '用户取消了API调用'
        }
      }
    }

    return {
      allowed: true,
      currentUsage,
      newTotal,
      remainingBudget: this.sessionBudget - newTotal
    }
  }

  /**
   * 记录API调用
   */
  recordApiCall(details = {}) {
    const callRecord = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: details.type || 'unknown',
      cost: details.cost || 1,
      context: details.context || {},
      success: details.success !== false, // 默认为成功
      responseTime: details.responseTime,
      error: details.error
    }

    this.callHistory.push(callRecord)
    
    // 保持历史记录在合理大小
    if (this.callHistory.length > 50) {
      this.callHistory = this.callHistory.slice(-30)
    }

    // 更新会话存储
    this.updateSessionStorage()
    
    return callRecord.id
  }

  /**
   * 获取当前API使用情况
   */
  getCurrentUsage() {
    return this.callHistory
      .filter(call => call.success)
      .reduce((total, call) => total + call.cost, 0)
  }

  /**
   * 获取使用统计
   */
  getUsageStats() {
    const currentUsage = this.getCurrentUsage()
    const usagePercentage = (currentUsage / this.sessionBudget) * 100
    
    return {
      current: currentUsage,
      total: this.sessionBudget,
      remaining: this.sessionBudget - currentUsage,
      percentage: usagePercentage,
      status: this.getUsageStatus(usagePercentage),
      callCount: this.callHistory.filter(call => call.success).length,
      failedCalls: this.callHistory.filter(call => !call.success).length
    }
  }

  /**
   * 判断使用状态
   */
  getUsageStatus(percentage) {
    if (percentage >= this.warningThresholds.red * 100) {
      return 'critical'
    } else if (percentage >= this.warningThresholds.yellow * 100) {
      return 'warning'
    } else {
      return 'normal'
    }
  }

  /**
   * 获取预算警告信息
   */
  getBudgetWarning() {
    const stats = this.getUsageStats()
    
    switch (stats.status) {
      case 'critical':
        return {
          level: 'error',
          title: '⚠️ API预算严重不足',
          message: `已使用${stats.percentage.toFixed(1)}%的API预算，仅剩${stats.remaining}次调用`,
          suggestion: '建议只进行必要的轻量检查，或刷新页面重置会话'
        }
      
      case 'warning':
        return {
          level: 'warning',
          title: '⚡ API预算使用较多',
          message: `已使用${stats.percentage.toFixed(1)}%的API预算，剩余${stats.remaining}次调用`,
          suggestion: '建议优先进行重要的检查项目'
        }
      
      default:
        return null
    }
  }

  /**
   * 判断是否需要用户确认
   */
  needsUserConfirmation(requestedCalls, context) {
    // 大于1次调用的操作需要确认
    if (requestedCalls > 1) return true
    
    // 深度检查总是需要确认
    if (context.level === 'deep') return true
    
    // 预算使用超过60%时需要确认
    const currentUsage = this.getCurrentUsage()
    const usagePercentage = (currentUsage / this.sessionBudget) * 100
    if (usagePercentage >= this.warningThresholds.yellow * 100) return true
    
    return false
  }

  /**
   * 请求用户确认
   */
  async requestUserConfirmation(params) {
    const { requestedCalls, currentUsage, newTotal, context } = params
    
    const confirmationMessage = this.buildConfirmationMessage(params)
    
    // 在实际应用中，这会触发一个确认对话框组件
    // 这里返回一个Promise，让UI组件来处理
    return new Promise((resolve) => {
      // 触发自定义事件，让UI组件监听并显示确认对话框
      const confirmEvent = new CustomEvent('apiGuardConfirm', {
        detail: {
          message: confirmationMessage,
          params,
          resolve
        }
      })
      
      window.dispatchEvent(confirmEvent)
    })
  }

  /**
   * 构建确认消息
   */
  buildConfirmationMessage(params) {
    const { requestedCalls, currentUsage, newTotal, context } = params
    const usagePercentage = (newTotal / this.sessionBudget) * 100
    
    let message = {
      title: `确认API调用`,
      details: [
        `即将消耗：${requestedCalls} 次API调用`,
        `当前已用：${currentUsage}/${this.sessionBudget} 次`,
        `操作后将用：${newTotal}/${this.sessionBudget} 次 (${usagePercentage.toFixed(1)}%)`
      ],
      context: context.description || '',
      warning: null
    }

    // 添加警告信息
    if (usagePercentage >= this.warningThresholds.red * 100) {
      message.warning = {
        level: 'critical',
        text: '此操作将大量消耗API预算，建议谨慎考虑'
      }
    } else if (usagePercentage >= this.warningThresholds.yellow * 100) {
      message.warning = {
        level: 'warning', 
        text: '此操作将消耗较多API预算'
      }
    }

    return message
  }

  /**
   * 重置会话
   */
  resetSession() {
    this.callHistory = []
    this.updateSessionStorage()
    
    return {
      success: true,
      message: 'API预算已重置',
      newBudget: this.sessionBudget
    }
  }

  /**
   * 获取调用历史
   */
  getCallHistory(limit = 10) {
    return this.callHistory
      .slice(-limit)
      .reverse()
      .map(call => ({
        id: call.id,
        timestamp: call.timestamp,
        type: call.type,
        cost: call.cost,
        success: call.success,
        responseTime: call.responseTime,
        error: call.error,
        timeAgo: this.getTimeAgo(new Date(call.timestamp))
      }))
  }

  /**
   * 获取时间差描述
   */
  getTimeAgo(timestamp) {
    const now = new Date()
    const diffMs = now - timestamp
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    return timestamp.toLocaleDateString()
  }

  /**
   * 更新会话存储
   */
  updateSessionStorage() {
    try {
      const data = {
        callHistory: this.callHistory,
        sessionBudget: this.sessionBudget,
        lastUpdate: new Date().toISOString()
      }
      
      sessionStorage.setItem('hitclone-api-guard', JSON.stringify(data))
    } catch (error) {
      console.warn('无法保存API护栏数据到sessionStorage:', error)
    }
  }

  /**
   * 从会话存储恢复数据
   */
  loadFromSessionStorage() {
    try {
      const stored = sessionStorage.getItem('hitclone-api-guard')
      if (stored) {
        const data = JSON.parse(stored)
        this.callHistory = data.callHistory || []
        this.sessionBudget = data.sessionBudget || this.sessionBudget
        
        console.log('✅ API护栏数据已从会话中恢复')
        return true
      }
    } catch (error) {
      console.warn('无法从sessionStorage恢复API护栏数据:', error)
    }
    
    return false
  }

  /**
   * 获取成本估算
   */
  estimateCost(operation) {
    const costMap = {
      'light_check': 0,
      'standard_check': 2,
      'deep_check': 5,
      'youtube_fetch': 1,
      'ai_analysis': 3,
      'full_analysis': 5,
      'export_test': 2
    }
    
    return costMap[operation] || 1
  }

  /**
   * 检查操作是否被阻止
   */
  isOperationBlocked(operation) {
    const cost = this.estimateCost(operation)
    const currentUsage = this.getCurrentUsage()
    
    return (currentUsage + cost) > this.sessionBudget
  }

  /**
   * 获取推荐操作
   */
  getRecommendedOperations() {
    const remainingBudget = this.sessionBudget - this.getCurrentUsage()
    const recommendations = []
    
    if (remainingBudget >= 5) {
      recommendations.push({
        type: 'deep_check',
        name: '深度系统检查',
        cost: 5,
        description: '完整的系统诊断，包括性能测试'
      })
    }
    
    if (remainingBudget >= 2) {
      recommendations.push({
        type: 'standard_check',
        name: '标准检查',
        cost: 2,
        description: 'YouTube数据获取和AI格式验证'
      })
    }
    
    // 轻量检查总是可用
    recommendations.push({
      type: 'light_check',
      name: '轻量检查',
      cost: 0,
      description: '本地数据验证，不消耗API'
    })
    
    return recommendations
  }
}

// 创建全局实例
const apiGuard = new ApiGuard()

// 在页面加载时恢复数据
if (typeof window !== 'undefined') {
  apiGuard.loadFromSessionStorage()
}

export default apiGuard