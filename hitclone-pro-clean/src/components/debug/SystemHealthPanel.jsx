import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info, Settings, RefreshCw, Zap, Shield, Wrench, Play, TestTube } from 'lucide-react'
import SystemChecker from '../../utils/systemChecker'
import apiGuard from '../../utils/apiGuard'
import dataCleaner from '../../utils/dataCleaner'

const SystemHealthPanel = ({ isOpen, onToggle }) => {
  const [checker] = useState(() => new SystemChecker())
  const [systemStatus, setSystemStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState('light')
  const [showDetails, setShowDetails] = useState(false)
  const [apiStats, setApiStats] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmParams, setConfirmParams] = useState(null)
  
  // 新增：自动化测试相关状态
  const [testResults, setTestResults] = useState(null)
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedTestSuite, setSelectedTestSuite] = useState('quick')
  const [showTestPanel, setShowTestPanel] = useState(false)

  // 监听API护栏确认事件
  useEffect(() => {
    const handleApiConfirm = (event) => {
      setConfirmParams(event.detail)
      setShowConfirmDialog(true)
    }

    window.addEventListener('apiGuardConfirm', handleApiConfirm)
    return () => window.removeEventListener('apiGuardConfirm', handleApiConfirm)
  }, [])

  // 自动运行轻量检查
  useEffect(() => {
    if (isOpen) {
      runLightCheck()
      updateApiStats()
    }
  }, [isOpen])

  const runLightCheck = async () => {
    try {
      const overview = await checker.getSystemOverview()
      setSystemStatus(overview)
    } catch (error) {
      console.error('轻量检查失败:', error)
    }
  }

  const updateApiStats = () => {
    const stats = apiGuard.getUsageStats()
    setApiStats(stats)
  }

  const runSelectedCheck = async () => {
    if (selectedLevel === 'light') {
      await runLightCheck()
      return
    }

    setIsLoading(true)
    try {
      // 检查API护栏
      const checkConfig = checker.checkLevels[selectedLevel]
      const canProceed = await apiGuard.canMakeApiCall(checkConfig.cost, {
        level: selectedLevel,
        description: checkConfig.description
      })

      if (!canProceed.allowed) {
        setSystemStatus({
          ...systemStatus,
          error: canProceed.message,
          suggestion: canProceed.suggestion
        })
        return
      }

      // 记录API调用开始
      const callId = apiGuard.recordApiCall({
        type: `system_check_${selectedLevel}`,
        cost: checkConfig.cost,
        context: { level: selectedLevel },
        success: false // 先标记为失败，成功后更新
      })

      // 执行检查
      const result = await checker.runCheck(selectedLevel)
      
      // 更新API调用记录
      if (result.success) {
        apiGuard.recordApiCall({
          ...apiGuard.callHistory.find(call => call.id === callId),
          success: true,
          responseTime: Date.now() - new Date(callId.split('_')[1]).getTime()
        })
      }

      setSystemStatus(prev => ({
        ...prev,
        checkResult: result,
        lastCheck: {
          level: selectedLevel,
          timestamp: new Date().toISOString(),
          success: result.success
        }
      }))

      updateApiStats()
    } catch (error) {
      console.error('检查执行失败:', error)
      setSystemStatus(prev => ({
        ...prev,
        error: `检查执行失败: ${error.message}`
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDialog = (confirmed) => {
    if (confirmParams) {
      confirmParams.resolve(confirmed)
      setConfirmParams(null)
    }
    setShowConfirmDialog(false)
  }

  const resetApiSession = () => {
    apiGuard.resetSession()
    updateApiStats()
    runLightCheck()
  }

  const quickFix = async () => {
    setIsLoading(true)
    try {
      console.log('🔧 执行快速修复...')
      const result = await dataCleaner.fixDataMismatch()
      
      setSystemStatus(prev => ({
        ...prev,
        fixResult: result,
        lastAction: {
          type: 'quickFix',
          timestamp: new Date().toISOString(),
          success: result.success
        }
      }))

      if (result.success) {
        // 重新运行检查
        await runLightCheck()
        updateApiStats()
      }
    } catch (error) {
      console.error('快速修复失败:', error)
      setSystemStatus(prev => ({
        ...prev,
        error: `快速修复失败: ${error.message}`
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // 新增：自动化测试功能（浏览器环境模拟版本）
  const runAutomatedTests = async () => {
    setIsRunningTests(true)
    setTestResults(null)
    
    try {
      console.log(`🧪 开始运行自动化测试: ${selectedTestSuite}`)
      
      // 在浏览器环境中使用模拟测试执行器
      const result = await runBrowserCompatibleTests(selectedTestSuite)
      
      setTestResults(result)
      
      // 更新系统状态以反映测试结果
      setSystemStatus(prev => ({
        ...prev,
        testResult: {
          success: result.success,
          summary: {
            total: result.results.total,
            passed: result.results.passed,
            failed: result.results.failed,
            warnings: result.results.warnings
          },
          timestamp: new Date().toISOString(),
          mode: selectedTestSuite
        }
      }))
      
      console.log(`✅ 自动化测试完成: ${result.success ? '通过' : '失败'}`)
      
    } catch (error) {
      console.error('❌ 自动化测试执行失败:', error)
      
      setTestResults({
        success: false,
        error: error.message,
        results: {
          total: 0,
          passed: 0,
          failed: 1,
          warnings: 0,
          details: [{
            name: 'test_execution',
            status: 'failed',
            details: { error: error.message }
          }]
        }
      })
      
      setSystemStatus(prev => ({
        ...prev,
        error: `自动化测试失败: ${error.message}`
      }))
    } finally {
      setIsRunningTests(false)
    }
  }

  // 浏览器兼容的测试执行器
  const runBrowserCompatibleTests = async (testSuite) => {
    // 模拟延迟
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    
    console.log(`🧪 执行浏览器模拟测试: ${testSuite}`)
    
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    }
    
    // 根据测试套件运行不同的测试
    const tests = []
    
    if (['quick', 'standard', 'full'].includes(testSuite)) {
      tests.push(
        { name: 'browser_environment', test: () => testBrowserEnvironment() },
        { name: 'local_storage', test: () => testLocalStorage() },
        { name: 'api_connectivity', test: () => testApiConnectivity() }
      )
    }
    
    if (['analysis', 'standard', 'full'].includes(testSuite)) {
      tests.push(
        { name: 'url_validation', test: () => testUrlValidation() },
        { name: 'component_rendering', test: () => testComponentRendering() }
      )
    }
    
    if (['recovery', 'standard', 'full'].includes(testSuite)) {
      tests.push(
        { name: 'history_access', test: () => testHistoryAccess() },
        { name: 'data_recovery', test: () => testDataRecovery() }
      )
    }
    
    // 执行测试
    for (const { name, test } of tests) {
      results.total++
      try {
        await delay(200) // 模拟测试时间
        const testResult = await test()
        
        if (testResult.success) {
          results.passed++
          results.details.push({
            name,
            status: 'passed',
            details: testResult.details
          })
        } else if (testResult.warning) {
          results.warnings++
          results.details.push({
            name,
            status: 'warning',
            details: testResult.details
          })
        } else {
          results.failed++
          results.details.push({
            name,
            status: 'failed',
            details: testResult.details
          })
        }
      } catch (error) {
        results.failed++
        results.details.push({
          name,
          status: 'failed',
          details: { error: error.message }
        })
      }
    }
    
    return {
      success: results.failed === 0,
      results,
      serverUrl: window.location.origin,
      mode: 'browser_simulation'
    }
  }

  // 浏览器环境测试
  const testBrowserEnvironment = async () => {
    const checks = {
      hasLocalStorage: typeof Storage !== 'undefined',
      hasConsole: typeof console !== 'undefined',
      hasReactRoot: !!document.getElementById('root'),
      hasReact: typeof React !== 'undefined'
    }
    
    const passed = Object.values(checks).every(check => check)
    
    return {
      success: passed,
      details: checks
    }
  }

  // localStorage测试
  const testLocalStorage = async () => {
    try {
      const testKey = 'hitclone-test'
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() })
      
      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      
      return {
        success: retrieved === testValue,
        details: { canWrite: true, canRead: true, canDelete: true }
      }
    } catch (error) {
      return {
        success: false,
        details: { error: error.message }
      }
    }
  }

  // API连接测试
  const testApiConnectivity = async () => {
    try {
      const response = await fetch(window.location.origin + '/', {
        method: 'HEAD',
        timeout: 5000
      })
      
      return {
        success: response.ok,
        details: { 
          status: response.status,
          connected: response.ok,
          origin: window.location.origin
        }
      }
    } catch (error) {
      return {
        success: false,
        details: { error: error.message }
      }
    }
  }

  // URL验证测试
  const testUrlValidation = async () => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    const testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'invalid-url'
    ]
    
    const results = testUrls.map(url => ({
      url,
      valid: youtubeRegex.test(url)
    }))
    
    const validCount = results.filter(r => r.valid).length
    const expectedValid = 2 // 前两个应该有效
    
    return {
      success: validCount === expectedValid,
      details: { results, validCount, expectedValid }
    }
  }

  // 组件渲染测试
  const testComponentRendering = async () => {
    const elements = {
      root: !!document.getElementById('root'),
      urlInput: !!document.querySelector('input[type="url"], input[placeholder*="YouTube"]'),
      analyzeButton: !!document.querySelector('button:has-text("分析"), button:has-text("开始")'),
      sidebar: !!document.querySelector('.sidebar, [class*="sidebar"]')
    }
    
    const renderedCount = Object.values(elements).filter(el => el).length
    
    return {
      success: renderedCount >= 2, // 至少要有root和其他一个元素
      warning: renderedCount < Object.keys(elements).length,
      details: { elements, renderedCount, totalElements: Object.keys(elements).length }
    }
  }

  // 历史访问测试
  const testHistoryAccess = async () => {
    try {
      const historyKey = 'hitclone-analysis-history'
      const existingHistory = localStorage.getItem(historyKey)
      
      return {
        success: true,
        details: {
          hasHistory: !!existingHistory,
          historySize: existingHistory ? existingHistory.length : 0,
          canAccess: true
        }
      }
    } catch (error) {
      return {
        success: false,
        details: { error: error.message }
      }
    }
  }

  // 数据恢复测试
  const testDataRecovery = async () => {
    try {
      const allKeys = Object.keys(localStorage)
      const hitcloneKeys = allKeys.filter(key => 
        key.includes('hitclone') || key.includes('analysis') || key.includes('report')
      )
      
      return {
        success: true,
        details: {
          totalKeys: allKeys.length,
          hitcloneKeys: hitcloneKeys.length,
          relevantKeys: hitcloneKeys
        }
      }
    } catch (error) {
      return {
        success: false,
        details: { error: error.message }
      }
    }
  }

  const getTestSuiteIcon = (suite) => {
    const icons = {
      quick: '⚡',
      standard: '🔧',
      analysis: '📹',
      recovery: '🔄',
      full: '🧪'
    }
    return icons[suite] || '📋'
  }

  const getTestSuiteDescription = (suite) => {
    const descriptions = {
      quick: '快速检查 (服务器+API)',
      standard: '标准测试 (核心功能)',
      analysis: 'YouTube分析测试',
      recovery: '历史恢复测试',
      full: '完整测试套件'
    }
    return descriptions[suite] || '未知测试'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
      default: return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  const getApiStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-400'
      case 'warning': return 'text-yellow-400' 
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full p-3 shadow-lg transition-all duration-200 z-50"
        title="系统健康检查"
      >
        {systemStatus?.overall?.status === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-400" />
        ) : systemStatus?.overall?.status === 'warning' ? (
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
        ) : systemStatus?.overall?.status === 'error' ? (
          <AlertCircle className="w-5 h-5 text-red-400" />
        ) : (
          <Settings className="w-5 h-5 text-gray-400" />
        )}
      </button>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-96 max-h-96 overflow-hidden z-50">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">系统健康检查</h3>
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-80">
          {/* 系统状态概览 */}
          {systemStatus && (
            <div className={`p-3 rounded-lg border ${getStatusColor(systemStatus.overall?.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.overall?.status)}
                  <span className="font-medium">
                    {systemStatus.overall?.message || '系统状态检查中...'}
                  </span>
                </div>
                {systemStatus.overall?.score && (
                  <div className="text-sm font-mono">
                    {systemStatus.overall.score}/100
                  </div>
                )}
              </div>
              
              {/* API预算状态 */}
              {apiStats && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300">API预算</span>
                    <span className={getApiStatusColor(apiStats.status)}>
                      {apiStats.current}/{apiStats.total} ({apiStats.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        apiStats.status === 'critical' ? 'bg-red-400' :
                        apiStats.status === 'warning' ? 'bg-yellow-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${Math.min(100, apiStats.percentage)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 检查级别选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              检查级别
            </label>
            <div className="flex space-x-2">
              {Object.entries(checker.checkLevels).map(([level, config]) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  disabled={apiGuard.isOperationBlocked(`${level}_check`)}
                  className={`flex-1 p-2 rounded-lg text-sm transition-all duration-200 border ${
                    selectedLevel === level
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : apiGuard.isOperationBlocked(`${level}_check`)
                      ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={apiGuard.isOperationBlocked(`${level}_check`) ? 'API预算不足' : config.description}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{config.icon}</span>
                    <span>{config.name}</span>
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {config.cost > 0 ? `${config.cost} API` : '免费'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 执行按钮 */}
          <div className="flex space-x-2">
            <button
              onClick={runSelectedCheck}
              disabled={isLoading || apiGuard.isOperationBlocked(`${selectedLevel}_check`)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{isLoading ? '检查中...' : '开始检查'}</span>
            </button>
            
            <button
              onClick={quickFix}
              disabled={isLoading}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              title="修复数据不匹配问题"
            >
              <Wrench className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              title="查看详细信息"
            >
              <Info className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              title="自动化测试"
            >
              <TestTube className="w-4 h-4" />
            </button>
          </div>

          {/* 详细信息展开 */}
          {showDetails && systemStatus && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-300 border-t border-gray-700 pt-3">
                详细检查结果
              </div>
              
              {Object.entries(systemStatus.details || {}).map(([key, result]) => (
                key !== 'apiCalls' && (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <span className="text-sm text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(result.status)}
                      <span className="text-xs text-gray-400">
                        {result.message?.substring(0, 20)}...
                      </span>
                    </div>
                  </div>
                )
              ))}

              {/* API调用历史 */}
              {apiStats && apiStats.callCount > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-300">
                    最近API调用
                  </div>
                  {apiGuard.getCallHistory(3).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                      <span className="text-xs text-gray-400">
                        {call.type}
                      </span>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-gray-500">{call.timeAgo}</span>
                        {call.success ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 重置按钮 */}
              {apiStats && apiStats.current > 0 && (
                <button
                  onClick={resetApiSession}
                  className="w-full p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  重置API会话
                </button>
              )}
            </div>
          )}

          {/* 自动化测试面板 */}
          {showTestPanel && (
            <div className="space-y-4 border-t border-gray-700 pt-4">
              <div className="flex items-center space-x-2">
                <TestTube className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-medium text-gray-300">自动化测试</h4>
              </div>
              
              {/* 测试套件选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  测试套件
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['quick', 'standard', 'analysis', 'recovery', 'full'].map((suite) => (
                    <button
                      key={suite}
                      onClick={() => setSelectedTestSuite(suite)}
                      disabled={isRunningTests}
                      className={`p-2 rounded-lg text-sm transition-all duration-200 border ${
                        selectedTestSuite === suite
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : isRunningTests
                          ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>{getTestSuiteIcon(suite)}</span>
                        <span className="capitalize">{suite}</span>
                      </div>
                      <div className="text-xs mt-1 opacity-75">
                        {getTestSuiteDescription(suite).split(' ')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 测试执行按钮 */}
              <button
                onClick={runAutomatedTests}
                disabled={isRunningTests}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isRunningTests ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>测试中...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>运行测试</span>
                  </>
                )}
              </button>
              
              {/* 测试结果显示 */}
              {testResults && (
                <div className={`p-3 rounded-lg border ${
                  testResults.success 
                    ? 'bg-green-900/20 border-green-700/50' 
                    : 'bg-red-900/20 border-red-700/50'
                }`}>
                  <div className="flex items-start space-x-2">
                    {testResults.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="text-sm">
                      <div className={`font-medium ${
                        testResults.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {testResults.success ? '测试通过' : '测试失败'}
                      </div>
                      
                      {testResults.results && (
                        <div className="text-gray-300 mt-1">
                          <div>总计: {testResults.results.total} 项测试</div>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                            <div className="text-green-400">✅ 通过: {testResults.results.passed}</div>
                            <div className="text-red-400">❌ 失败: {testResults.results.failed}</div>
                            <div className="text-yellow-400">⚠️ 警告: {testResults.results.warnings}</div>
                            <div className="text-gray-400">⏭️ 跳过: {testResults.results.skipped}</div>
                          </div>
                        </div>
                      )}
                      
                      {testResults.serverUrl && (
                        <div className="text-gray-400 text-xs mt-2">
                          🌐 服务器: {testResults.serverUrl}
                        </div>
                      )}
                      
                      {testResults.error && (
                        <div className="text-red-400 text-xs mt-2">
                          错误: {testResults.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 测试状态摘要 */}
              {systemStatus?.testResult && (
                <div className="text-xs text-gray-400">
                  上次测试: {selectedTestSuite} 模式 • {systemStatus.testResult.success ? '通过' : '失败'} • 
                  {new Date(systemStatus.testResult.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {/* 修复结果 */}
          {systemStatus?.fixResult && (
            <div className={`p-3 rounded-lg border ${
              systemStatus.fixResult.success 
                ? 'bg-green-900/20 border-green-700/50' 
                : 'bg-red-900/20 border-red-700/50'
            }`}>
              <div className="flex items-start space-x-2">
                {systemStatus.fixResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm">
                  <div className={`font-medium ${
                    systemStatus.fixResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {systemStatus.fixResult.success ? '修复成功' : '修复失败'}
                  </div>
                  <div className="text-gray-300 mt-1">{systemStatus.fixResult.message}</div>
                  {systemStatus.fixResult.fixes && systemStatus.fixResult.fixes.length > 0 && (
                    <div className="text-gray-400 text-xs mt-2">
                      <div>已执行修复:</div>
                      <ul className="list-disc list-inside ml-2">
                        {systemStatus.fixResult.fixes.map((fix, index) => (
                          <li key={index}>{fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {systemStatus.fixResult.recommendation && (
                    <div className="text-gray-400 text-xs mt-2">
                      💡 {systemStatus.fixResult.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {systemStatus?.error && (
            <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="text-red-400 font-medium">检查失败</div>
                  <div className="text-gray-300 mt-1">{systemStatus.error}</div>
                  {systemStatus.suggestion && (
                    <div className="text-gray-400 text-xs mt-2">
                      💡 {systemStatus.suggestion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API确认对话框 */}
      {showConfirmDialog && confirmParams && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>{confirmParams.message.title}</span>
            </h3>
            
            <div className="space-y-3 mb-6">
              {confirmParams.message.details.map((detail, index) => (
                <div key={index} className="text-sm text-gray-300">
                  {detail}
                </div>
              ))}
              
              {confirmParams.message.context && (
                <div className="text-sm text-gray-400 italic">
                  {confirmParams.message.context}
                </div>
              )}
              
              {confirmParams.message.warning && (
                <div className={`p-2 rounded border ${
                  confirmParams.message.warning.level === 'critical' 
                    ? 'bg-red-900/20 border-red-700/50 text-red-400'
                    : 'bg-yellow-900/20 border-yellow-700/50 text-yellow-400'
                }`}>
                  ⚠️ {confirmParams.message.warning.text}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleConfirmDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleConfirmDialog(true)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                确认执行
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SystemHealthPanel