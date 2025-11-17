import React, { useState, useEffect } from 'react'
import { 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Users, 
  BarChart3, 
  Search,
  Trash2,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import channelAnalysisService from '../../services/channelAnalysisService'

const ChannelSidebar = ({ isOpen, onToggle, onChannelSelect }) => {
  const [channels, setChannels] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)

  // 加载频道数据
  const loadChannels = () => {
    const analyzableChannels = channelAnalysisService.getAnalyzableChannels()
    const channelStats = channelAnalysisService.getChannelStats()
    
    setChannels(analyzableChannels)
    setStats(channelStats)
  }

  useEffect(() => {
    loadChannels()
  }, [])

  // 筛选频道
  const filteredChannels = channels.filter(channel =>
    channel.channelName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 删除频道
  const handleDeleteChannel = (channelId, e) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个频道的所有数据吗？')) {
      channelAnalysisService.deleteChannel(channelId)
      loadChannels()
    }
  }

  // 导出数据
  const handleExportData = () => {
    channelAnalysisService.exportChannelData()
  }

  // 导入数据
  const handleImportData = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLoading(true)
      channelAnalysisService.importChannelData(file)
        .then(result => {
          if (result.success) {
            loadChannels()
            alert(`成功导入 ${result.channels} 个频道的数据`)
          } else {
            alert('导入失败: ' + result.error)
          }
        })
        .finally(() => {
          setLoading(false)
          e.target.value = '' // 清空文件输入
        })
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={onToggle}
          className="bg-lime-400 hover:bg-lime-500 text-gray-900 p-3 rounded-l-xl shadow-lg transition-all duration-300"
          title="打开频道分析"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 z-50 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-lime-400" />
            <span>频道分析</span>
          </h2>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-lime-400 font-semibold text-lg">{stats.analyzableChannels || 0}</div>
            <div className="text-xs text-gray-400">可分析频道</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-semibold text-lg">{stats.totalVideos || 0}</div>
            <div className="text-xs text-gray-400">总视频数</div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索频道..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-lime-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 频道列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-2">
              {searchTerm ? '未找到匹配的频道' : '暂无可分析的频道'}
            </p>
            <p className="text-gray-500 text-xs">
              需要至少分析3个来自同一频道的视频
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.channelId}
                channel={channel}
                onSelect={onChannelSelect}
                onDelete={handleDeleteChannel}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={handleExportData}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
            title="导出频道数据"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
          
          <label className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>导入</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              disabled={loading}
            />
          </label>
          
          <button
            onClick={loadChannels}
            className="flex items-center justify-center py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
            title="刷新数据"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 频道卡片组件
const ChannelCard = ({ channel, onSelect, onDelete }) => {
  const summary = channelAnalysisService.getChannelVideosSummary(channel.channelId)
  
  return (
    <div
      className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-lime-400/50 transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(channel)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-white text-sm line-clamp-2 flex-1">
          {channel.channelName}
        </h3>
        <button
          onClick={(e) => onDelete(channel.channelId, e)}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all ml-2"
          title="删除频道"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">视频数量</span>
          <span className="text-lime-400 font-medium">{channel.totalVideos}</span>
        </div>
        
        {summary && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">平均观看</span>
              <span className="text-blue-400">{formatViews(summary.avgViews)}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">字幕比例</span>
              <span className="text-green-400">{Math.round(summary.hasSubtitlesRatio * 100)}%</span>
            </div>
          </>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">最后分析</span>
          <span className="text-gray-500">{channel.lastAnalysisDate}</span>
        </div>
      </div>

      {channel.channelAnalysisResults && (
        <div className="mt-2 flex items-center space-x-1 text-xs text-lime-400">
          <BarChart3 className="w-3 h-3" />
          <span>已完成频道分析</span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Play className="w-3 h-3" />
          <span>点击查看分析</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-lime-400 transition-colors" />
      </div>
    </div>
  )
}

// 格式化观看数
const formatViews = (views) => {
  if (views >= 1000000) {
    return Math.round(views / 1000000) + 'M'
  } else if (views >= 1000) {
    return Math.round(views / 1000) + 'K'
  }
  return views.toString()
}

export default ChannelSidebar