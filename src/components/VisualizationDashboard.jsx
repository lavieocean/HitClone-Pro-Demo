import React, { useState } from 'react'
import { BarChart, RefreshCw, Download, Share2 } from 'lucide-react'
import SentimentTimeline from './visualizations/SentimentTimeline'
import EngagementChart from './visualizations/EngagementChart'
import InsightsPanel from './visualizations/InsightsPanel'
import VideoMetrics from './visualizations/VideoMetrics'

const VisualizationDashboard = ({ results, input, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: '概览', icon: BarChart },
    { id: 'essence', label: 'Essence', icon: BarChart },
    { id: 'sentiment', label: '情感分析', icon: BarChart },
    { id: 'engagement', label: '参与度', icon: BarChart },
    { id: 'insights', label: '洞察报告', icon: BarChart }
  ]

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'HitClone Pro 分析结果',
        text: `查看"${results.contentInfo.title || results.contentInfo["标题"] || "内容"}"的AI分析结果`,
        url: window.location.href
      })
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  const handleExport = () => {
    const data = {
      analysis: results,
      input,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hitclone-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 标题区域 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              分析结果
            </h2>
            <p className="text-lg text-gray-400">
              {results.contentInfo.title || results.contentInfo["标题"] || "内容分析"}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </button>
            
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>导出</span>
            </button>
            
            <button
              onClick={onReset}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>新分析</span>
            </button>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="mb-6">
        <div className="border-b border-gray-800">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-[#DBFC53] text-[#DBFC53]'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VideoMetrics data={results.contentInfo} />
            <div className="space-y-6">
              <SentimentTimeline data={results.sentimentData} compact />
              <EngagementChart data={results.engagementData} compact />
            </div>
          </div>
        )}
        
        {activeTab === 'essence' && (
          <div className="space-y-6">
            {/* Essence Summary - v2.2 新功能 */}
            {results.insights?.essence_summary && (
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span className="text-2xl">✨</span>
                  <span>精华总结 (Essence)</span>
                </h3>
                
                <div className="space-y-6">
                  {/* Big Idea */}
                  <div className="p-4 bg-gradient-to-r from-lime-400/10 to-green-400/10 rounded-lg border border-lime-400/20">
                    <h4 className="font-semibold text-lime-400 mb-2">🎯 核心创意 (Big Idea)</h4>
                    <p className="text-gray-200 text-lg leading-relaxed">
                      {results.insights.essence_summary.big_idea || '暂无核心创意数据'}
                    </p>
                  </div>
                  
                  {/* Elevator Pitch */}
                  <div className="p-4 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-lg border border-blue-400/20">
                    <h4 className="font-semibold text-blue-400 mb-2">🏢 电梯间推介 (30秒版)</h4>
                    <p className="text-gray-200 leading-relaxed">
                      {results.insights.essence_summary.elevator_pitch || '暂无电梯间推介数据'}
                    </p>
                  </div>
                  
                  {/* Unique Angle */}
                  <div className="p-4 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-lg border border-orange-400/20">
                    <h4 className="font-semibold text-orange-400 mb-2">🎨 独特视角</h4>
                    <p className="text-gray-200 leading-relaxed">
                      {results.insights.essence_summary.unique_angle || '暂无独特视角数据'}
                    </p>
                  </div>
                  
                  {/* Core Quote */}
                  {results.insights.essence_summary.core_quote && (
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-gray-300 mb-2">💬 核心引用</h4>
                      <blockquote className="text-gray-300 italic border-l-4 border-lime-400 pl-4">
                        "{results.insights.essence_summary.core_quote}"
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Action Board - v2.2 新功能 */}
            {results.insights?.action_board && (
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span className="text-2xl">📋</span>
                  <span>行动清单</span>
                </h3>
                
                <div className="space-y-4">
                  {results.insights.action_board.map((action, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        action.priority === 'high' 
                          ? 'bg-red-400/10 border-red-400' 
                          : action.priority === 'medium'
                          ? 'bg-yellow-400/10 border-yellow-400'
                          : 'bg-green-400/10 border-green-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold ${
                          action.priority === 'high' ? 'text-red-400' 
                          : action.priority === 'medium' ? 'text-yellow-400'
                          : 'text-green-400'
                        }`}>
                          {action.priority === 'high' ? '🔥 高优先级' 
                           : action.priority === 'medium' ? '⚡ 中优先级' 
                           : '📌 低优先级'}
                        </h4>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {action.estimated_time || '未知时间'}
                        </span>
                      </div>
                      
                      <p className="text-gray-200 mb-2">{action.task}</p>
                      
                      <p className="text-sm text-gray-400 mb-2">
                        <strong>预期影响:</strong> {action.expected_impact}
                      </p>
                      
                      {action.supporting_quote && (
                        <blockquote className="text-xs text-gray-500 italic border-l-2 border-gray-600 pl-2">
                          {action.supporting_quote}
                        </blockquote>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Video Summary - v2.2 新功能 */}
            {results.insights?.video_summary && (
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span className="text-2xl">📹</span>
                  <span>视频摘要</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">核心描述</h4>
                    <p className="text-gray-200">{results.insights.video_summary.core_description}</p>
                  </div>
                  
                  {results.insights.video_summary.main_topics && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-2">主要话题</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.insights.video_summary.main_topics.map((topic, index) => (
                          <span key={index} className="px-3 py-1 bg-lime-400/20 text-lime-400 rounded-full text-sm">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.insights.video_summary.core_quote && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-2">核心引用</h4>
                      <blockquote className="text-gray-300 italic border-l-4 border-lime-400 pl-4">
                        "{results.insights.video_summary.core_quote}"
                      </blockquote>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'sentiment' && (
          <SentimentTimeline data={results.sentimentData} />
        )}
        
        {activeTab === 'engagement' && (
          <EngagementChart data={results.engagementData} />
        )}
        
        {activeTab === 'insights' && (
          <InsightsPanel data={results.insights} />
        )}
      </div>

      {/* 分析时间信息 */}
      <div className="mt-8 p-4 bg-gray-900 rounded-lg text-center border border-gray-800">
        <p className="text-sm text-gray-400">
          分析完成时间: {new Date(results.analyzedAt).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  )
}

export default VisualizationDashboard