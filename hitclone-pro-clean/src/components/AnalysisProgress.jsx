import React from 'react'
import { CheckCircle, Clock, Loader2, FileText, Link } from 'lucide-react'

const AnalysisProgress = ({ step, input }) => {
  const isVideoInput = input?.type === 'url'
  const isSRTInput = input?.type === 'srt'

  const steps = [
    {
      id: 1,
      title: isVideoInput ? '视频内容提取' : 'SRT内容解析',
      description: isVideoInput 
        ? '分析视频元数据、标题、描述和基础信息'
        : '解析字幕时间轴、提取文本内容和基础统计',
      duration: '30秒'
    },
    {
      id: 2,
      title: '情感分析',
      description: isVideoInput
        ? '评估观众情绪反应和评论情感倾向'
        : '分析字幕内容的情感倾向和情绪变化',
      duration: '45秒'
    },
    {
      id: 3,
      title: isVideoInput ? '热度分析' : '内容质量分析',
      description: isVideoInput
        ? '计算参与度指标和趋势变化'
        : '评估内容节奏、语言质量和信息密度',
      duration: '35秒'
    },
    {
      id: 4,
      title: '综合洞察',
      description: '生成最终分析报告和可视化数据',
      duration: '40秒'
    }
  ]

  const getStepStatus = (stepId) => {
    if (stepId < step) return 'completed'
    if (stepId === step) return 'active'
    return 'pending'
  }

  const getStepIcon = (stepId) => {
    const status = getStepStatus(stepId)
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-[#DBFC53]" />
      case 'active':
        return <Loader2 className="w-6 h-6 text-[#DBFC53] animate-spin" />
      default:
        return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  const getInputDisplay = () => {
    if (!input) return ''
    
    if (input.type === 'url') {
      return input.data
    } else if (input.type === 'srt') {
      return input.fileName || 'SRT文件'
    }
    return ''
  }

  const getInputIcon = () => {
    if (!input) return null
    return input.type === 'url' ? Link : FileText
  }

  const InputIcon = getInputIcon()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold glow-text mb-4">
          AI分析进行中
        </h2>
        <p className="text-xl text-gray-300 mb-6">
          正在使用Claude内建API进行4步智能分析
        </p>
        <div className="inline-flex items-center space-x-3 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
          {InputIcon && <InputIcon className="w-5 h-5 text-[#DBFC53]" />}
          <span className="text-white font-medium">
            {input?.type === 'url' ? '分析视频' : '分析字幕'}:
          </span>
          <span className="text-gray-300 truncate max-w-md">
            {getInputDisplay()}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="space-y-8">
          {steps.map((stepInfo, index) => {
            const status = getStepStatus(stepInfo.id)
            return (
              <div key={stepInfo.id} className="flex items-start space-x-6">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(stepInfo.id)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xl font-semibold ${
                      status === 'completed' ? 'text-[#DBFC53]' :
                      status === 'active' ? 'text-white' :
                      'text-gray-500'
                    }`}>
                      步骤 {stepInfo.id}: {stepInfo.title}
                    </h3>
                    <span className="text-sm text-gray-400 px-3 py-1 bg-gray-800 rounded-full">
                      预计 {stepInfo.duration}
                    </span>
                  </div>
                  
                  <p className={`text-sm leading-relaxed ${
                    status === 'completed' ? 'text-gray-400' :
                    status === 'active' ? 'text-gray-200' :
                    'text-gray-500'
                  }`}>
                    {stepInfo.description}
                  </p>
                  
                  {status === 'active' && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#DBFC53] to-[#c7e847] h-3 rounded-full animate-pulse shadow-lg" 
                             style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-[#DBFC53] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">
                正在使用Claude API处理...
              </span>
            </div>
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              <span>进度:</span>
              <span className="text-[#DBFC53] font-semibold">
                {step} / {steps.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisProgress