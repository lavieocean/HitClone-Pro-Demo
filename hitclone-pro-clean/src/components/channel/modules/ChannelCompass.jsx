import React from 'react'

const ChannelCompass = ({ data, metadata }) => {
  console.log('🧭 Channel Compass data:', data)

  if (!data) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧭</div>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>Channel Compass Loading...</h3>
        <p>Aggregating channel overview data</p>
      </div>
    )
  }

  const { heroKPIs, insights } = data
  const { avgViralScore, avgWatchRate, velocityTrend } = heroKPIs

  const getScoreColor = (score) => {
    if (score >= 85) return '#10B981' // Green
    if (score >= 70) return '#DBFC53' // Yellow-green
    if (score >= 60) return '#F59E0B' // Orange
    return '#EF4444' // Red
  }

  const getTrendIcon = (trend) => {
    switch(trend?.direction) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend) => {
    switch(trend?.direction) {
      case 'up': return '#10B981'
      case 'down': return '#EF4444'
      default: return '#6B7280'
    }
  }

  return (
    <div style={{
      padding: '24px',
      color: 'white'
    }}>
      {/* 模块标题 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          fontSize: '24px',
          marginRight: '12px'
        }}>
          🧭
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            color: 'white'
          }}>
            Channel Compass
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0
          }}>
            Overview KPIs & Channel Health Assessment
          </p>
        </div>
      </div>

      {/* Hero KPIs 卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* 平均爆款分数 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            AVG VIRAL SCORE
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: getScoreColor(avgViralScore),
            marginBottom: '8px'
          }}>
            {avgViralScore}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            {avgViralScore >= 85 ? 'Excellent' : 
             avgViralScore >= 70 ? 'Good' : 
             avgViralScore >= 60 ? 'Average' : 'Needs Work'}
          </div>
        </div>

        {/* 平均观看率 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            AVG WATCH RATE
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: getScoreColor(avgWatchRate * 1.2), // 稍微调整颜色映射
            marginBottom: '8px'
          }}>
            {avgWatchRate}%
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            {avgWatchRate >= 75 ? 'Excellent' : 
             avgWatchRate >= 60 ? 'Good' : 
             avgWatchRate >= 45 ? 'Average' : 'Low'}
          </div>
        </div>

        {/* 30天速度趋势 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            30-DAY VELOCITY
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '24px'
            }}>
              {getTrendIcon(velocityTrend)}
            </span>
            <span style={{
              fontSize: '36px',
              fontWeight: '700',
              color: getTrendColor(velocityTrend)
            }}>
              {Math.abs(velocityTrend?.percentage || 0)}%
            </span>
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            {velocityTrend?.direction === 'up' ? 'Growing' :
             velocityTrend?.direction === 'down' ? 'Declining' : 'Stable'}
          </div>
        </div>
      </div>

      {/* 洞察和建议 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#DBFC53',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>💡</span>
          Channel Health Insights
        </h3>
        
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {insights.map((insight, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{
                fontSize: '16px',
                marginTop: '2px'
              }}>
                {insight.includes('🔥') ? '🔥' :
                 insight.includes('⚠️') ? '⚠️' :
                 insight.includes('📈') ? '📈' :
                 insight.includes('📉') ? '📉' :
                 insight.includes('👀') ? '👀' : '💡'}
              </div>
              <div style={{
                flex: 1,
                fontSize: '14px',
                lineHeight: '1.5',
                color: 'rgba(255,255,255,0.9)'
              }}>
                {insight}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 元数据信息 */}
      {metadata && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            <div>
              <span style={{ fontWeight: '600' }}>Analysis Date:</span>
              <br />
              {new Date(metadata.analysisDate).toLocaleString()}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Videos Analyzed:</span>
              <br />
              {metadata.videoCount}
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Data Quality:</span>
              <br />
              <span style={{ 
                color: (metadata.dataQualityScore || 85) >= 80 ? '#10B981' : 
                       (metadata.dataQualityScore || 85) >= 60 ? '#F59E0B' : '#EF4444'
              }}>
                {metadata.dataQualityScore || 85}%
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '600' }}>Auto Data Ratio:</span>
              <br />
              <span style={{ 
                color: (metadata.autoDataRatio || 0.8) >= 0.7 ? '#10B981' : 
                       (metadata.autoDataRatio || 0.8) >= 0.4 ? '#F59E0B' : '#EF4444'
              }}>
                {Math.round((metadata.autoDataRatio || 0.8) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChannelCompass