import React from 'react'
import { Play, Zap, BarChart3 } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HitClone Pro</h1>
              <p className="text-sm text-gray-600">AI驱动的视频分析工具</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-primary-500" />
              <span>Claude内建API</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              <span>实时可视化</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header