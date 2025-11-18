import React from 'react'
import { TrendingUp, AlertTriangle, CheckCircle, Target, Share2, Star } from 'lucide-react'
import { DebugHelper } from '../../utils/debugHelper'

const InsightsPanel = ({ data }) => {
  const viralColor = data.trending?.viralPotential > 7 ? 'text-green-600' : 
                     data.trending?.viralPotential > 5 ? 'text-yellow-600' : 'text-gray-600'
                     
  const shareColor = data.trending?.shareability > 7 ? 'text-green-600' : 
                     data.trending?.shareability > 5 ? 'text-yellow-600' : 'text-gray-600'

  return (
    <div className="space-y-6">
      {/* 总结 */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">分析总结</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">{data.summary}</p>
      </div>

      {/* 趋势指标 */}
      {data.trending && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">趋势分析</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${data.trending.isViral ? 'text-green-600' : 'text-gray-600'}`}>
                {data.trending.isViral ? '是' : '否'}
              </div>
              <p className="text-sm text-gray-600 mt-1">爆款潜力</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${viralColor}`}>
                {DebugHelper.safeToFixed(data.trending.viralPotential, 1, 'InsightsPanel-viralPotential')}
              </div>
              <p className="text-sm text-gray-600 mt-1">病毒传播指数</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${shareColor}`}>
                {DebugHelper.safeToFixed(data.trending.shareability, 1, 'InsightsPanel-shareability')}
              </div>
              <p className="text-sm text-gray-600 mt-1">分享价值</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 优势 */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">表现优势</h3>
          </div>
          
          <ul className="space-y-3">
            {data.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 改进建议 */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">改进建议</h3>
          </div>
          
          <ul className="space-y-3">
            {data.improvements?.map((improvement, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 推荐策略 */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">推荐策略</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.recommendations?.map((rec, index) => (
            <div key={index} className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-purple-900">策略 {index + 1}</span>
              </div>
              <p className="text-sm text-purple-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 分享建议 */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2 mb-4">
          <Share2 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">分享与推广</h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-gray-700">
            基于分析结果，此视频具有
            <span className={`font-semibold ${viralColor}`}>
              {data.trending?.viralPotential > 7 ? '高' : data.trending?.viralPotential > 5 ? '中等' : '一般'}
            </span>
            传播潜力，建议：
          </p>
          
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>在观众活跃度最高的时段进行推广</li>
            <li>利用情感高峰时刻制作精彩片段</li>
            <li>针对改进点优化后续内容</li>
            <li>考虑制作相关主题的系列内容</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InsightsPanel