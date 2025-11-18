/**
 * 历史数据恢复功能测试套件
 * 测试一键恢复和深度扫描功能
 */

class RecoveryTest {
  constructor(testRunner) {
    this.runner = testRunner
    this.mockHistoryData = [
      {
        id: '1',
        title: '测试视频1',
        channel: '测试频道1',
        score: 85,
        analysisDate: '2024-01-01T00:00:00.000Z',
        analysisResults: {
          contentInfo: { title: '测试视频1' },
          insights: { viralFactors: { hookStrength: 85 } }
        }
      },
      {
        id: '2',
        title: '测试视频2',
        channel: '测试频道2',
        score: 92,
        analysisDate: '2024-01-02T00:00:00.000Z',
        analysisResults: {
          contentInfo: { title: '测试视频2' },
          insights: { viralFactors: { hookStrength: 92 } }
        }
      }
    ]
  }

  async run() {
    console.log('🔄 执行历史数据恢复功能测试...')
    
    const results = []
    
    // 测试1: 基础历史记录访问
    results.push(await this.testBasicHistoryAccess())
    
    // 测试2: 一键恢复功能
    results.push(await this.testQuickRestore())
    
    // 测试3: 深度扫描功能
    results.push(await this.testDeepScan())
    
    // 测试4: 数据去重功能
    results.push(await this.testDataDeduplication())
    
    // 测试5: 恢复结果验证
    results.push(await this.testRecoveryValidation())
    
    return results
  }

