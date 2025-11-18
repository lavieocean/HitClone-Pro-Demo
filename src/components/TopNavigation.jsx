import React from 'react'
import { MessageSquare, Image, Video, Compass, Coins, User } from 'lucide-react'

const TopNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'Chat', label: 'Chat', icon: MessageSquare },
    { id: 'Image', label: 'Image', icon: Image },
    { id: 'Video', label: 'Video', icon: Video },
    { id: 'Explore', label: 'Explore', icon: Compass }
  ]

  return (
    <div className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
      {/* 标签页导航 */}
      <div className="flex items-center space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#DBFC53]/10 text-[#DBFC53] border border-[#DBFC53]/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${
              activeTab === tab.id ? 'text-[#DBFC53]' : 'text-gray-500'
            }`} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 用户信息和积分 */}
      <div className="flex items-center space-x-4">
        {/* Credits显示 */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700">
          <Coins className="w-4 h-4 text-[#DBFC53]" />
          <span className="text-sm font-medium text-white">9,847</span>
          <span className="text-xs text-gray-400">Credits</span>
        </div>

        {/* 用户头像 */}  
        <button className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-900 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-[#DBFC53] to-green-400 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-medium text-white">用户</span>
        </button>
      </div>
    </div>
  )
}

export default TopNavigation