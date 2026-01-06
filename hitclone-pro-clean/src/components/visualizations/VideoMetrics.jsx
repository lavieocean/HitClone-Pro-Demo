import React from 'react'
import { Eye, Heart, MessageCircle, Calendar, Clock } from 'lucide-react'
import { DebugHelper } from '../../utils/debugHelper'

const VideoMetrics = ({ data }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return DebugHelper.safeToFixed(num / 1000000, 1, 'VideoMetrics-formatNumber-M') + 'M'
    } else if (num >= 1000) {
      return DebugHelper.safeToFixed(num / 1000, 1, 'VideoMetrics-formatNumber-K') + 'K'
    }
    return num?.toString() || '0'
  }

  // 根据数据类型适配不同的指标
  const metrics = data.views !== undefined ? [
    {
      label: '观看数',
      value: formatNumber(data.views || data["观看数"]),
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      label: '点赞数',
      value: formatNumber(data.likes || data["点赞数"]),
      icon: Heart,
      color: 'text-red-600'
    },
    {
      label: '评论数',  
      value: formatNumber(data.comments || data["评论数"]),
      icon: MessageCircle,
      color: 'text-green-600'
    },
    {
      label: '时长',
      value: data.duration || data["时长"],
      icon: Clock,
      color: 'text-purple-600'
    }
  ] : [
    {
      label: '字幕条数',
      value: data["字幕条数"] || data.subtitleCount || '0',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      label: '总词数',
      value: data["总词数"] || data.totalWords || '0',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      label: '平均语速',
      value: data["平均语速"] || data.avgSpeed || '0',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      label: '时长',
      value: data["时长"] || data.duration || '0分钟',
      icon: Clock,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">
        {data.views !== undefined ? '视频基础数据' : '内容基础数据'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-white mb-1">
            {data.title || data["标题"] || "内容分析"}
          </h4>
          <p className="text-sm text-gray-600">
            {data.description || data["描述"] || data["主要话题"] || "暂无描述"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className={`flex-shrink-0 ${metric.color}`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{metric.value}</p>
                <p className="text-sm text-gray-400">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
        
        {(data.publishDate || data["发布日期"]) && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>发布于 {data.publishDate || data["发布日期"]}</span>
          </div>
        )}
        
        {(data.tags || data["标签"]) && (data.tags || data["标签"]).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(data.tags || data["标签"]).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-[#DBFC53]/10 text-[#DBFC53] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoMetrics