/**
 * 错误追踪和性能监控工具
 * 用于诊断 Full Report 崩溃问题和性能瓶颈
 */

class ErrorTracker {
  constructor() {
    this.errors = []
    this.performanceMetrics = []
    this.componentHealth = new Map()
    this.isTracking = true
    
    // 监听全局错误
    this.setupGlobalErrorHandlers()
  }

  setupGlobalErrorHandlers() {
    // 捕获未处理的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('UnhandledPromiseRejection', event.reason, {
        type: 'promise',
        stack: event.reason?.stack
      })
    })

    // 捕获全局 JavaScript 错误
    window.addEventListener('error', (event) => {
      this.logError('GlobalJavaScriptError', event.error, {
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    // 监控资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.logError('ResourceLoadError', null, {
          type: 'resource',
          element: event.target.tagName,
          source: event.target.src || event.target.href
        })
      }
    }, true)
  }

  /**
   * 记录错误
   */
  logError(type, error, context = {}) {
    if (!this.isTracking) return

    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type,
      message: error?.message || error?.toString() || 'Unknown error',
      stack: error?.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    this.errors.push(errorEntry)
    
    // 控制台输出
    console.error(`🚨 ErrorTracker [${type}]:`, error, context)
    
    // 保持最近100个错误
    if (this.errors.length > 100) {
      this.errors.shift()
    }

    // 触发错误事件
    this.dispatchErrorEvent(errorEntry)
  }

  /**
   * 记录性能指标
   */
  logPerformance(componentName, operation, startTime, endTime, metadata = {}) {
    const duration = endTime - startTime
    
    const perfEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      componentName,
      operation,
      duration,
      metadata
    }

    this.performanceMetrics.push(perfEntry)
    
    // 警告慢操作
    if (duration > 1000) {
      console.warn(`⚠️ 慢操作警告: ${componentName}.${operation} 耗时 ${duration}ms`, metadata)
    }

    // 保持最近200个性能记录
    if (this.performanceMetrics.length > 200) {
      this.performanceMetrics.shift()
    }
  }

  /**
   * 组件健康检查
   */
  reportComponentHealth(componentName, status, details = {}) {
    this.componentHealth.set(componentName, {
      status, // 'healthy', 'warning', 'error'
      lastChecked: Date.now(),
      details
    })
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      recent: this.errors.slice(-10),
      mostCommon: null
    }

    // 按类型统计
    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
    })

    // 找出最常见的错误类型
    const sortedTypes = Object.entries(stats.byType)
      .sort(([,a], [,b]) => b - a)
    stats.mostCommon = sortedTypes[0]?.[0]

    return stats
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    if (this.performanceMetrics.length === 0) return null

    const durations = this.performanceMetrics.map(m => m.duration)
    const componentStats = {}

    // 按组件统计
    this.performanceMetrics.forEach(metric => {
      if (!componentStats[metric.componentName]) {
        componentStats[metric.componentName] = {
          operations: {},
          totalDuration: 0,
          operationCount: 0
        }
      }
      
      const compStat = componentStats[metric.componentName]
      compStat.totalDuration += metric.duration
      compStat.operationCount += 1

      if (!compStat.operations[metric.operation]) {
        compStat.operations[metric.operation] = {
          count: 0,
          totalDuration: 0,
          avgDuration: 0
        }
      }

      const opStat = compStat.operations[metric.operation]
      opStat.count += 1
      opStat.totalDuration += metric.duration
      opStat.avgDuration = opStat.totalDuration / opStat.count
    })

    return {
      totalMetrics: this.performanceMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      componentStats,
      slowOperations: this.performanceMetrics
        .filter(m => m.duration > 500)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
    }
  }

  /**
   * 组件健康状态
   */
  getComponentHealthStatus() {
    const healthStatus = {}
    
    this.componentHealth.forEach((health, componentName) => {
      healthStatus[componentName] = {
        ...health,
        age: Date.now() - health.lastChecked
      }
    })

    return healthStatus
  }

  /**
   * 生成诊断报告
   */
  generateDiagnosticReport() {
    return {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : 'Not available',
      errors: this.getErrorStats(),
      performance: this.getPerformanceStats(),
      componentHealth: this.getComponentHealthStatus(),
      url: window.location.href,
      referrer: document.referrer
    }
  }

  /**
   * 触发错误事件
   */
  dispatchErrorEvent(errorEntry) {
    const event = new CustomEvent('hitclone-error', {
      detail: errorEntry
    })
    window.dispatchEvent(event)
  }

  /**
   * 清除记录
   */
  clear() {
    this.errors.length = 0
    this.performanceMetrics.length = 0
    this.componentHealth.clear()
  }

  /**
   * 停止/启动追踪
   */
  toggleTracking() {
    this.isTracking = !this.isTracking
    return this.isTracking
  }

  /**
   * 导出日志数据
   */
  exportLogs() {
    const report = this.generateDiagnosticReport()
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hitclone-diagnostic-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// 全局实例
const errorTracker = new ErrorTracker()

// 性能工具函数
export const trackPerformance = (componentName, operation, fn) => {
  return async (...args) => {
    const startTime = performance.now()
    try {
      const result = await fn(...args)
      const endTime = performance.now()
      errorTracker.logPerformance(componentName, operation, startTime, endTime, {
        success: true,
        argsLength: args.length
      })
      return result
    } catch (error) {
      const endTime = performance.now()
      errorTracker.logPerformance(componentName, operation, startTime, endTime, {
        success: false,
        error: error.message
      })
      errorTracker.logError('ComponentOperation', error, {
        componentName,
        operation
      })
      throw error
    }
  }
}

// React Hook 用于组件错误追踪
export const useErrorTracking = (componentName) => {
  const reportError = (error, context) => {
    errorTracker.logError('ComponentError', error, {
      componentName,
      ...context
    })
  }

  const reportHealth = (status, details) => {
    errorTracker.reportComponentHealth(componentName, status, details)
  }

  const trackOperation = (operation, fn) => {
    return trackPerformance(componentName, operation, fn)
  }

  return { reportError, reportHealth, trackOperation }
}

export default errorTracker