import React, { useEffect } from 'react'

const TopNavigation = ({ activeTab, onTabChange, onPageChange }) => {
  // 监听Gemini设置导航事件
  useEffect(() => {
    const handleNavigateToGeminiSettings = () => {
      if (onPageChange) {
        onPageChange('gemini-settings')
      }
    }
    
    window.addEventListener('navigate-to-gemini-settings', handleNavigateToGeminiSettings)
    return () => window.removeEventListener('navigate-to-gemini-settings', handleNavigateToGeminiSettings)
  }, [onPageChange])
  return (
    <header className="top-nav">
      <nav className="top-nav-tabs">
        <div 
          className={`top-nav-tab ${activeTab === 'Chat' ? 'active' : ''}`}
          onClick={() => onTabChange('Chat')}
        >
          Chat
        </div>
        <div 
          className={`top-nav-tab ${activeTab === 'Image' ? 'active' : ''}`}
          onClick={() => onTabChange('Image')}
        >
          Image
        </div>
        <div 
          className={`top-nav-tab ${activeTab === 'Video' ? 'active' : ''}`}
          onClick={() => onTabChange('Video')}
        >
          Video
        </div>
        <div 
          className={`top-nav-tab ${activeTab === 'Explore' ? 'active' : ''}`}
          onClick={() => onTabChange('Explore')}
        >
          Explore
        </div>
      </nav>
      
      <div className="top-nav-right">
        <button className="top-nav-btn">
          Alici VS Sora
        </button>
        <button className="top-nav-btn">
          Quick Guide
        </button>
        <div className="credits">
          <span>💎</span>
          <span>Credits: 12,148</span>
        </div>
      </div>
    </header>
  )
}

export default TopNavigation