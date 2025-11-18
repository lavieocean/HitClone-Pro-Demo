/**
 * 数据清理工具
 * 用于修复数据不匹配和清理缓存问题
 */

class DataCleaner {
  constructor() {
    this.cleanupTasks = [
      'clearVideoCache',
      'clearAnalysisCache', 
      'clearSessionData',
      'resetApiGuard',
      'validateStoredData'
    ]
  }

  /**
   * 执行完整的数据清理
   */
  async performFullCleanup() {
    console.log('🧹 开始完整数据清理...')
    const results = {}

    for (const task of this.cleanupTasks) {
      try {
        results[task] = await this[task]()
      } catch (error) {
        console.error(`清理任务失败 ${task}:`, error)
        results[task] = { success: false, error: error.message }
      }
    }

    console.log('✅ 数据清理完成:', results)
    return results
  }

  /**
   * 清除视频相关缓存
   */
  async clearVideoCache() {
    try {
      // 清除YouTube服务缓存
      const { default: youTubeDataService } = await import('../services/youTubeDataService')
      youTubeDataService.clearAllCache()

      // 清除sessionStorage中的视频数据
      const keysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('video') || key.includes('youtube') || key.includes('hitclone'))) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => sessionStorage.removeItem(key))

      return {
        success: true,
        message: `清除了${keysToRemove.length}个缓存项`,
        clearedKeys: keysToRemove
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 清除分析结果缓存
   */
  async clearAnalysisCache() {
    try {
      const keysToRemove = []
      
      // 检查localStorage中的分析相关数据
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('analysis')) {
          const data = localStorage.getItem(key)
          try {
            const parsed = JSON.parse(data)
            // 检查是否是旧的或损坏的数据
            if (this.isCorruptedAnalysisData(parsed)) {
              keysToRemove.push(key)
            }
          } catch (e) {
            // JSON解析失败，标记为需要清除
            keysToRemove.push(key)
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))

      return {
        success: true,
        message: `清除了${keysToRemove.length}个损坏的分析缓存`,
        clearedKeys: keysToRemove
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 清除会话数据
   */
  async clearSessionData() {
    try {
      const sessionKeys = Object.keys(sessionStorage)
      const hitcloneKeys = sessionKeys.filter(key => key.includes('hitclone'))
      
      hitcloneKeys.forEach(key => sessionStorage.removeItem(key))

      return {
        success: true,
        message: `清除了${hitcloneKeys.length}个会话数据`,
        clearedKeys: hitcloneKeys
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 重置API护栏
   */
  async resetApiGuard() {
    try {
      const { default: apiGuard } = await import('./apiGuard')
      const result = apiGuard.resetSession()
      
      return {
        success: true,
        message: 'API护栏已重置',
        details: result
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 验证存储的数据
   */
  async validateStoredData() {
    try {
      const issues = []
      
      // 检查历史记录数据
      try {
        const historyData = localStorage.getItem('hitclone-analysis-history')
        if (historyData) {
          const history = JSON.parse(historyData)
          if (!Array.isArray(history)) {
            issues.push('历史记录格式错误')
            localStorage.removeItem('hitclone-analysis-history')
          } else {
            // 检查每个历史项
            const validHistory = history.filter(item => {
              return item && item.id && item.title && typeof item.title === 'string'
            })
            
            if (validHistory.length !== history.length) {
              localStorage.setItem('hitclone-analysis-history', JSON.stringify(validHistory))
              issues.push(`修复了${history.length - validHistory.length}个损坏的历史记录`)
            }
          }
        }
      } catch (e) {
        issues.push('历史记录数据损坏，已清除')
        localStorage.removeItem('hitclone-analysis-history')
      }

      return {
        success: true,
        message: issues.length > 0 ? `发现并修复了${issues.length}个问题` : '数据验证通过',
        issues: issues
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 检查分析数据是否损坏
   */
  isCorruptedAnalysisData(data) {
    if (!data || typeof data !== 'object') return true
    
    // 检查是否有标题不匹配的情况
    if (Array.isArray(data.title)) return true
    
    // 检查是否有基本结构
    if (!data.contentInfo && !data.insights && !data.originalAnalysis) return true
    
    return false
  }

  /**
   * 快速修复数据不匹配问题
   */
  async fixDataMismatch() {
    console.log('🔧 快速修复数据不匹配问题...')
    
    const fixes = []
    
    try {
      // 1. 清除YouTube缓存
      await this.clearVideoCache()
      fixes.push('清除YouTube缓存')
      
      // 2. 重置会话状态
      await this.clearSessionData()
      fixes.push('重置会话状态')
      
      // 3. 验证历史数据
      const validation = await this.validateStoredData()
      if (validation.issues && validation.issues.length > 0) {
        fixes.push(`修复历史数据: ${validation.issues.join(', ')}`)
      }

      return {
        success: true,
        message: '数据不匹配问题已修复',
        fixes: fixes,
        recommendation: '建议刷新页面以确保所有状态重置'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fixes: fixes
      }
    }
  }

  /**
   * 诊断数据状态
   */
  async diagnoseDataState() {
    const diagnosis = {
      timestamp: new Date().toISOString(),
      issues: [],
      warnings: [],
      info: []
    }

    // 检查sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    const hitcloneSessionKeys = sessionKeys.filter(key => key.includes('hitclone'))
    diagnosis.info.push(`会话存储包含${hitcloneSessionKeys.length}个HitClone相关项`)

    // 检查localStorage
    const localKeys = Object.keys(localStorage)
    const hitcloneLocalKeys = localKeys.filter(key => key.includes('hitclone'))
    diagnosis.info.push(`本地存储包含${hitcloneLocalKeys.length}个HitClone相关项`)

    // 检查历史记录
    try {
      const historyData = localStorage.getItem('hitclone-analysis-history')
      if (historyData) {
        const history = JSON.parse(historyData)
        if (Array.isArray(history)) {
          diagnosis.info.push(`历史记录包含${history.length}个分析`)
          
          // 检查数据质量
          const corruptedItems = history.filter(item => 
            !item.title || typeof item.title !== 'string' || Array.isArray(item.title)
          )
          
          if (corruptedItems.length > 0) {
            diagnosis.issues.push(`发现${corruptedItems.length}个损坏的历史记录项`)
          }
        } else {
          diagnosis.issues.push('历史记录格式错误')
        }
      }
    } catch (e) {
      diagnosis.issues.push('历史记录数据损坏')
    }

    // 检查API状态
    try {
      const { default: apiGuard } = await import('./apiGuard')
      const stats = apiGuard.getUsageStats()
      diagnosis.info.push(`API使用: ${stats.current}/${stats.total} (${stats.percentage.toFixed(1)}%)`)
      
      if (stats.status === 'critical') {
        diagnosis.warnings.push('API预算使用过高')
      }
    } catch (e) {
      diagnosis.warnings.push('无法获取API状态')
    }

    return diagnosis
  }
}

// 创建全局实例
const dataCleaner = new DataCleaner()

export default dataCleaner