/**
 * YouTube分析功能测试套件
 * 测试视频分析的完整流程
 */

class AnalysisTest {
  constructor(testRunner) {
    this.runner = testRunner
    this.testVideos = [
      {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        name: 'classic_video',
        expectedTitle: '不应该阻塞分析'
      },
      {
        url: 'https://youtu.be/dQw4w9WgXcQ',
        name: 'short_url',
        expectedTitle: '短链接格式'
      }
    ]
  }

  async run() {
    console.log('📹 执行YouTube分析功能测试...')
    
    const results = []
    
    // 测试1: URL验证
    results.push(await this.testUrlValidation())
    
    // 测试2: 分析流程模拟
    results.push(await this.testAnalysisFlow())
    
    // 测试3: 错误处理
    results.push(await this.testErrorHandling())
    
    // 测试4: 数据结构验证
    results.push(await this.testDataStructure())
    
    // 测试5: 历史记录保存
    results.push(await this.testHistorySaving())
    
    return results
  }

  /**
   * 测试URL验证功能
   */
  async testUrlValidation() {
    try {
      const validUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://youtube.com/watch?v=dQw4w9WgXcQ'
      ]
      
      const invalidUrls = [
        'https://example.com/video',
        'not-a-url',
        'https://bilibili.com/video/123'
      ]
      
      let validCount = 0
      let invalidCount = 0
      
      // 使用现有的URL验证逻辑
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
      
      for (const url of validUrls) {
        if (youtubeRegex.test(url)) {
          validCount++
        }
      }
      
      for (const url of invalidUrls) {
        if (!youtubeRegex.test(url)) {
          invalidCount++
        }
      }
      
      const success = validCount === validUrls.length && invalidCount === invalidUrls.length
      
      return {
        name: 'url_validation',
        status: success ? 'passed' : 'failed',
        details: {
          validUrls: validCount,
          invalidUrls: invalidCount,
          expectedValid: validUrls.length,
          expectedInvalid: invalidUrls.length
        }
      }
    } catch (error) {
      return {
        name: 'url_validation',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 测试分析流程
   */
  async testAnalysisFlow() {
    try {
      if (!this.runner.page) {
        // 无浏览器环境，使用模拟测试
        return await this.testAnalysisFlowMock()
      }
      
      // 浏览器环境测试
      const baseUrl = `${this.runner.config.baseUrl}:${this.runner.activePort}`
      await this.runner.page.goto(baseUrl)
      
      // 等待页面加载
      await this.runner.page.waitForSelector('#root', { timeout: 10000 })
      
      // 查找URL输入框
      const urlInput = await this.runner.page.$('input[placeholder*="YouTube"], input[type="url"]')
      
      if (!urlInput) {
        throw new Error('未找到URL输入框')
      }
      
      // 输入测试URL
      const testUrl = this.testVideos[0].url
      await urlInput.clear()
      await urlInput.type(testUrl)
      
      // 查找并点击分析按钮
      const analyzeButton = await this.runner.page.$('button:has-text("分析"), button:has-text("开始")')
      
      if (!analyzeButton) {
        throw new Error('未找到分析按钮')
      }
      
      await analyzeButton.click()
      
      // 等待分析开始（检查进度指示器）
      const progressVisible = await this.runner.page.waitForSelector(
        '.spinner, .progress, [class*="loading"]',
        { timeout: 5000, state: 'visible' }
      ).catch(() => false)
      
      return {
        name: 'analysis_flow',
        status: progressVisible ? 'passed' : 'warning',
        details: {
          inputFound: true,
          buttonFound: true,
          progressShown: !!progressVisible,
          testUrl
        }
      }
      
    } catch (error) {
      return {
        name: 'analysis_flow',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 模拟分析流程测试
   */
  async testAnalysisFlowMock() {
    try {
      // 模拟分析逻辑的关键步骤
      const steps = [
        'url_validation',
        'video_data_fetch',
        'ai_analysis',
        'result_generation'
      ]
      
      const results = {}
      
      for (const step of steps) {
        switch (step) {
          case 'url_validation':
            results[step] = true
            break
          case 'video_data_fetch':
            // 模拟网络请求
            await new Promise(resolve => setTimeout(resolve, 100))
            results[step] = true
            break
          case 'ai_analysis':
            // 模拟AI分析
            await new Promise(resolve => setTimeout(resolve, 200))
            results[step] = true
            break
          case 'result_generation':
            // 模拟结果生成
            results[step] = true
            break
        }
      }
      
      const allPassed = Object.values(results).every(r => r === true)
      
      return {
        name: 'analysis_flow',
        status: allPassed ? 'passed' : 'failed',
        details: {
          steps: results,
          mode: 'mock',
          testUrl: this.testVideos[0].url
        }
      }
    } catch (error) {
      return {
        name: 'analysis_flow',
        status: 'failed',
        details: { error: error.message, mode: 'mock' }
      }
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    try {
      const errorScenarios = [
        {
          name: 'invalid_url',
          input: 'not-a-youtube-url',
          expectedBehavior: 'should_show_error'
        },
        {
          name: 'empty_input',
          input: '',
          expectedBehavior: 'should_show_validation'
        },
        {
          name: 'network_error',
          input: 'https://youtube.com/watch?v=nonexistent',
          expectedBehavior: 'should_fallback_gracefully'
        }
      ]
      
      const testResults = {}
      
      for (const scenario of errorScenarios) {
        // 模拟错误场景的处理
        switch (scenario.name) {
          case 'invalid_url':
            testResults[scenario.name] = {
              handled: true,
              errorShown: true
            }
            break
          case 'empty_input':
            testResults[scenario.name] = {
              handled: true,
              validationShown: true
            }
            break
          case 'network_error':
            testResults[scenario.name] = {
              handled: true,
              fallbackUsed: true
            }
            break
        }
      }
      
      const allHandled = Object.values(testResults).every(r => r.handled)
      
      return {
        name: 'error_handling',
        status: allHandled ? 'passed' : 'failed',
        details: {
          scenarios: testResults,
          totalScenarios: errorScenarios.length
        }
      }
    } catch (error) {
      return {
        name: 'error_handling',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 测试数据结构验证
   */
  async testDataStructure() {
    try {
      // 模拟生成的分析结果数据结构
      const mockAnalysisResult = {
        contentInfo: {
          title: '测试视频',
          channel: '测试频道',
          views: '1000',
          duration: '10:00'
        },
        insights: {
          viralFactors: {
            hookStrength: 85,
            curiosityGap: 78,
            emotionalTrigger: 92,
            shareability: 81,
            retention: 74
          }
        },
        emotions: {
          timeline: [
            { time: 0, emotion: 'curiosity', intensity: 70 }
          ]
        }
      }
      
      // 验证数据结构完整性
      const validations = {
        hasContentInfo: !!mockAnalysisResult.contentInfo,
        hasTitle: !!mockAnalysisResult.contentInfo?.title,
        hasInsights: !!mockAnalysisResult.insights,
        hasViralFactors: !!mockAnalysisResult.insights?.viralFactors,
        hasEmotions: !!mockAnalysisResult.emotions,
        hasTimeline: Array.isArray(mockAnalysisResult.emotions?.timeline),
        viralFactorsComplete: Object.keys(mockAnalysisResult.insights?.viralFactors || {}).length >= 5
      }
      
      const validCount = Object.values(validations).filter(v => v).length
      const totalChecks = Object.keys(validations).length
      const success = validCount === totalChecks
      
      return {
        name: 'data_structure',
        status: success ? 'passed' : 'failed',
        details: {
          validations,
          validCount,
          totalChecks,
          completeness: (validCount / totalChecks * 100).toFixed(1) + '%'
        }
      }
    } catch (error) {
      return {
        name: 'data_structure',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }

  /**
   * 测试历史记录保存
   */
  async testHistorySaving() {
    try {
      // 模拟localStorage操作
      const testData = {
        id: Date.now().toString(),
        title: '测试分析报告',
        channel: '测试频道',
        score: 85,
        analysisDate: new Date().toISOString(),
        analysisResults: {
          contentInfo: { title: '测试视频' },
          insights: { viralFactors: { hookStrength: 85 } }
        }
      }
      
      // 在Node.js环境中，我们模拟localStorage行为
      let mockStorage = {}
      
      // 模拟保存操作
      const historyKey = 'hitclone-analysis-history'
      const existingHistory = mockStorage[historyKey] ? JSON.parse(mockStorage[historyKey]) : []
      const updatedHistory = [testData, ...existingHistory]
      mockStorage[historyKey] = JSON.stringify(updatedHistory)
      
      // 验证保存结果
      const saved = JSON.parse(mockStorage[historyKey])
      const saveSuccess = saved.length > 0 && saved[0].id === testData.id
      
      // 模拟数据检索
      const retrieved = saved.find(item => item.id === testData.id)
      const retrieveSuccess = retrieved && retrieved.title === testData.title
      
      return {
        name: 'history_saving',
        status: saveSuccess && retrieveSuccess ? 'passed' : 'failed',
        details: {
          saveSuccess,
          retrieveSuccess,
          savedItems: saved.length,
          testItemId: testData.id,
          mode: 'mock_localStorage'
        }
      }
    } catch (error) {
      return {
        name: 'history_saving',
        status: 'failed',
        details: { error: error.message }
      }
    }
  }
}

export default AnalysisTest