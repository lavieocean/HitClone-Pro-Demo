import React from 'react'
import { DebugHelper } from '../../utils/debugHelper'

const WatchTimeHacks = ({ analysisResults }) => {
  // 观看时长技巧数据
  const retentionHacks = [
    {
      technique: 'hook-technique',
      name: '黄金开场钩子',
      description: '前15秒的强力吸引技巧',
      effectiveness: 94,
      usage: 'present',
      examples: [
        '开场直接展示最震撼的画面',
        '提出悬念问题激发好奇心',
        '使用倒计时或紧迫感元素'
      ],
      impact: '+28% 前30秒留存'
    },
    {
      technique: 'pattern-interrupt',
      name: '模式中断',
      description: '打破观众预期的突然转折',
      effectiveness: 87,
      usage: 'present',
      examples: [
        '在2:30处突然改变叙述视角',
        '意外的情节转折或反转',
        '节奏突然加快或放慢'
      ],
      impact: '+15% 中段留存'
    },
    {
      technique: 'curiosity-loops',
      name: '好奇心循环',
      description: '持续制造悬念和期待',
      effectiveness: 91,
      usage: 'present',
      examples: [
        '预告后续精彩内容',
        '分层揭示核心信息',
        '设置多个未解之谜'
      ],
      impact: '+22% 整体完播率'
    },
    {
      technique: 'social-proof',
      name: '社会认同',
      description: '展示他人的参与和认可',
      effectiveness: 78,
      usage: 'partial',
      examples: [
        '展示评论区热烈讨论',
        '引用权威人士观点',
        '展示用户生成内容'
      ],
      impact: '+12% 分享意愿'
    },
    {
      technique: 'cliffhangers',
      name: '悬崖峭壁',
      description: '在关键时刻暂停或转场',
      effectiveness: 89,
      usage: 'present',
      examples: [
        '答案揭晓前突然暂停',
        '关键画面出现时切换视角',
        '使用"但是"转折词制造悬念'
      ],
      impact: '+25% 跨段留存'
    },
    {
      technique: 'value-stacking',
      name: '价值堆叠',
      description: '持续提供新的价值点',
      effectiveness: 85,
      usage: 'present',
      examples: [
        '每分钟至少一个新洞察',
        '层层递进的信息披露',
        '意外的额外价值提供'
      ],
      impact: '+18% 观看深度'
    },
    {
      technique: 'visual-variety',
      name: '视觉变化',
      description: '保持画面新鲜感和吸引力',
      effectiveness: 82,
      usage: 'present',
      examples: [
        '每8-12秒切换画面',
        '多角度拍摄混合剪辑',
        '图表、动画穿插使用'
      ],
      impact: '+14% 视觉留存'
    },
    {
      technique: 'emotional-peaks',
      name: '情感高峰',
      description: '创造强烈的情感体验',
      effectiveness: 93,
      usage: 'present',
      examples: [
        '在高潮部分加强音效',
        '使用特写镜头强化情感',
        '通过音乐调动观众情绪'
      ],
      impact: '+31% 情感投入'
    }
  ]

  // 留存率数据
  const retentionData = [
    { timepoint: '0%', retention: 100, benchmark: 100 },
    { timepoint: '10%', retention: 89, benchmark: 82 },
    { timepoint: '25%', retention: 78, benchmark: 68 },
    { timepoint: '50%', retention: 71, benchmark: 52 },
    { timepoint: '75%', retention: 65, benchmark: 38 },
    { timepoint: '90%', retention: 58, benchmark: 28 },
    { timepoint: '100%', retention: 52, benchmark: 22 }
  ]

  const getEffectivenessColor = (score) => {
    if (score >= 90) return '#DBFC53'
    if (score >= 80) return '#A8E063'
    if (score >= 70) return '#FCD34D'
    return '#F59E0B'
  }

  const getUsageStatus = (usage) => {
    switch (usage) {
      case 'present': return { text: '已使用', color: '#10B981' }
      case 'partial': return { text: '部分使用', color: '#F59E0B' }
      case 'absent': return { text: '未使用', color: '#EF4444' }
      default: return { text: '未知', color: '#666' }
    }
  }

  // 计算整体留存表现
  const avgRetention = retentionData.reduce((sum, point) => sum + point.retention, 0) / retentionData.length
  const avgBenchmark = retentionData.reduce((sum, point) => sum + point.benchmark, 0) / retentionData.length
  const improvement = avgRetention - avgBenchmark

  return (
    <div className="watch-time-hacks-container">
      {/* 留存概览 */}
      <div className="retention-overview">
        <h3 className="section-title">⏱️ 观看时长优化分析</h3>
        <div className="retention-stats">
          <div className="retention-stat">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>平均留存率</h4>
              <div className="stat-value">{DebugHelper.safeToFixed(avgRetention, 1, 'WatchTimeHacks-avgRetention')}%</div>
              <p>远超同类视频平均水平</p>
            </div>
          </div>
          
          <div className="retention-stat">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h4>相对提升</h4>
              <div className="stat-value">+{DebugHelper.safeToFixed(improvement, 1, 'WatchTimeHacks-improvement')}%</div>
              <p>比行业基准线高出显著</p>
            </div>
          </div>
          
          <div className="retention-stat">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h4>完播率</h4>
              <div className="stat-value">52%</div>
              <p>优秀的内容质量表现</p>
            </div>
          </div>
          
          <div className="retention-stat">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h4>技巧运用</h4>
              <div className="stat-value">7/8</div>
              <p>几乎使用了所有关键技巧</p>
            </div>
          </div>
        </div>
      </div>

      {/* 留存曲线对比 */}
      <div className="retention-curve">
        <h3 className="section-title">📉 留存曲线对比分析</h3>
        <div className="curve-chart">
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color current"></div>
              <span>当前视频</span>
            </div>
            <div className="legend-item">
              <div className="legend-color benchmark"></div>
              <span>行业基准</span>
            </div>
          </div>
          <div className="retention-points">
            {retentionData.map((point, index) => (
              <div key={index} className="retention-point-group">
                <div className="timepoint-label">{point.timepoint}</div>
                <div className="retention-bars">
                  <div 
                    className="retention-bar current"
                    style={{ height: `${point.retention}%` }}
                  >
                    <div className="bar-value">{point.retention}%</div>
                  </div>
                  <div 
                    className="retention-bar benchmark"
                    style={{ height: `${point.benchmark}%` }}
                  >
                    <div className="bar-value">{point.benchmark}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 技巧详细分析 */}
      <div className="hacks-analysis">
        <h3 className="section-title">🛠️ 观看时长技巧详解</h3>
        <div className="hacks-grid">
          {retentionHacks.map((hack, index) => (
            <div key={index} className="hack-card">
              <div className="hack-header">
                <div className="hack-info">
                  <h4 className="hack-name">{hack.name}</h4>
                  <p className="hack-description">{hack.description}</p>
                </div>
                <div className="hack-metrics">
                  <div 
                    className="effectiveness-score"
                    style={{ color: getEffectivenessColor(hack.effectiveness) }}
                  >
                    {hack.effectiveness}%
                  </div>
                  <div 
                    className="usage-status"
                    style={{ color: getUsageStatus(hack.usage).color }}
                  >
                    {getUsageStatus(hack.usage).text}
                  </div>
                </div>
              </div>
              
              <div className="hack-examples">
                <h5>具体应用:</h5>
                <ul>
                  {hack.examples.map((example, i) => (
                    <li key={i}>{example}</li>
                  ))}
                </ul>
              </div>
              
              <div className="hack-impact">
                <span className="impact-label">效果:</span>
                <span className="impact-value">{hack.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 关键时刻分析 */}
      <div className="critical-moments">
        <h3 className="section-title">🔍 关键留存时刻</h3>
        <div className="moments-timeline">
          <div className="moment-item critical">
            <div className="moment-time">0:00-0:15</div>
            <div className="moment-content">
              <h4>黄金开场</h4>
              <p>开场15秒决定89%的留存率，使用强视觉冲击+核心问题提出</p>
              <div className="moment-score">表现: 优秀 (94%)</div>
            </div>
          </div>
          
          <div className="moment-item important">
            <div className="moment-time">2:30-2:45</div>
            <div className="moment-content">
              <h4>中段危机</h4>
              <p>观众注意力开始分散的危险时刻，通过模式中断技巧成功挽回</p>
              <div className="moment-score">表现: 良好 (87%)</div>
            </div>
          </div>
          
          <div className="moment-item normal">
            <div className="moment-time">6:00-6:30</div>
            <div className="moment-content">
              <h4>高潮预警</h4>
              <p>情感峰值前的蓄力阶段，悬念设置效果显著</p>
              <div className="moment-score">表现: 优秀 (91%)</div>
            </div>
          </div>
          
          <div className="moment-item critical">
            <div className="moment-time">8:00-9:00</div>
            <div className="moment-content">
              <h4>收尾挑战</h4>
              <p>结尾阶段的留存挑战，价值堆叠技巧维持观众兴趣</p>
              <div className="moment-score">表现: 良好 (85%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="hacks-recommendations">
        <h3 className="section-title">💡 观看时长优化建议</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card high">
            <div className="rec-header">
              <span className="rec-icon">🚀</span>
              <div className="rec-priority">高优先级</div>
            </div>
            <h4>加强社会认同元素</h4>
            <p>在3-4个关键节点增加评论截图或用户反馈，提升可信度和参与感</p>
            <div className="expected-improvement">预期提升: +8% 整体留存</div>
          </div>
          
          <div className="recommendation-card medium">
            <div className="rec-header">
              <span className="rec-icon">🎬</span>
              <div className="rec-priority">中优先级</div>
            </div>
            <h4>优化视觉节奏</h4>
            <p>在6-8分钟段增加画面切换频率，避免视觉疲劳导致的流失</p>
            <div className="expected-improvement">预期提升: +5% 后段留存</div>
          </div>
          
          <div className="recommendation-card low">
            <div className="rec-header">
              <span className="rec-icon">💫</span>
              <div className="rec-priority">低优先级</div>
            </div>
            <h4>增加互动提示</h4>
            <p>在关键信息点增加"点赞支持"等轻度互动提示，提升参与度</p>
            <div className="expected-improvement">预期提升: +3% 互动率</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchTimeHacks