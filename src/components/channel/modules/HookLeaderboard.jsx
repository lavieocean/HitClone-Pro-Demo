import React from 'react'

const HookLeaderboard = ({ data, metadata }) => {
  console.log('🎣 Hook Leaderboard data:', data)

  if (!data) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎣</div>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>Hook Leaderboard Loading...</h3>
        <p>Ranking opening moments</p>
      </div>
    )
  }

  const { topHooks, insights, bestPractices } = data

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
          🎣
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            color: 'white'
          }}>
            Hook Leaderboard
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0
          }}>
            Top 5 Opening Moments Ranked by Impact
          </p>
        </div>
      </div>

      {/* Top 5 钩子排行榜 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#DBFC53',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🏆</span>
          Top Opening Hooks
        </h3>

        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {topHooks && topHooks.length > 0 ? topHooks.map((hook, index) => {
            const isTopThree = index < 3
            const medalEmojis = ['🥇', '🥈', '🥉']
            
            return (
              <div 
                key={hook.videoId || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: isTopThree ? 'linear-gradient(135deg, rgba(219, 252, 83, 0.1) 0%, rgba(219, 252, 83, 0.05) 100%)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  border: isTopThree ? '1px solid rgba(219, 252, 83, 0.2)' : '1px solid rgba(255,255,255,0.05)'
                }}
              >
                {/* 排名图标 */}
                <div style={{
                  fontSize: '24px',
                  minWidth: '32px',
                  textAlign: 'center'
                }}>
                  {isTopThree ? medalEmojis[index] : `#${index + 1}`}
                </div>

                {/* 钩子信息 */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '4px',
                    lineHeight: '1.4'
                  }}>
                    {hook.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '6px'
                  }}>
                    {hook.hookType} • {hook.duration}
                  </div>
                  {hook.transcript && (
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.6)',
                      fontStyle: 'italic',
                      padding: '6px 8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      maxWidth: '300px'
                    }}>
                      "{hook.transcript}"
                    </div>
                  )}
                </div>

                {/* 分数 */}
                <div style={{
                  textAlign: 'center',
                  minWidth: '60px'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: isTopThree ? '#DBFC53' : '#10B981'
                  }}>
                    {hook.hookScore}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.6)'
                  }}>
                    SCORE
                  </div>
                </div>
              </div>
            )
          }) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎭</div>
              <p>No hook data available. Analyze more videos to see hook rankings.</p>
            </div>
          )}
        </div>
      </div>

      {/* 洞察和最佳实践 */}
      {(insights?.length > 0 || bestPractices?.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {/* 洞察 */}
          {insights?.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#10B981',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>💡</span>
                Hook Insights
              </h4>
              <div style={{
                display: 'grid',
                gap: '8px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)'
              }}>
                {insights.map((insight, index) => (
                  <div key={index}>• {insight}</div>
                ))}
              </div>
            </div>
          )}

          {/* 最佳实践 */}
          {bestPractices?.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#DBFC53',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>⭐</span>
                Best Practices
              </h4>
              <div style={{
                display: 'grid',
                gap: '8px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.8)'
              }}>
                {bestPractices.map((practice, index) => (
                  <div key={index}>• {practice}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HookLeaderboard