import React from 'react'
import { DebugHelper } from '../../utils/debugHelper'

const HerosJourney = ({ analysisResults }) => {
  // 英雄之旅的各个阶段
  const journeyStages = [
    {
      stage: 'ordinary-world',
      name: '平凡世界',
      description: '介绍主角的日常生活和背景',
      timestamp: '0:00 - 0:30',
      present: true,
      effectiveness: 85,
      details: '通过日常场景建立观众代入感，设定清晰的起始状态'
    },
    {
      stage: 'call-to-adventure',
      name: '冒险召唤',
      description: '出现改变现状的机会或挑战',
      timestamp: '0:30 - 1:15',
      present: true,
      effectiveness: 92,
      details: '问题或机遇的提出激发观众好奇心，创造强烈的期待感'
    },
    {
      stage: 'refusal-of-call',
      description: '拒绝召唤',
      name: '犹豫不决',
      timestamp: '1:15 - 1:45',
      present: false,
      effectiveness: 0,
      details: '可以增加短暂的犹豫环节来增强真实感'
    },
    {
      stage: 'meeting-mentor',
      name: '遇见导师',
      description: '获得指导、工具或知识',
      timestamp: '1:45 - 2:30',
      present: true,
      effectiveness: 78,
      details: '专家观点和方法论的介绍增强内容权威性'
    },
    {
      stage: 'crossing-threshold',
      name: '跨越门槛',
      description: '正式开始冒险之旅',
      timestamp: '2:30 - 3:00',
      present: true,
      effectiveness: 88,
      details: '明确的行动开始，观众进入核心内容阶段'
    },
    {
      stage: 'tests-allies-enemies',
      name: '试炼磨难',
      description: '面临挑战、结交盟友、遭遇敌人',
      timestamp: '3:00 - 6:00',
      present: true,
      effectiveness: 90,
      details: '多层次的挑战和解决方案展示，保持观众紧张感'
    },
    {
      stage: 'approach-ordeal',
      name: '濒临绝境',
      description: '面对最大的恐惧或危险',
      timestamp: '6:00 - 7:30',
      present: true,
      effectiveness: 95,
      details: '高潮部分的紧张感和不确定性达到峰值'
    },
    {
      stage: 'reward',
      name: '获得奖赏',
      description: '克服挑战后获得回报',
      timestamp: '7:30 - 8:15',
      present: true,
      effectiveness: 87,
      details: '成果展示和成就感的释放，观众获得满足感'
    },
    {
      stage: 'road-back',
      name: '回归之路',
      description: '带着收获准备回到日常',
      timestamp: '8:15 - 9:00',
      present: true,
      effectiveness: 82,
      details: '总结经验和教训，为观众提供实用价值'
    },
    {
      stage: 'return-transformed',
      name: '蜕变归来',
      description: '以新的身份和智慧回归',
      timestamp: '9:00 - 9:30',
      present: true,
      effectiveness: 80,
      details: '展示转变和成长，给观众以启发和动力'
    }
  ]

  // 计算故事完整度
  const completeness = journeyStages.filter(stage => stage.present).length / journeyStages.length * 100
  const avgEffectiveness = journeyStages
    .filter(stage => stage.present)
    .reduce((sum, stage) => sum + stage.effectiveness, 0) / journeyStages.filter(stage => stage.present).length

  // 故事弧线强度
  const storyArc = [
    { point: '开始', intensity: 20 },
    { point: '召唤', intensity: 40 },
    { point: '跨越', intensity: 60 },
    { point: '试炼', intensity: 80 },
    { point: '绝境', intensity: 95 },
    { point: '奖赏', intensity: 85 },
    { point: '回归', intensity: 70 },
    { point: '蜕变', intensity: 90 }
  ]

  const getStageColor = (present, effectiveness) => {
    if (!present) return '#666'
    if (effectiveness >= 90) return '#DBFC53'
    if (effectiveness >= 80) return '#A8E063'
    if (effectiveness >= 70) return '#FCD34D'
    return '#F59E0B'
  }

  return (
    <div className="heros-journey-container">
      {/* 英雄之旅概览 */}
      <div className="journey-overview">
        <h3 className="section-title">🏔️ 英雄之旅结构分析</h3>
        <div className="journey-stats">
          <div className="journey-stat">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <h4>故事完整度</h4>
              <div className="stat-value">{DebugHelper.safeToFixed(completeness, 0, 'HerosJourney-completeness')}%</div>
              <p>包含了经典英雄之旅的主要元素</p>
            </div>
          </div>
          
          <div className="journey-stat">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h4>平均效果</h4>
              <div className="stat-value">{DebugHelper.safeToFixed(avgEffectiveness, 0, 'HerosJourney-effectiveness')}%</div>
              <p>各阶段的执行质量评分</p>
            </div>
          </div>
          
          <div className="journey-stat">
            <div className="stat-icon">🎭</div>
            <div className="stat-content">
              <h4>叙事强度</h4>
              <div className="stat-value">高</div>
              <p>故事张力和戏剧性表现优秀</p>
            </div>
          </div>
          
          <div className="journey-stat">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h4>观众投入</h4>
              <div className="stat-value">92%</div>
              <p>故事结构有效提升观众参与度</p>
            </div>
          </div>
        </div>
      </div>

      {/* 故事弧线可视化 */}
      <div className="story-arc">
        <h3 className="section-title">📈 故事张力弧线</h3>
        <div className="arc-chart">
          <div className="arc-line">
            {storyArc.map((point, index) => (
              <div key={index} className="arc-point-container">
                <div 
                  className="arc-point"
                  style={{ 
                    bottom: `${point.intensity}%`,
                    backgroundColor: point.intensity >= 85 ? '#DBFC53' : '#A8E063'
                  }}
                >
                  <div className="point-value">{point.intensity}</div>
                </div>
                <div className="point-label">{point.point}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 各阶段详细分析 */}
      <div className="journey-stages">
        <h3 className="section-title">🗺️ 英雄之旅各阶段分析</h3>
        <div className="stages-grid">
          {journeyStages.map((stage, index) => (
            <div 
              key={index} 
              className={`stage-card ${stage.present ? 'present' : 'absent'}`}
            >
              <div className="stage-header">
                <div className="stage-number">{index + 1}</div>
                <div className="stage-info">
                  <h4 className="stage-name">{stage.name}</h4>
                  <div className="stage-timestamp">{stage.timestamp}</div>
                </div>
                <div className="stage-status">
                  {stage.present ? (
                    <div 
                      className="effectiveness-score"
                      style={{ color: getStageColor(stage.present, stage.effectiveness) }}
                    >
                      {stage.effectiveness}%
                    </div>
                  ) : (
                    <div className="missing-indicator">缺失</div>
                  )}
                </div>
              </div>
              
              <p className="stage-description">{stage.description}</p>
              <p className="stage-details">{stage.details}</p>
              
              {stage.present && (
                <div className="stage-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${stage.effectiveness}%`,
                      backgroundColor: getStageColor(stage.present, stage.effectiveness)
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 叙事技巧分析 */}
      <div className="narrative-techniques">
        <h3 className="section-title">🎬 叙事技巧分析</h3>
        <div className="techniques-grid">
          <div className="technique-card">
            <div className="technique-icon">🎭</div>
            <div className="technique-content">
              <h4>角色发展</h4>
              <div className="technique-score">89%</div>
              <p>主角形象鲜明，成长轨迹清晰可见，观众容易产生共鸣</p>
            </div>
          </div>
          
          <div className="technique-card">
            <div className="technique-icon">⚡</div>
            <div className="technique-content">
              <h4>冲突设置</h4>
              <div className="technique-score">92%</div>
              <p>多层次冲突设计巧妙，内外部冲突相互交织，张力十足</p>
            </div>
          </div>
          
          <div className="technique-card">
            <div className="technique-icon">🔄</div>
            <div className="technique-content">
              <h4>节奏控制</h4>
              <div className="technique-score">86%</div>
              <p>故事节奏张弛有度，高潮低潮安排合理，观众不易疲劳</p>
            </div>
          </div>
          
          <div className="technique-card">
            <div className="technique-icon">🎯</div>
            <div className="technique-content">
              <h4>主题呈现</h4>
              <div className="technique-score">84%</div>
              <p>核心主题贯穿始终，通过故事自然传达，避免生硬说教</p>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="journey-recommendations">
        <h3 className="section-title">💡 故事结构优化建议</h3>
        <div className="recommendations-list">
          <div className="recommendation-item high">
            <div className="rec-priority">高优先级</div>
            <div className="rec-content">
              <h4>增加"拒绝召唤"环节</h4>
              <p>在冒险召唤后增加30秒的犹豫片段，展现选择的艰难，增强故事真实感</p>
            </div>
          </div>
          
          <div className="recommendation-item medium">
            <div className="rec-priority">中优先级</div>
            <div className="rec-content">
              <h4>强化导师角色</h4>
              <p>导师的指导作用可以更加突出，增加具体的方法论传授场景</p>
            </div>
          </div>
          
          <div className="recommendation-item low">
            <div className="rec-priority">低优先级</div>
            <div className="rec-content">
              <h4>丰富回归阶段</h4>
              <p>回归之路的反思和总结可以更加深入，增强教育价值</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HerosJourney