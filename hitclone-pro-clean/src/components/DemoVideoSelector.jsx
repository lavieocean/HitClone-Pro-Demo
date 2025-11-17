import React from 'react'
import demoDataService from '../services/demoDataService'

const DemoVideoSelector = ({ onSelectDemo }) => {
  const demoVideos = demoDataService.getAvailableDemoVideos()

  const handleDemoSelect = (video) => {
    const analysisPackage = demoDataService.getDemoAnalysisPackage(video.url)
    if (analysisPackage && onSelectDemo) {
      console.log('🎬 加载演示视频:', video.title)
      onSelectDemo(analysisPackage)
    }
  }

  return (
    <div className="demo-video-selector">
      <div className="demo-header">
        <h3 className="demo-title">🚀 快速体验 Master Prompt v2.2</h3>
        <p className="demo-subtitle">
          精选高质量演示视频，预缓存数据，跳过等待，直接体验AI分析的强大洞察
        </p>
      </div>
      
      <div className="demo-videos-grid">
        {demoVideos.map((video, index) => (
          <div 
            key={video.url}
            className="demo-video-card"
            onClick={() => handleDemoSelect(video)}
          >
            <div className="demo-video-thumbnail">
              <img 
                src={`https://img.youtube.com/vi/${demoDataService.extractVideoId(video.url)}/hqdefault.jpg`}
                alt={video.title}
                className="demo-thumbnail-image"
              />
              <div className="demo-video-overlay">
                <div className="demo-play-icon">▶</div>
                <div className="demo-duration">{video.duration}</div>
              </div>
            </div>
            
            <div className="demo-video-info">
              <h4 className="demo-video-title">{video.title}</h4>
              <div className="demo-video-meta">
                <span className="demo-channel">{video.channelName}</span>
                <span className="demo-views">{video.viewCount} views</span>
              </div>
              <div className="demo-category-tag">{video.category}</div>
            </div>
            
            <div className="demo-instant-badge">
              ⚡ 即时分析
            </div>
          </div>
        ))}
      </div>
      
      <div className="demo-features">
        <div className="demo-feature">
          <span className="demo-feature-icon">🎯</span>
          <span>真实YouTube数据</span>
        </div>
        <div className="demo-feature">
          <span className="demo-feature-icon">🚀</span>
          <span>零等待时间</span>
        </div>
        <div className="demo-feature">
          <span className="demo-feature-icon">📊</span>
          <span>完整8维度报告</span>
        </div>
        <div className="demo-feature">
          <span className="demo-feature-icon">🧠</span>
          <span>Master Prompt v2.2</span>
        </div>
      </div>
    </div>
  )
}

export default DemoVideoSelector