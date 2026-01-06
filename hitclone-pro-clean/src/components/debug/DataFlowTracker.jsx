import React, { useState, useEffect } from 'react'
import { Play, ArrowRight, CheckCircle, AlertCircle, Clock, Database } from 'lucide-react'

const DataFlowTracker = ({ analysisResults, currentInput, isVisible = false }) => {
  const [flowSteps, setFlowSteps] = useState([])
  const [expandedStep, setExpandedStep] = useState(null)

  useEffect(() => {
    if (currentInput) {
      trackDataFlow(currentInput, analysisResults)
    }
  }, [currentInput, analysisResults])

  const trackDataFlow = (input, results) => {
    const steps = []

    // 步骤1: 输入解析
    steps.push({
      id: 'input_parsing',
      name: '输入解析',
      status: 'completed',
      timestamp: new Date().toISOString(),
      data: {
        type: input.type,
        url: input.data?.length > 50 ? `${input.data.substring(0, 50)}...` : input.data,
        hasVideoData: !!input.videoData,
        autoFetched: !!input.autoFetched
      },
      details: {
        '输入类型': input.type === 'url' ? '视频链接' : 'SRT文件',
        '数据长度': typeof input.data === 'string' ? `${input.data.length} 字符` : '对象数据',
        '自动获取': input.autoFetched ? '是' : '否',
        'Video ID': input.videoData?.videoId || '未知'
      }
    })

    // 步骤2: YouTube数据获取
    if (input.type === 'url') {
      steps.push({
        id: 'youtube_fetch',
        name: 'YouTube数据获取',
        status: input.videoData ? 'completed' : 'warning',
        timestamp: new Date().toISOString(),
        data: {
          title: input.videoData?.title || '未获取',
          channel: input.videoData?.channelName || '未知',
          hasSubtitles: input.videoData?.hasSubtitles || false,
          thumbnails: !!input.videoData?.thumbnails
        },
        details: {
          '视频标题': input.videoData?.title || '未获取到标题',
          '频道名称': input.videoData?.channelName || '未知频道',
          '字幕状态': input.videoData?.hasSubtitles ? '已获取' : '未获取',
          '缩略图': input.videoData?.thumbnails ? '已获取' : '未获取',
          '观看数': input.videoData?.viewCount || '未知',
          '发布日期': input.videoData?.publishDate || '未知'
        }
      })
    }

    // 步骤3: AI分析处理
    if (results) {
      steps.push({
        id: 'ai_analysis',
        name: 'AI分析处理',
        status: results.originalAnalysis ? 'completed' : 'error',
        timestamp: new Date().toISOString(),
        data: {
          hasOriginalAnalysis: !!results.originalAnalysis,
          hasContentInfo: !!results.contentInfo,
          hasMeta: !!results.meta,
          analysisMode: results.meta?.analysis_mode || '未知'
        },
        details: {
          '分析模式': results.meta?.analysis_mode || '未知模式',
          '数据质量': results.meta?.data_quality || '未知',
          '内容信息': results.contentInfo ? '已生成' : '未生成',
          '原始分析': results.originalAnalysis ? '已完成' : '未完成',
          '警告信息': results.meta?.data_warning?.length || 0
        }
      })
    }

    // 步骤4: 报告生成
    if (results && results.originalAnalysis) {
      steps.push({
        id: 'report_generation',
        name: '报告生成',
        status: 'completed',
        timestamp: new Date().toISOString(),
        data: {
          hasViralFactors: !!results.insights?.viralFactors,
          hasMonetization: !!results.monetization,
          hasOptimization: !!results.optimization,
          reportComplete: !!(results.originalAnalysis && results.contentInfo)
        },
        details: {
          '病毒因子': results.insights?.viralFactors ? '已分析' : '未分析',
          '变现分析': results.monetization ? '已生成' : '未生成',
          '优化建议': results.optimization ? '已生成' : '未生成',
          '报告完整性': calculateCompleteness(results)
        }
      })
    }

    setFlowSteps(steps)
  }

  const calculateCompleteness = (results) => {
    const checks = [
      !!results.originalAnalysis,
      !!results.contentInfo,
      !!results.insights,
      !!results.meta
    ]
    const completeness = (checks.filter(Boolean).length / checks.length) * 100
    return `${completeness.toFixed(0)}% 完整`
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-400/20 bg-green-400/5'
      case 'warning':
        return 'border-yellow-400/20 bg-yellow-400/5'
      case 'error':
        return 'border-red-400/20 bg-red-400/5'
      default:
        return 'border-gray-600 bg-gray-800/50'
    }
  }

  if (!isVisible || flowSteps.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mt-4">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="w-5 h-5 text-blue-400" />
        <h3 className="font-medium text-white">数据流追踪</h3>
        <span className="text-xs text-gray-400">
          {flowSteps.length} 个步骤
        </span>
      </div>

      <div className="space-y-3">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="space-y-2">
            {/* 步骤主体 */}
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${getStatusColor(step.status)}`}
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-500">
                      {index + 1}
                    </span>
                    {getStatusIcon(step.status)}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* 关键数据预览 */}
                  <div className="text-xs text-gray-500">
                    {step.id === 'input_parsing' && (
                      <span>类型: {step.data.type}</span>
                    )}
                    {step.id === 'youtube_fetch' && (
                      <span>字幕: {step.data.hasSubtitles ? '✓' : '✗'}</span>
                    )}
                    {step.id === 'ai_analysis' && (
                      <span>模式: {step.data.analysisMode}</span>
                    )}
                    {step.id === 'report_generation' && (
                      <span>完整: {step.data.reportComplete ? '✓' : '✗'}</span>
                    )}
                  </div>
                  
                  <div className={`transform transition-transform duration-200 ${
                    expandedStep === step.id ? 'rotate-90' : ''
                  }`}>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 详细信息展开 */}
            {expandedStep === step.id && (
              <div className="ml-8 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(step.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{key}</span>
                      <span className="text-sm text-gray-300 font-mono">
                        {typeof value === 'string' && value.length > 30 
                          ? `${value.substring(0, 30)}...` 
                          : value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 原始数据查看 */}
                {step.data && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                      查看原始数据
                    </summary>
                    <pre className="mt-2 text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-x-auto">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* 连接线 */}
            {index < flowSteps.length - 1 && (
              <div className="ml-6 flex items-center">
                <div className="w-px h-4 bg-gray-600"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 流程概览 */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">流程状态</span>
          <div className="flex items-center space-x-4">
            <span className="text-green-400">
              ✓ {flowSteps.filter(s => s.status === 'completed').length}
            </span>
            <span className="text-yellow-400">
              ⚠ {flowSteps.filter(s => s.status === 'warning').length}
            </span>
            <span className="text-red-400">
              ✗ {flowSteps.filter(s => s.status === 'error').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataFlowTracker