import React from 'react'

const MoneyStack = ({ data, metadata }) => {
  console.log('💰 Money Stack data:', data)

  if (!data) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>Money Stack Loading...</h3>
        <p>Calculating revenue analysis</p>
      </div>
    )
  }

  const { totalRevenue, revenueBreakdown, monthlyProjection, insights } = data

  const formatRevenue = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  const getRevenuePercentage = (amount) => {
    return totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0
  }

  const revenueStreams = [
    {
      name: 'Advertising',
      amount: revenueBreakdown.advertising,
      icon: '📺',
      color: '#10B981',
      description: 'YouTube ad revenue'
    },
    {
      name: 'Sponsorship',
      amount: revenueBreakdown.sponsorship,
      icon: '🤝',
      color: '#DBFC53',
      description: 'Brand partnerships'
    },
    {
      name: 'Merchandise',
      amount: revenueBreakdown.merchandise,
      icon: '🛍️',
      color: '#3B82F6',
      description: 'Product sales'
    }
  ]

  const maxAmount = Math.max(...revenueStreams.map(stream => stream.amount))

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
          💰
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            color: 'white'
          }}>
            Money Stack
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0
          }}>
            Revenue Analysis & Monetization Insights
          </p>
        </div>
      </div>

      {/* 总收益概览 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* 总收益 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            TOTAL REVENUE
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#10B981',
            marginBottom: '8px'
          }}>
            {formatRevenue(totalRevenue)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            From {metadata?.videoCount || 0} videos
          </div>
        </div>

        {/* 月度预估 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(219, 252, 83, 0.1) 0%, rgba(219, 252, 83, 0.05) 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(219, 252, 83, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            MONTHLY PROJECTION
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#DBFC53',
            marginBottom: '8px'
          }}>
            {formatRevenue(monthlyProjection)}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            Per video average
          </div>
        </div>

        {/* 最高收益流 */}
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
            TOP REVENUE STREAM
          </div>
          <div style={{
            fontSize: '24px',
            marginBottom: '8px'
          }}>
            {revenueStreams.find(s => s.amount === maxAmount)?.icon || '📺'}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'white',
            fontWeight: '600'
          }}>
            {revenueStreams.find(s => s.amount === maxAmount)?.name || 'Advertising'}
          </div>
        </div>
      </div>

      {/* 收益流分解条形图 */}
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
          <span>📊</span>
          Revenue Breakdown
        </h3>

        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {revenueStreams.map((stream, index) => {
            const percentage = getRevenuePercentage(stream.amount)
            const width = totalRevenue > 0 ? Math.max((stream.amount / totalRevenue) * 100, 2) : 0

            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                {/* 图标和名称 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '120px'
                }}>
                  <span style={{ fontSize: '18px' }}>{stream.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'white'
                    }}>
                      {stream.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      {stream.description}
                    </div>
                  </div>
                </div>

                {/* 进度条 */}
                <div style={{
                  flex: 1,
                  height: '24px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${width}%`,
                    height: '100%',
                    background: stream.color,
                    borderRadius: '12px',
                    transition: 'width 1s ease'
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '8px',
                    transform: 'translateY(-50%)',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: width > 20 ? 'white' : stream.color
                  }}>
                    {percentage}%
                  </div>
                </div>

                {/* 金额 */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: stream.color,
                  minWidth: '80px',
                  textAlign: 'right'
                }}>
                  {formatRevenue(stream.amount)}
                </div>
              </div>
            )
          })}
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
          Monetization Insights
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
                {insight.includes('💰') ? '💰' :
                 insight.includes('💡') ? '💡' :
                 insight.includes('📊') ? '📊' : '💎'}
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

        {/* 收益优化建议 */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(219, 252, 83, 0.05) 100%)',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.1)'
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
            <span>🚀</span>
            Revenue Optimization Opportunities
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            fontSize: '13px'
          }}>
            {revenueBreakdown.advertising < revenueBreakdown.sponsorship && (
              <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                • Focus on increasing ad revenue through better retention
              </div>
            )}
            
            {revenueBreakdown.sponsorship === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                • Explore sponsorship opportunities with brands
              </div>
            )}
            
            {revenueBreakdown.merchandise === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                • Consider launching merchandise or digital products
              </div>
            )}

            {monthlyProjection < 500 && (
              <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                • Increase upload frequency to boost monthly revenue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoneyStack