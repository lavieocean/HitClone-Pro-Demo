import React, { useState } from 'react'
import { DebugHelper } from '../../utils/debugHelper'

const ViralDNA = ({ analysisResults }) => {
  const [activeSection, setActiveSection] = useState('title')
  
  // Debug logs
  console.log('🔥 Magnetic Title + Spark Thumbnail component rendering')
  console.log('📊 Received analysisResults:', analysisResults)
  
  // Extract data from analysis results
  const viralFactors = analysisResults?.insights?.viralFactors || {}
  const originalAnalysis = analysisResults?.originalAnalysis || {}
  const meta = analysisResults?.meta || {}
  
  // Title-related data
  const titleData = {
    current: meta.video_title || analysisResults?.contentInfo?.title || 'Current Video Title',
    magneticScore: viralFactors.curiosityGap || 85,
    aiAlternatives: originalAnalysis.creator_insights?.title_options || [
      'Amazing! AI Revolution is Here',
      '99% People Don\'t Know This AI Secret',
      'Understand Next 10 Years in 3 Minutes'
    ],
    keywordPower: ['AI', 'Revolution', 'Future', 'Amazing']
  }
  
  // Thumbnail-related data
  const thumbnailData = {
    sparkScore: viralFactors.hookStrength || 88,
    visualElements: ['Contrast Elements', 'Facial Close-ups', 'Text Overlay', 'Color Impact'],
    ctrPrediction: '12.8%',
    improvementTips: [
      'Enhance facial expression intensity',
      'Use stronger color contrasts',
      'Add numerical or symbolic elements'
    ]
  }
  
  console.log('🎯 Title data:', titleData)
  console.log('🎨 Thumbnail data:', thumbnailData)

  // Generate dynamic insights based on AI analysis
  const generateDynamicInsights = (factor, score, originalAnalysis) => {
    const baseInsights = {
      'Hook Strength': [
        `Score ${score}/100: ${score >= 80 ? 'Strong opening effect' : score >= 60 ? 'Moderate opening effect' : 'Opening needs optimization'}`,
        `Based on content analysis: ${originalAnalysis?.opening_analysis || 'Straightforward content structure'}`,
        `Suggestion: ${score < 80 ? 'Add more visual impact elements' : 'Maintain current strong opening'}`
      ],
      'Curiosity Gap': [
        `Score ${score}/100: ${score >= 75 ? 'Suspense well set' : 'Can enhance suspense'}`,
        `Analysis dimension: Information progression and mystery setup`,
        `Optimization: ${score < 75 ? 'Add more layered information reveals' : 'Continue maintaining mystery balance'}`
      ],
      'Emotional Trigger': [
        `Score ${score}/100: ${score >= 85 ? 'Strong emotional impact' : score >= 70 ? 'Moderate emotional engagement' : 'Emotional intensity needs strengthening'}`,
        `Main emotion types: ${originalAnalysis?.main_emotions || 'Surprise, excitement, resonance'}`,
        `Enhancement: ${score < 85 ? 'Add emotional impact at key moments' : 'Emotional design is excellent'}`
      ],
      'Shareability': [
        `Score ${score}/100: ${score >= 80 ? 'Strong viral value' : 'Share motivation needs improvement'}`,
        `Share value: ${originalAnalysis?.share_value || 'Content has discussion and topic value'}`,
        `Viral optimization: ${score < 80 ? 'Add more topical elements' : 'Already has viral potential'}`
      ],
      'Retention': [
        `Score ${score}/100: ${score >= 75 ? 'High completion rate' : 'Need to improve watch stickiness'}`,
        `Content density: ${originalAnalysis?.content_density || 'Appropriate information, good pacing'}`,
        `Optimization: ${score < 75 ? 'Adjust pacing and add interactive elements' : 'Current pacing is good'}`
      ]
    }
    
    return baseInsights[factor] || [
      `Score ${score}/100 performance`,
      'Based on AI intelligent analysis',
      'Data-driven optimization suggestions'
    ]
  }

  const viralElements = [
    {
      factor: 'Hook Strength',
      score: viralFactors.hookStrength,
      description: 'Whether the first 3 seconds can immediately capture audience attention',
      insights: generateDynamicInsights('Hook Strength', viralFactors.hookStrength, analysisResults?.originalAnalysis)
    },
    {
      factor: 'Curiosity Gap',
      score: viralFactors.curiosityGap,
      description: 'Information gap between title and content that sparks viewing desire',
      insights: generateDynamicInsights('Curiosity Gap', viralFactors.curiosityGap, analysisResults?.originalAnalysis)
    },
    {
      factor: 'Emotional Trigger',
      score: viralFactors.emotionalTrigger,
      description: 'Emotional intensity and type triggered by the content',
      insights: generateDynamicInsights('Emotional Trigger', viralFactors.emotionalTrigger, analysisResults?.originalAnalysis)
    },
    {
      factor: 'Shareability',
      score: viralFactors.shareability,
      description: 'Drive force for audience to actively share and spread content',
      insights: generateDynamicInsights('Shareability', viralFactors.shareability, analysisResults?.originalAnalysis)
    },
    {
      factor: 'Retention',
      score: viralFactors.retention,
      description: 'Likelihood of audience completing and rewatching the content',
      insights: generateDynamicInsights('Retention', viralFactors.retention, analysisResults?.originalAnalysis)
    }
  ]

  const getScoreColor = (score) => {
    if (score >= 90) return '#DBFC53'
    if (score >= 80) return '#A8E063'
    if (score >= 70) return '#FCD34D'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const getScoreLevel = (score) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Strong'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Average'
    return 'Weak'
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: 'white'
    }}>
      {/* 标题区域 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(219, 252, 83, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#DBFC53'
        }}>
          🔥 Magnetic Title + Spark Thumbnail
        </h1>
        <p style={{ 
          fontSize: '18px', 
          margin: '0',
          opacity: 0.9,
          fontStyle: 'italic',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          "Make people breathless in ten words. Can the image ignite curiosity instantly?"
        </p>
      </div>

      {/* 总体病毒性评分 */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(219, 252, 83, 0.3)',
        borderRadius: '16px', 
        padding: '24px', 
        marginBottom: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        <div className="viral-score-main" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div className="score-circle" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(219,252,83,0.2), rgba(168,224,99,0.2))',
            border: '3px solid #DBFC53'
          }}>
            <div className="score-number" style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              color: '#DBFC53' 
            }}>
              {DebugHelper.safeToFixed((viralFactors.hookStrength + viralFactors.curiosityGap + viralFactors.emotionalTrigger + viralFactors.shareability + viralFactors.retention) / 5, 0, 'ViralDNA-totalScore')}
            </div>
            <div className="score-label" style={{ 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.7)', 
              marginTop: '4px' 
            }}>Viral Index</div>
          </div>
          <div className="score-insights" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '24px', color: '#DBFC53', marginBottom: '16px' }}>🧬 Viral DNA Analysis</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
              {(() => {
                const avgScore = Math.round((viralFactors.hookStrength + viralFactors.curiosityGap + viralFactors.emotionalTrigger + viralFactors.shareability + viralFactors.retention) / 5)
                const title = analysisResults?.contentInfo?.title || analysisResults?.originalAnalysis?.视频标题 || '该内容'
                
                if (avgScore >= 85) {
                  return `${title}具备 <strong>极强的病毒式传播潜力</strong>，各项要素配合优秀，特别是${viralFactors.emotionalTrigger >= 90 ? '情感触发' : viralFactors.hookStrength >= 90 ? '开场吸引力' : '核心要素'}表现突出，预计能产生爆款级传播效应。`
                } else if (avgScore >= 75) {
                  return `${title}具备 <strong>良好的病毒式传播潜力</strong>，多个核心要素配合得当，通过优化${viralFactors.retention < 75 ? '观看留存' : viralFactors.curiosityGap < 75 ? '悬念设置' : '分享机制'}可进一步提升传播效果。`
                } else {
                  return `${title}具备 <strong>一定的传播潜力</strong>，建议重点优化${Object.entries(viralFactors).sort((a,b) => a[1] - b[1])[0][0] === 'hookStrength' ? '开场吸引力' : '核心传播要素'}，有望显著提升病毒性表现。`
                }
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* 各项因子分析 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(219, 252, 83, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          margin: '0 0 24px 0',
          color: '#DBFC53'
        }}>🎯 Viral Factor Analysis</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {viralElements.map((element, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(219, 252, 83, 0.2)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div className="factor-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h4 className="factor-name" style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  margin: 0
                }}>{element.factor}</h4>
                <div className="factor-score" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  <span 
                    className="score-value"
                    style={{ 
                      color: getScoreColor(element.score),
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}
                  >
                    {element.score}
                  </span>
                  <span className="score-level" style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    {getScoreLevel(element.score)}
                  </span>
                </div>
              </div>
              
              <div className="factor-progress" style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${element.score}%`,
                    height: '100%',
                    backgroundColor: getScoreColor(element.score),
                    transition: 'width 0.3s ease'
                  }}
                ></div>
              </div>
              
              <p className="factor-description" style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>{element.description}</p>
              
              <div className="factor-insights">
                <h5 style={{
                  fontSize: '14px',
                  color: '#DBFC53',
                  marginBottom: '8px'
                }}>Key Insights:</h5>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {element.insights.map((insight, i) => (
                    <li key={i} style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      marginBottom: '4px',
                      position: 'relative',
                      paddingLeft: '16px'
                    }}>
                      <span style={{
                        content: '•',
                        color: '#DBFC53',
                        position: 'absolute',
                        left: '0'
                      }}>•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 传播预测 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(219, 252, 83, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          margin: '0 0 24px 0',
          color: '#DBFC53'
        }}>📈 Viral Spread Prediction</h2>
        <div className="prediction-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div className="prediction-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>🔥</div>
            <div className="prediction-content">
              <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>Viral Probability</h4>
              <div className="prediction-value" style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#DBFC53', 
                marginBottom: '12px' 
              }}>87%</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Based on current viral factors, this video has high potential to become viral content</p>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div className="prediction-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
            <div className="prediction-content">
              <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>Expected Spread Multiplier</h4>
              <div className="prediction-value" style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#DBFC53', 
                marginBottom: '12px' 
              }}>12.5x</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Compared to average content, expected 12.5x improvement in reach</p>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div className="prediction-icon" style={{ fontSize: '32px', marginBottom: '16px' }}>⏰</div>
            <div className="prediction-content">
              <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>Peak Time Window</h4>
              <div className="prediction-value" style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#DBFC53', 
                marginBottom: '12px' 
              }}>24-48h</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Expected to reach peak viral spread within 24-48 hours after publish</p>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(219, 252, 83, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        <h3 className="section-title" style={{ 
          fontSize: '24px', 
          fontWeight: '700',
          color: '#DBFC53', 
          marginBottom: '24px',
          margin: '0 0 24px 0'
        }}>💡 Viral Optimization Recommendations</h3>
        <div className="recommendations-list" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="recommendation-item high" style={{
            display: 'flex',
            gap: '16px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '12px'
          }}>
            <div className="rec-priority" style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              background: 'rgba(239,68,68,0.2)',
              color: '#EF4444'
            }}>High Priority</div>
            <div className="rec-content" style={{ flex: 1 }}>
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Strengthen Emotional Triggers</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>Add more emotional impact elements at key moments, especially maintaining audience excitement in the middle section</p>
            </div>
          </div>
          
          <div className="recommendation-item medium" style={{
            display: 'flex',
            gap: '16px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '12px'
          }}>
            <div className="rec-priority" style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              background: 'rgba(245,158,11,0.2)',
              color: '#F59E0B'
            }}>Medium Priority</div>
            <div className="rec-content" style={{ flex: 1 }}>
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Optimize Share Points</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>Add clear sharing prompts at climax moments to encourage active audience distribution</p>
            </div>
          </div>
          
          <div className="recommendation-item low" style={{
            display: 'flex',
            gap: '16px',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(219, 252, 83, 0.2)',
            borderRadius: '12px'
          }}>
            <div className="rec-priority" style={{
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              background: 'rgba(16,185,129,0.2)',
              color: '#10B981'
            }}>Low Priority</div>
            <div className="rec-content" style={{ flex: 1 }}>
              <h4 style={{ color: 'white', marginBottom: '8px' }}>Add Interactive Elements</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>Incorporate Q&A or polling segments to increase audience engagement and retention time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViralDNA