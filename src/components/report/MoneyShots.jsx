import React from 'react'
import { DebugHelper } from '../../utils/debugHelper'

const MoneyShots = ({ analysisResults }) => {
  // 黄金片段数据
  const moneyShots = [
    {
      id: 1,
      title: '震撼开场',
      timestamp: '0:03-0:18',
      duration: 15,
      type: 'hook',
      shareability: 94,
      viralPotential: 91,
      description: '极具视觉冲击力的开场镜头，瞬间抓住观众注意力',
      keyElements: [
        '高对比度视觉效果',
        '音效与画面完美同步',
        '核心问题一针见血'
      ],
      metrics: {
        replayRate: 67,
        screenshotRate: 45,
        clipShareRate: 38
      },
      bestPlatforms: ['抖音', 'Instagram', 'TikTok']
    },
    {
      id: 2,
      title: '关键转折点',
      timestamp: '2:47-3:12',
      duration: 25,
      type: 'reveal',
      shareability: 89,
      viralPotential: 85,
      description: '意外的情节转折，颠覆观众预期的关键时刻',
      keyElements: [
        '出人意料的反转',
        '强烈的情感反差',
        '信息密度极高'
      ],
      metrics: {
        replayRate: 58,
        screenshotRate: 41,
        clipShareRate: 35
      },
      bestPlatforms: ['微博', 'Twitter', 'Reddit']
    },
    {
      id: 3,
      title: '情感爆发',
      timestamp: '6:33-7:08',
      duration: 35,
      type: 'climax',
      shareability: 96,
      viralPotential: 93,
      description: '情感达到顶峰的核心片段，最容易引发共鸣和分享',
      keyElements: [
        '情感表达真实动人',
        '戏剧张力达到极致',
        '普世价值观共鸣'
      ],
      metrics: {
        replayRate: 73,
        screenshotRate: 52,
        clipShareRate: 47
      },
      bestPlatforms: ['微信', 'Facebook', 'LinkedIn']
    },
    {
      id: 4,
      title: '金句名言',
      timestamp: '4:22-4:35',
      duration: 13,
      type: 'quote',
      shareability: 87,
      viralPotential: 82,
      description: '具有传播价值的经典语句，适合制作语录卡片',
      keyElements: [
        '言简意赅的智慧表达',
        '易于记忆和引用',
        '具备指导价值'
      ],
      metrics: {
        replayRate: 54,
        screenshotRate: 61,
        clipShareRate: 29
      },
      bestPlatforms: ['小红书', 'Pinterest', '知乎']
    },
    {
      id: 5,
      title: '技巧展示',
      timestamp: '5:15-5:48',
      duration: 33,
      type: 'tutorial',
      shareability: 83,
      viralPotential: 78,
      description: '实用技巧的详细演示，具有高教育价值',
      keyElements: [
        '步骤清晰易懂',
        '立即可操作性强',
        '效果显著可见'
      ],
      metrics: {
        replayRate: 71,
        screenshotRate: 38,
        clipShareRate: 42
      },
      bestPlatforms: ['B站', 'YouTube', '抖音']
    },
    {
      id: 6,
      title: '惊喜结尾',
      timestamp: '8:45-9:15',
      duration: 30,
      type: 'ending',
      shareability: 85,
      viralPotential: 80,
      description: '出乎意料的精彩结尾，留下深刻印象',
      keyElements: [
        '意外的额外价值',
        '完美的情感收束',
        '强烈的记忆点'
      ],
      metrics: {
        replayRate: 49,
        screenshotRate: 33,
        clipShareRate: 31
      },
      bestPlatforms: ['全平台适用']
    }
  ]

  const getTypeInfo = (type) => {
    const types = {
      hook: { name: '吸引开场', icon: '🎣', color: '#F59E0B' },
      reveal: { name: '关键揭示', icon: '🔍', color: '#A855F7' },
      climax: { name: '情感高潮', icon: '🎭', color: '#EF4444' },
      quote: { name: '金句名言', icon: '💬', color: '#10B981' },
      tutorial: { name: '技巧展示', icon: '🛠️', color: '#06B6D4' },
      ending: { name: '精彩结尾', icon: '🏁', color: '#8B5CF6' }
    }
    return types[type] || { name: '其他', icon: '⭐', color: '#666' }
  }

  const getShareabilityLevel = (score) => {
    if (score >= 90) return { level: '极高', color: '#DBFC53' }
    if (score >= 80) return { level: '高', color: '#A8E063' }
    if (score >= 70) return { level: '中等', color: '#FCD34D' }
    return { level: '一般', color: '#F59E0B' }
  }

  // 整体黄金片段统计
  const totalDuration = moneyShots.reduce((sum, shot) => sum + shot.duration, 0)
  const avgShareability = moneyShots.reduce((sum, shot) => sum + shot.shareability, 0) / moneyShots.length
  const avgViralPotential = moneyShots.reduce((sum, shot) => sum + shot.viralPotential, 0) / moneyShots.length

  return (
    <div className="money-shots-container">
      {/* 黄金片段概览 */}
      <div className="money-shots-overview">
        <h3 className="section-title">💰 黄金片段总览</h3>
        <div className="overview-stats">
          <div className="overview-stat">
            <div className="stat-icon">🎬</div>
            <div className="stat-content">
              <h4>黄金片段数</h4>
              <div className="stat-value">{moneyShots.length}个</div>
              <p>占总时长{DebugHelper.safeToFixed((totalDuration / 570) * 100, 1, 'MoneyShots-coveragePercent')}%</p>
            </div>
          </div>
          
          <div className="overview-stat">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <h4>平均分享潜力</h4>
              <div className="stat-value">{DebugHelper.safeToFixed(avgShareability, 0, 'MoneyShots-avgShareability')}%</div>
              <p>远超行业平均水平</p>
            </div>
          </div>
          
          <div className="overview-stat">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h4>病毒传播指数</h4>
              <div className="stat-value">{DebugHelper.safeToFixed(avgViralPotential, 0, 'MoneyShots-avgViral')}%</div>
              <p>具备强传播潜力</p>
            </div>
          </div>
          
          <div className="overview-stat">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h4>总时长</h4>
              <div className="stat-value">{DebugHelper.safeToFixed(totalDuration / 60, 1, 'MoneyShots-totalMinutes')}分钟</div>
              <p>高价值内容密度</p>
            </div>
          </div>
        </div>
      </div>

      {/* 黄金片段列表 */}
      <div className="money-shots-list">
        <h3 className="section-title">🎯 黄金片段详细分析</h3>
        <div className="shots-grid">
          {moneyShots.map((shot) => {
            const typeInfo = getTypeInfo(shot.type)
            const shareabilityInfo = getShareabilityLevel(shot.shareability)
            
            return (
              <div key={shot.id} className="shot-card">
                <div className="shot-header">
                  <div className="shot-type" style={{ backgroundColor: typeInfo.color }}>
                    <span className="type-icon">{typeInfo.icon}</span>
                    <span className="type-name">{typeInfo.name}</span>
                  </div>
                  <div className="shot-timestamp">{shot.timestamp}</div>
                </div>
                
                <div className="shot-content">
                  <h4 className="shot-title">{shot.title}</h4>
                  <p className="shot-description">{shot.description}</p>
                  
                  <div className="shot-metrics">
                    <div className="metric-item">
                      <span className="metric-label">分享潜力</span>
                      <span 
                        className="metric-value"
                        style={{ color: shareabilityInfo.color }}
                      >
                        {shot.shareability}% ({shareabilityInfo.level})
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">病毒指数</span>
                      <span className="metric-value">{shot.viralPotential}%</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">时长</span>
                      <span className="metric-value">{shot.duration}秒</span>
                    </div>
                  </div>
                  
                  <div className="shot-elements">
                    <h5>关键要素:</h5>
                    <ul>
                      {shot.keyElements.map((element, index) => (
                        <li key={index}>{element}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="shot-performance">
                    <h5>表现数据:</h5>
                    <div className="performance-grid">
                      <div className="performance-item">
                        <span className="perf-label">重播率</span>
                        <span className="perf-value">{shot.metrics.replayRate}%</span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">截图率</span>
                        <span className="perf-value">{shot.metrics.screenshotRate}%</span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">片段分享</span>
                        <span className="perf-value">{shot.metrics.clipShareRate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shot-platforms">
                    <h5>最佳平台:</h5>
                    <div className="platforms-list">
                      {shot.bestPlatforms.map((platform, index) => (
                        <span key={index} className="platform-tag">{platform}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 分享策略建议 */}
      <div className="sharing-strategy">
        <h3 className="section-title">📢 分享策略建议</h3>
        <div className="strategy-grid">
          <div className="strategy-card">
            <div className="strategy-header">
              <span className="strategy-icon">🎬</span>
              <h4>短视频切片</h4>
            </div>
            <div className="strategy-content">
              <p>将"情感爆发"片段(6:33-7:08)制作成独立短视频，配合情感化文案在抖音、快手传播</p>
              <div className="strategy-potential">预期传播: 50万+ 播放量</div>
            </div>
          </div>
          
          <div className="strategy-card">
            <div className="strategy-header">
              <span className="strategy-icon">💬</span>
              <h4>语录卡片</h4>
            </div>
            <div className="strategy-content">
              <p>提取"金句名言"片段制作精美语录卡片，在小红书、微博等图文平台传播</p>
              <div className="strategy-potential">预期传播: 10万+ 转发量</div>
            </div>
          </div>
          
          <div className="strategy-card">
            <div className="strategy-header">
              <span className="strategy-icon">🛠️</span>
              <h4>教程拆解</h4>
            </div>
            <div className="strategy-content">
              <p>将"技巧展示"片段拆解成图文教程，在知乎、B站等知识平台深度传播</p>
              <div className="strategy-potential">预期传播: 5万+ 收藏量</div>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="money-shots-recommendations">
        <h3 className="section-title">💡 黄金片段优化建议</h3>
        <div className="recommendations-list">
          <div className="recommendation-item high">
            <div className="rec-priority">高优先级</div>
            <div className="rec-content">
              <h4>强化情感爆发片段</h4>
              <p>在6:33-7:08的情感高潮部分增加特写镜头和背景音乐，进一步放大情感冲击力</p>
              <div className="expected-improvement">预期提升分享率: +15%</div>
            </div>
          </div>
          
          <div className="recommendation-item medium">
            <div className="rec-priority">中优先级</div>
            <div className="rec-content">
              <h4>优化金句呈现</h4>
              <p>在金句部分增加字幕特效或视觉强调，便于观众截图和分享</p>
              <div className="expected-improvement">预期提升截图率: +20%</div>
            </div>
          </div>
          
          <div className="recommendation-item low">
            <div className="rec-priority">低优先级</div>
            <div className="rec-content">
              <h4>增加分享提示</h4>
              <p>在关键黄金片段后增加温和的分享提示，引导观众主动传播</p>
              <div className="expected-improvement">预期提升分享意愿: +8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoneyShots