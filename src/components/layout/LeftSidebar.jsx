import React from 'react'

const LeftSidebar = ({ currentPage, onPageChange }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span>🤖</span>
          <span>Alici.AI</span>
        </div>
      </div>
      
      <div className="sidebar-nav">
        {/* 主要功能区 */}
        <div className="nav-section">
          <div className="nav-item">
            <span className="nav-icon">💬</span>
            <span>Chat</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🎨</span>
            <span>Image</span>
          </div>
          <div className="nav-item active">
            <span className="nav-icon">🎬</span>
            <span>Video</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🔍</span>
            <span>Explore</span>
          </div>
        </div>
        
        {/* Video Models 区 */}
        <div className="nav-section">
          <div className="nav-section-title">Video Models</div>
          <div className="nav-item">
            <span className="nav-icon">🎯</span>
            <span>Kling</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">✨</span>
            <span>Luma</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🚀</span>
            <span>Runway</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🌟</span>
            <span>Google Veo</span>
          </div>
        </div>
        
        {/* HitClone Pro 区 */}
        <div className="nav-section">
          <div className="nav-section-title">HitClone Pro</div>
          <div 
            className={`nav-item ${currentPage === 'start' ? 'active' : ''}`}
            onClick={() => onPageChange('start')}
          >
            <span className="nav-icon">🚀</span>
            <span>Start</span>
          </div>
          <div 
            className={`nav-item ${currentPage === 'channel' ? 'active' : ''}`}
            onClick={() => onPageChange('channel')}
          >
            <span className="nav-icon">🎯</span>
            <span>HitClone Channel</span>
          </div>
          <div 
            className={`nav-item ${currentPage === 'history' ? 'active' : ''}`}
            onClick={() => onPageChange('history')}
          >
            <span className="nav-icon">📊</span>
            <span>History Reports</span>
          </div>
          <div 
            className={`nav-item ${currentPage === 'favorites' ? 'active' : ''}`}
            onClick={() => onPageChange('favorites')}
          >
            <span className="nav-icon">⭐</span>
            <span>My Favorites</span>
          </div>
          <div 
            className={`nav-item ${currentPage === 'gemini-settings' ? 'active' : ''}`}
            onClick={() => onPageChange('gemini-settings')}
          >
            <span className="nav-icon">🧠</span>
            <span>Gemini Settings</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default LeftSidebar