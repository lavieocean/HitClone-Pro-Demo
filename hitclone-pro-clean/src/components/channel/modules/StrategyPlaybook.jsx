import React, { useState } from 'react'

const StrategyPlaybook = ({ data, metadata }) => {
  console.log('📋 Strategy Playbook data:', data)
  
  const [activeSection, setActiveSection] = useState('matrix')

  if (!data) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ color: 'white', marginBottom: '8px' }}>Strategy Playbook Loading...</h3>
        <p>Generating actionable recommendations</p>
      </div>
    )
  }

  const { actionMatrix, prioritizedActions, weeklyContentPlan } = data

  const sections = [
    { id: 'matrix', name: 'Action Matrix', icon: '📊' },
    { id: 'priorities', name: 'Priority Actions', icon: '🎯' },
    { id: 'weekly', name: 'Weekly Plan', icon: '📅' }
  ]

  const actionCategories = [
    {
      key: 'contentSelection',
      title: 'Content Selection',
      icon: '🎬',
      color: '#10B981',
      description: 'Topics and themes to focus on'
    },
    {
      key: 'titleOptimization', 
      title: 'Title Optimization',
      icon: '✨',
      color: '#DBFC53',
      description: 'Title patterns and improvements'
    },
    {
      key: 'publishingStrategy',
      title: 'Publishing Strategy', 
      icon: '⏰',
      color: '#3B82F6',
      description: 'Timing and frequency recommendations'
    },
    {
      key: 'engagementTactics',
      title: 'Engagement Tactics',
      icon: '💬',
      color: '#F59E0B',
      description: 'Community interaction strategies'
    }
  ]

  const renderActionMatrix = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    }}>
      {actionCategories.map((category) => {
        const actions = actionMatrix[category.key] || []
        
        return (
          <div 
            key={category.key}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '18px' }}>{category.icon}</span>
              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: category.color,
                  margin: '0 0 2px 0'
                }}>
                  {category.title}
                </h4>
                <p style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0
                }}>
                  {category.description}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gap: '8px'
            }}>
              {actions.length > 0 ? actions.map((action, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: '1.4'
                  }}
                >
                  {typeof action === 'object' ? action.text || action.title || String(action) : action}
                </div>
              )) : (
                <div style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  No specific actions identified
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderPriorityActions = () => (
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
        <span>🎯</span>
        High-Impact Actions (Priority Order)
      </h3>

      <div style={{
        display: 'grid',
        gap: '12px'
      }}>
        {prioritizedActions && prioritizedActions.length > 0 ? prioritizedActions.map((action, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: index < 3 ? '#DBFC53' : 'rgba(255,255,255,0.2)',
              color: index < 3 ? '#1A1A1A' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {index + 1}
            </div>
            <div style={{
              flex: 1
            }}>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.5',
                marginBottom: '4px'
              }}>
                {typeof action === 'object' ? action.text || action.title || String(action) : action}
              </div>
              {typeof action === 'object' && action.count && (
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)'
                }}>
                  Mentioned {action.count} times across videos
                </div>
              )}
            </div>
          </div>
        )) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤔</div>
            <p>No priority actions identified yet. Analyze more videos to get personalized recommendations.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderWeeklyPlan = () => (
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
        <span>📅</span>
        Weekly Content Production Plan
      </h3>

      {weeklyContentPlan && typeof weeklyContentPlan === 'object' ? (
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {Object.entries(weeklyContentPlan).map(([day, task]) => (
            <div 
              key={day}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{
                width: '80px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#DBFC53',
                textTransform: 'uppercase'
              }}>
                {day}
              </div>
              <div style={{
                flex: 1,
                fontSize: '14px',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.4'
              }}>
                {task}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            📋 Review your prioritized actions above and create a weekly schedule
          </div>
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            🎯 Focus on 1-2 high-impact actions per week
          </div>
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            📊 Track results and adjust strategy based on performance
          </div>
        </div>
      )}
    </div>
  )

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
          📋
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            color: 'white'
          }}>
            Strategy Playbook
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0
          }}>
            Actionable Content & Growth Strategy
          </p>
        </div>
      </div>

      {/* 选项卡导航 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.05)',
        padding: '6px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: activeSection === section.id ? '#DBFC53' : 'transparent',
              color: activeSection === section.id ? '#1A1A1A' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{section.icon}</span>
            {section.name}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div>
        {activeSection === 'matrix' && renderActionMatrix()}
        {activeSection === 'priorities' && renderPriorityActions()}
        {activeSection === 'weekly' && renderWeeklyPlan()}
      </div>
    </div>
  )
}

export default StrategyPlaybook