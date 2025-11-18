import React, { useState } from 'react'
import { 
  Play, 
  BarChart3, 
  FileText, 
  Settings, 
  ChevronDown,
  Zap,
  Video,
  Image,
  MessageSquare
} from 'lucide-react'

const Sidebar = ({ currentView, onReset }) => {
  const [selectedModel, setSelectedModel] = useState('Claude 3.5 Sonnet')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)

  const models = [
    'Claude 3.5 Sonnet',
    'Claude 3.5 Haiku', 
    'Claude 3 Opus'
  ]

  const menuItems = [
    {
      icon: Video,
      label: 'HitClone',
      active: true,
      description: '视频分析工具'
    },
    {
      icon: BarChart3,
      label: '分析历史',
      active: false,
      description: '历史记录'
    },
    {
      icon: FileText,
      label: '报告管理',
      active: false, 
      description: '导出报告'
    },
    {
      icon: Settings,
      label: '设置',
      active: false,
      description: '系统配置'
    }
  ]

  return (
    <div className="w-64 bg-black border-r border-gray-800 flex flex-col">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-[#DBFC53] rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Alici.AI</h1>
            <p className="text-xs text-gray-400">AI Assistant</p>
          </div>
        </div>

        {/* 模型选择器 */}
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#DBFC53] rounded-full"></div>
              <span className="text-sm text-white font-medium">{selectedModel}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
              modelDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {modelDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-lg z-50">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => {
                    setSelectedModel(model)
                    setModelDropdownOpen(false)
                  }}
                  className={`w-full text-left p-3 hover:bg-gray-800 transition-colors ${
                    model === selectedModel ? 'bg-gray-800 text-[#DBFC53]' : 'text-gray-300'
                  } ${models[0] === model ? 'rounded-t-xl' : ''} ${
                    models[models.length - 1] === model ? 'rounded-b-xl' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      model === selectedModel ? 'bg-[#DBFC53]' : 'bg-gray-600'
                    }`}></div>
                    <span className="text-sm font-medium">{model}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 菜单区域 */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.label === 'HitClone' ? onReset : undefined}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                item.active 
                  ? 'bg-[#DBFC53]/10 text-[#DBFC53] border border-[#DBFC53]/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${
                item.active ? 'text-[#DBFC53]' : 'text-gray-500 group-hover:text-gray-300'
              }`} />
              <div className="flex-1 text-left">
                <div className={`text-sm font-medium ${
                  item.active ? 'text-[#DBFC53]' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* 状态指示器 */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            currentView === 'analysis' ? 'bg-yellow-400 animate-pulse' : 
            currentView === 'results' ? 'bg-[#DBFC53]' : 'bg-gray-600'
          }`}></div>
          <span className="text-gray-400">
            {currentView === 'analysis' ? '分析中...' :
             currentView === 'results' ? '分析完成' : '就绪'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          HitClone Pro v2.0
        </div>
      </div>
    </div>
  )
}

export default Sidebar