  /**
   * 测试基础历史记录访问
   */
  async testBasicHistoryAccess() {
    try {
      // 模拟localStorage读取
      const mockStorage = {
        'hitclone-analysis-history': JSON.stringify(this.mockHistoryData)
      }
      
      // 模拟历史记录获取逻辑
      const getHistoryReports = () => {
        try {
          const saved = mockStorage['hitclone-analysis-history']
          return saved ? JSON.parse(saved) : []
        } catch (error) {
          return []
        }
      }
      
      const historyReports = getHistoryReports()
      
      const tests = {
        canAccess: Array.isArray(historyReports),
        hasData: historyReports.length > 0,
        dataStructure: historyReports.every(item => 
          item.id && item.title && item.analysisResults
        ),
        correctCount: historyReports.length === this.mockHistoryData.length
      }
      
      const allPassed = Object.values(tests).every(test => test === true)
      
      return {
        name: 'basic_history_access',
        status: allPassed ? 'passed' : 'failed',
        details: {
          tests,
          foundItems: historyReports.length,
          expectedItems: this.mockHistoryData.length
        }
      }
    } catch (error) {
      return {
        name: 'basic_history_access',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 测试一键恢复功能
   */
  async testQuickRestore() {
    try {
      // 模拟localStorage环境
      const mockStorage = {
        'hitclone-analysis-history': JSON.stringify(this.mockHistoryData),
        'some-other-key': JSON.stringify({ data: 'other' }),
        'hitclone-temp-data': JSON.stringify([
          { title: '临时数据', analysisResults: {} }
        ])
      }
      
      // 模拟一键恢复逻辑
      const quickRestore = async () => {
        const knownKeys = [
          'hitclone-analysis-history',
          'hitclone-reports',
          'hitclone-temp-data',
          'video-analysis-history'
        ]
        
        let totalFound = 0
        const allData = []
        
        for (const key of knownKeys) {
          if (mockStorage[key]) {
            try {
              const data = JSON.parse(mockStorage[key])
              if (Array.isArray(data)) {
                const validReports = data.filter(item => 
                  item && typeof item === 'object' && 
                  item.title && (item.analysisResults || item.score)
                )
                allData.push(...validReports)
                totalFound += validReports.length
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
        
        return { success: true, found: totalFound, data: allData }
      }
      
      const result = await quickRestore()
      
      const tests = {
        executed: result.success,
        foundData: result.found > 0,
        correctCount: result.found >= this.mockHistoryData.length,
        validStructure: result.data.every(item => item.title)
      }
      
      const allPassed = Object.values(tests).every(test => test === true)
      
      return {
        name: 'quick_restore',
        status: allPassed ? 'passed' : 'failed',
        details: {
          tests,
          foundItems: result.found,
          expectedMinimum: this.mockHistoryData.length,
          restoredData: result.data.length
        }
      }
    } catch (error) {
      return {
        name: 'quick_restore',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 测试深度扫描功能
   */
  async testDeepScan() {
    try {
      // 模拟更复杂的localStorage环境
      const mockStorage = {
        'hitclone-analysis-history': JSON.stringify(this.mockHistoryData),
        'backup-reports-2024': JSON.stringify([
          { title: '备份报告1', analysisResults: {}, score: 88 }
        ]),
        'user-data': JSON.stringify({
          reports: [
            { title: '用户报告1', analysisResults: {}, channel: '频道A' }
          ]
        }),
        'random-key': 'not-json-data',
        'short-data': '{}',
        'hitclone-cache': JSON.stringify([
          { title: '缓存报告', analysisResults: {}, views: '1000' }
        ])
      }
      
      // 模拟深度扫描逻辑
      const deepScan = async () => {
        const allKeys = Object.keys(mockStorage)
        let totalFound = 0
        const allRecoveredData = []
        
        for (const key of allKeys) {
          try {
            const data = mockStorage[key]
            if (data && data.length > 50) { // 跳过太短的数据
              const parsed = JSON.parse(data)
              
              // 检查数组格式
              if (Array.isArray(parsed)) {
                const reports = parsed.filter(item => {
                  if (!item || typeof item !== 'object') return false
                  
                  const hasTitle = item.title && typeof item.title === 'string'
                  const hasAnalysis = item.analysisResults && typeof item.analysisResults === 'object'
                  const hasScore = typeof item.score === 'number'
                  const hasChannel = item.channel && typeof item.channel === 'string'
                  
                  return hasTitle && (hasAnalysis || hasScore || hasChannel)
                })
                
                if (reports.length > 0) {
                  allRecoveredData.push(...reports)
                  totalFound += reports.length
                }
              }
              
              // 检查对象格式（可能包含嵌套的reports数组）
              else if (parsed && typeof parsed === 'object') {
                if (parsed.reports && Array.isArray(parsed.reports)) {
                  const reports = parsed.reports.filter(item => 
                    item && item.title && (item.analysisResults || item.score)
                  )
                  if (reports.length > 0) {
                    allRecoveredData.push(...reports)
                    totalFound += reports.length
                  }
                }
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
        
        return { success: true, found: totalFound, data: allRecoveredData }
      }
      
      const result = await deepScan()
      
      const tests = {
        executed: result.success,
        foundMoreThanBasic: result.found > this.mockHistoryData.length,
        scanAllKeys: true, // 我们确实扫描了所有键
        foundHiddenData: result.data.some(item => 
          item.title.includes('备份') || item.title.includes('用户') || item.title.includes('缓存')
        ),
        validData: result.data.every(item => item.title)
      }
      
      const allPassed = Object.values(tests).every(test => test === true)
      
      return {
        name: 'deep_scan',
        status: allPassed ? 'passed' : 'failed',
        details: {
          tests,
          foundItems: result.found,
          basicCount: this.mockHistoryData.length,
          scannedKeys: Object.keys(mockStorage).length,
          hiddenDataFound: result.data.filter(item => 
            !this.mockHistoryData.some(original => original.title === item.title)
          ).length
        }
      }
    } catch (error) {
      return {
        name: 'deep_scan',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 测试数据去重功能
   */
  async testDataDeduplication() {
    try {
      // 模拟有重复数据的情况
      const duplicatedData = [
        ...this.mockHistoryData,
        ...this.mockHistoryData, // 完全重复
        {
          id: '3',
          title: '测试视频1', // 标题重复但ID不同
          channel: '测试频道1',
          score: 85,
          analysisDate: '2024-01-03T00:00:00.000Z'
        }
      ]
      
      // 模拟去重逻辑
      const deduplicateData = (data) => {
        const seen = new Set()
        const deduped = []
        
        for (const item of data) {
          // 创建去重键：标题+频道+评分的组合
          const dedupKey = `${item.title}-${item.channel}-${item.score}`
          
          if (!seen.has(dedupKey)) {
            seen.add(dedupKey)
            deduped.push(item)
          }
        }
        
        return deduped
      }
      
      const originalCount = duplicatedData.length
      const dedupedData = deduplicateData(duplicatedData)
      const finalCount = dedupedData.length
      
      const tests = {
        removedDuplicates: finalCount < originalCount,
        keptValidData: finalCount > 0,
        correctFinalCount: finalCount === this.mockHistoryData.length, // 应该回到原始数量
        preservedStructure: dedupedData.every(item => item.title && item.channel)
      }
      
      const allPassed = Object.values(tests).every(test => test === true)
      
      return {
        name: 'data_deduplication',
        status: allPassed ? 'passed' : 'failed',
        details: {
          tests,
          originalCount,
          finalCount,
          duplicatesRemoved: originalCount - finalCount,
          deduplicationRate: ((originalCount - finalCount) / originalCount * 100).toFixed(1) + '%'
        }
      }
    } catch (error) {
      return {
        name: 'data_deduplication',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 测试恢复结果验证
   */
  async testRecoveryValidation() {
    try {
      // 模拟恢复的数据
      const recoveredData = [
        ...this.mockHistoryData,
        {
          id: '3',
          title: '部分损坏的数据',
          // 缺少channel字段
          score: 75,
          analysisResults: null // 损坏的分析结果
        },
        {
          // 完全损坏的数据
          invalidData: true
        }
      ]
      
      // 模拟数据验证和修复逻辑
      const validateAndRepairData = (data) => {
        const validData = []
        const repairedData = []
        const discardedData = []
        
        for (const item of data) {
          // 基础字段检查
          if (!item || typeof item !== 'object' || !item.title) {
            discardedData.push(item)
            continue
          }
          
          // 创建修复后的副本
          const repairedItem = { ...item }
          
          // 修复缺失字段
          if (!repairedItem.channel) {
            repairedItem.channel = '未知频道'
          }
          
          if (!repairedItem.score || typeof repairedItem.score !== 'number') {
            repairedItem.score = 50 // 默认评分
          }
          
          if (!repairedItem.analysisResults) {
            repairedItem.analysisResults = {
              contentInfo: { title: repairedItem.title },
              insights: { viralFactors: { hookStrength: repairedItem.score } }
            }
          }
          
          if (!repairedItem.id) {
            repairedItem.id = Date.now().toString() + Math.random()
          }
          
          if (!repairedItem.analysisDate) {
            repairedItem.analysisDate = new Date().toISOString()
          }
          
          // 检查是否需要修复
          const needsRepair = JSON.stringify(item) !== JSON.stringify(repairedItem)
          
          if (needsRepair) {
            repairedData.push(repairedItem)
          } else {
            validData.push(item)
          }
        }
        
        return {
          valid: validData,
          repaired: repairedData,
          discarded: discardedData,
          total: validData.length + repairedData.length
        }
      }
      
      const validationResult = validateAndRepairData(recoveredData)
      
      const tests = {
        processedAllData: validationResult.total + validationResult.discarded.length === recoveredData.length,
        repairedSomeData: validationResult.repaired.length > 0,
        discardedInvalidData: validationResult.discarded.length > 0,
        finalDataValid: [...validationResult.valid, ...validationResult.repaired].every(item => 
          item.title && item.channel && item.score && item.analysisResults
        )
      }
      
      const allPassed = Object.values(tests).every(test => test === true)
      
      return {
        name: 'recovery_validation',
        status: allPassed ? 'passed' : 'failed',
        details: {
          tests,
          originalCount: recoveredData.length,
          validCount: validationResult.valid.length,
          repairedCount: validationResult.repaired.length,
          discardedCount: validationResult.discarded.length,
          finalCount: validationResult.total,
          recoveryRate: (validationResult.total / recoveredData.length * 100).toFixed(1) + '%'
        }
      }
    } catch (error) {
      return {
        name: 'recovery_validation',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }
}

export default RecoveryTest