import React from 'react'

const ContentMatrix = ({ data, metadata }) => {
  console.log('🎨 Content Matrix data:', data)

  if (!data) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>Content Matrix Loading...</h3>
        <p>Analyzing content positioning</p>
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
          🎨
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            color: 'white'
          }}>
            Content Matrix
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0
          }}>
            Topic Vertical vs Story Strength Analysis
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
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔬</div>
        <h3 style={{ color: 'white', marginBottom: '12px' }}>Advanced Analytics Coming Soon</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
          2D scatter plot visualization showing content positioning
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          fontSize: '14px'
        }}>
          <div>• X-axis: Topic Vertical Depth</div>
          <div>• Y-axis: Story Strength Score</div>
          <div>• Size: Video Performance</div>
          <div>• Color: Content Category</div>
        </div>
      </div>
    </div>
  )
}

export default ContentMatrix