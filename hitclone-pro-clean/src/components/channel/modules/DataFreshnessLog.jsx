import React from 'react'

const DataFreshnessLog = ({ data, metadata }) => {
  console.log('📊 DataFreshnessLog data:', data)

  const moduleInfo = {
    ThumbnailHall: { icon: '🖼️', title: 'Thumbnail Hall of Fame/Shame', desc: 'Visual Impact Analysis' },
    AudiencePulse: { icon: '👥', title: 'Audience Pulse Cloud', desc: 'Viewer Sentiment & Interests' },
    RetentionHeatmap: { icon: '🔥', title: 'Retention Heatmap', desc: '60-Second Drop-off Patterns' },
    ShortsMining: { icon: '📱', title: 'Shorts Mining Map', desc: 'Clip Opportunities & Potential' },
    DataFreshnessLog: { icon: '📅', title: 'Data Freshness Log', desc: 'Data Quality & Sources' }
  }

  const info = moduleInfo['DataFreshnessLog'] || { icon: '📊', title: 'DataFreshnessLog', desc: 'Analysis Module' }

  if (!data) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{info.icon}</div>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>{info.title} Loading...</h3>
        <p>Preparing analysis data</p>
      </div>
    )
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
          {info.icon}
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            color: 'white'
          }}>
            {info.title}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0
          }}>
            {info.desc}
          </p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '40px',
        border: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
        <h3 style={{ color: 'white', marginBottom: '12px' }}>Module Under Development</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
          Advanced {info.title.toLowerCase()} analysis coming soon
        </p>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          Data structure: {JSON.stringify(Object.keys(data || {}), null, 2)}
        </div>
      </div>
    </div>
  )
}

export default DataFreshnessLog
