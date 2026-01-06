import React, { useMemo } from 'react'

const ContentDeepDive = ({ analysisResults }) => {
  console.log('🔍 ContentDeepDive收到数据:', analysisResults)

  // 提取Master Prompt v2.2的数据结构
  const extractedData = useMemo(() => {
    if (!analysisResults) return null

    return {
      videoSummary: analysisResults?.video_summary || {},
      segmentNotes: analysisResults?.segment_notes || [],
      essenceSummary: analysisResults?.essence_summary || {},
      actionBoard: analysisResults?.action_board || [],
      practicalTips: analysisResults?.practical_tips || {},
      meta: analysisResults?.meta || {},
      // 兼容旧格式数据
      contentInfo: analysisResults?.contentInfo || {},
      transcriptData: analysisResults?.transcriptData || {},
      subtitles: analysisResults?.subtitles || []
    }
  }, [analysisResults])

  if (!extractedData) {
    return (
      <div className="content-deep-dive">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>暂无深度内容分析</h3>
          <p>请先完成视频分析以查看详细的内容洞察</p>
        </div>
      </div>
    )
  }

  return (
    <div className="content-deep-dive">
      {/* 页面标题 */}
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-icon">🔍</span>
          Content Deep Dive
        </h2>
        <p className="section-subtitle">
          基于完整字幕的深度内容分析与洞察
        </p>
        
        {/* 数据优势展示 */}
        {extractedData.contentInfo?.hasAutoData && (
          <div style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🚀</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              真实YouTube数据驱动分析 - 获得其他分析工具无法提供的深度洞察
            </span>
          </div>
        )}
        
        {/* 数据质量对比 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '16px'
        }}>
          <div style={{
            background: extractedData.contentInfo?.hasAutoData ? '#D1FAE5' : '#FEF3C7',
            border: `2px solid ${extractedData.contentInfo?.hasAutoData ? '#10B981' : '#F59E0B'}`,
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>数据完整性</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700',
              color: extractedData.contentInfo?.hasAutoData ? '#059669' : '#D97706'
            }}>
              {extractedData.contentInfo?.hasAutoData ? '100%' : '65%'}
            </div>
          </div>
          <div style={{
            background: extractedData.subtitles?.length > 0 ? '#D1FAE5' : '#FEE2E2',
            border: `2px solid ${extractedData.subtitles?.length > 0 ? '#10B981' : '#EF4444'}`,
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>字幕内容</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700',
              color: extractedData.subtitles?.length > 0 ? '#059669' : '#DC2626'
            }}>
              {extractedData.subtitles?.length > 0 ? '✅ 完整' : '❌ 缺失'}
            </div>
          </div>
          <div style={{
            background: extractedData.contentInfo?.hasAutoData ? '#D1FAE5' : '#F3F4F6',
            border: `2px solid ${extractedData.contentInfo?.hasAutoData ? '#10B981' : '#D1D5DB'}`,
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>分析深度</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700',
              color: extractedData.contentInfo?.hasAutoData ? '#059669' : '#6B7280'
            }}>
              {extractedData.contentInfo?.hasAutoData ? '深度分析' : '基础推断'}
            </div>
          </div>
        </div>
      </div>

      {/* 精华总结 */}
      {extractedData.essenceSummary && Object.keys(extractedData.essenceSummary).length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title">
            <span className="title-icon">✨</span>
            精华总结 (Essence Summary)
          </h3>
          <div className="essence-grid">
            {extractedData.essenceSummary.big_idea && (
              <div className="essence-card big-idea">
                <h4>🎯 核心创意 (Big Idea)</h4>
                <p>{extractedData.essenceSummary.big_idea}</p>
              </div>
            )}
            {extractedData.essenceSummary.elevator_pitch && (
              <div className="essence-card elevator-pitch">
                <h4>🚀 30秒电梯推介</h4>
                <p>{extractedData.essenceSummary.elevator_pitch}</p>
              </div>
            )}
            {extractedData.essenceSummary.unique_angle && (
              <div className="essence-card unique-angle">
                <h4>🎪 独特视角</h4>
                <p>{extractedData.essenceSummary.unique_angle}</p>
              </div>
            )}
            {extractedData.essenceSummary.core_quote && (
              <div className="essence-card core-quote">
                <h4>💬 核心引用</h4>
                <p className="quote-text">{extractedData.essenceSummary.core_quote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scraping 数据价值展示 */}
      {extractedData.contentInfo?.hasAutoData && (
        <div className="analysis-section">
          <h3 className="analysis-title">
            <span className="title-icon">🎯</span>
            智能爬虫数据优势 (Scraping Data Advantage)
          </h3>
          <div style={{
            background: 'linear-gradient(135deg, #EBF8FF 0%, #DBEAFE 100%)',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #3B82F6'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                color: '#1E40AF', 
                fontSize: '16px', 
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚀 为什么这份分析更精准？
              </h4>
              <p style={{ 
                color: '#374151', 
                fontSize: '14px', 
                lineHeight: '1.5',
                margin: '0'
              }}>
                基于真实YouTube API数据和智能爬虫技术，我们获得了其他分析工具无法提供的深度信息，包括完整字幕、精确的互动数据、以及频道历史表现。
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #E5E7EB'
              }}>
                <h5 style={{ 
                  color: '#059669', 
                  fontSize: '14px', 
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📊 真实互动数据
                </h5>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '16px', 
                  fontSize: '13px', 
                  color: '#6B7280',
                  lineHeight: '1.4'
                }}>
                  <li>精确的点赞、评论、分享数据</li>
                  <li>观看时长和留存率分析</li>
                  <li>观众人群分布和行为模式</li>
                </ul>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #E5E7EB'
              }}>
                <h5 style={{ 
                  color: '#7C3AED', 
                  fontSize: '14px', 
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🎬 完整内容解析
                </h5>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '16px', 
                  fontSize: '13px', 
                  color: '#6B7280',
                  lineHeight: '1.4'
                }}>
                  <li>逐句字幕内容分析</li>
                  <li>关键时刻和转折点识别</li>
                  <li>情感变化和节奏把控</li>
                </ul>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #E5E7EB'
              }}>
                <h5 style={{ 
                  color: '#DC2626', 
                  fontSize: '14px', 
                  fontWeight: '700',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🔍 深度竞争洞察
                </h5>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '16px', 
                  fontSize: '13px', 
                  color: '#6B7280',
                  lineHeight: '1.4'
                }}>
                  <li>频道历史表现对比</li>
                  <li>同类内容竞争态势</li>
                  <li>优化空间和机会识别</li>
                </ul>
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>💡 专业提示: </span>
              <span style={{ fontSize: '12px', color: '#047857' }}>
                这种级别的数据分析通常需要专业的社媒分析团队和昂贵的第三方工具。通过我们的智能爬虫系统，您可以获得价值数千美元的专业级分析报告。
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 视频摘要 */}
      {extractedData.videoSummary && Object.keys(extractedData.videoSummary).length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title">
            <span className="title-icon">📋</span>
            视频摘要 (Video Summary)
          </h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>📝 核心描述</h4>
              <p>{extractedData.videoSummary.core_description || '暂无描述'}</p>
            </div>
            {extractedData.videoSummary.main_topics && extractedData.videoSummary.main_topics.length > 0 && (
              <div className="summary-card">
                <h4>🏷️ 主要主题</h4>
                <div className="topic-tags">
                  {extractedData.videoSummary.main_topics.map((topic, index) => (
                    <span key={index} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="summary-card">
              <h4>🎯 内容类型</h4>
              <p>{extractedData.videoSummary.content_type || '未知类型'}</p>
            </div>
            <div className="summary-card">
              <h4>👥 目标受众</h4>
              <p>{extractedData.videoSummary.target_audience || '未知受众'}</p>
            </div>
            {extractedData.videoSummary.core_quote && (
              <div className="summary-card quote-card">
                <h4>💬 核心引用</h4>
                <p className="quote-text">{extractedData.videoSummary.core_quote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 分段详细分析 */}
      {extractedData.segmentNotes && extractedData.segmentNotes.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title">
            <span className="title-icon">⏱️</span>
            分段详细分析 (Segment Analysis)
          </h3>
          <div className="segments-timeline">
            {extractedData.segmentNotes.map((segment, index) => (
              <div key={index} className="segment-card">
                <div className="segment-header">
                  <span className="time-badge">{segment.time_range || `段落 ${index + 1}`}</span>
                  <span className="source-badge">{segment.source || '字幕分析'}</span>
                </div>
                <div className="segment-content">
                  <h4>📄 内容摘要</h4>
                  <p>{segment.summary || '暂无摘要'}</p>
                  
                  {segment.core_quote && (
                    <>
                      <h4>💬 核心引用</h4>
                      <p className="quote-text">{segment.core_quote}</p>
                    </>
                  )}
                  
                  {segment.analysis && (
                    <>
                      <h4>🔍 深度分析</h4>
                      <p>{segment.analysis}</p>
                    </>
                  )}
                  
                  {segment.highlights && segment.highlights.length > 0 && (
                    <>
                      <h4>⭐ 重点亮点</h4>
                      <ul className="highlights-list">
                        {segment.highlights.map((highlight, hIndex) => (
                          <li key={hIndex}>{highlight}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 行动清单 */}
      {extractedData.actionBoard && extractedData.actionBoard.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title">
            <span className="title-icon">📋</span>
            行动清单 (Action Board)
          </h3>
          <div className="action-board">
            {extractedData.actionBoard.map((action, index) => (
              <div key={index} className={`action-card priority-${action.priority || 'medium'}`}>
                <div className="action-header">
                  <span className={`priority-badge priority-${action.priority || 'medium'}`}>
                    {action.priority === 'high' ? '🔥 高' : action.priority === 'low' ? '⏳ 低' : '📌 中'}
                  </span>
                  <span className="time-estimate">{action.estimated_time || '未知时间'}</span>
                </div>
                <h4>{action.task || '待办任务'}</h4>
                {action.expected_impact && (
                  <p className="impact-text">
                    <strong>预期影响:</strong> {action.expected_impact}
                  </p>
                )}
                {action.supporting_quote && (
                  <p className="quote-text">
                    <strong>支撑引用:</strong> {action.supporting_quote}
                  </p>
                )}
                <p className="source-text">
                  <strong>数据来源:</strong> {action.source || '未知'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 实用建议 */}
      {extractedData.practicalTips && Object.keys(extractedData.practicalTips).length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title">
            <span className="title-icon">💡</span>
            实用建议 (Practical Tips)
          </h3>
          <div className="tips-grid">
            {extractedData.practicalTips.next_topic && (
              <div className="tip-card">
                <h4>🎬 下期选题建议</h4>
                <p>{extractedData.practicalTips.next_topic}</p>
              </div>
            )}
            {extractedData.practicalTips.publish_strategy && (
              <div className="tip-card">
                <h4>📅 发布策略</h4>
                <p>{extractedData.practicalTips.publish_strategy}</p>
              </div>
            )}
            {extractedData.practicalTips.engagement_strategy && (
              <div className="tip-card">
                <h4>💬 互动策略</h4>
                <p>{extractedData.practicalTips.engagement_strategy}</p>
              </div>
            )}
            {extractedData.practicalTips.tags && extractedData.practicalTips.tags.length > 0 && (
              <div className="tip-card">
                <h4>🏷️ 推荐标签</h4>
                <div className="tag-list">
                  {extractedData.practicalTips.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {extractedData.practicalTips.improvement_quotes && extractedData.practicalTips.improvement_quotes.length > 0 && (
              <div className="tip-card full-width">
                <h4>📝 改进建议引用</h4>
                <div className="improvement-quotes">
                  {extractedData.practicalTips.improvement_quotes.map((quote, index) => (
                    <p key={index} className="quote-text">{quote}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 数据质量和来源信息 */}
      {extractedData.meta && Object.keys(extractedData.meta).length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title">
            <span className="title-icon">📊</span>
            分析元数据 (Meta Information)
          </h3>
          <div className="meta-info">
            <div className="meta-grid">
              {extractedData.meta.version && (
                <div className="meta-item">
                  <strong>版本:</strong> {extractedData.meta.version}
                </div>
              )}
              {extractedData.meta.analysis_timestamp && (
                <div className="meta-item">
                  <strong>分析时间:</strong> {new Date(extractedData.meta.analysis_timestamp).toLocaleString('zh-CN')}
                </div>
              )}
              {extractedData.meta.confidence_level && (
                <div className="meta-item">
                  <strong>可信度:</strong> {Math.round(extractedData.meta.confidence_level * 100)}%
                </div>
              )}
            </div>
            
            {extractedData.meta.source && extractedData.meta.source.length > 0 && (
              <div className="source-info">
                <h4>📋 数据来源:</h4>
                <ul>
                  {extractedData.meta.source.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {extractedData.meta.data_warning && extractedData.meta.data_warning.length > 0 && (
              <div className="warning-info">
                <h4>⚠️ 数据说明:</h4>
                <ul>
                  {extractedData.meta.data_warning.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .content-deep-dive {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #0A0A0A;
          color: #E5E5E5;
          min-height: 100vh;
        }

        .section-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px 20px;
          background: linear-gradient(135deg, rgba(219, 252, 83, 0.1), rgba(16, 185, 129, 0.1));
          border-radius: 16px;
          border: 1px solid rgba(219, 252, 83, 0.2);
        }

        .section-title {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #DBFC53, #10B981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: 16px;
          color: #9CA3AF;
          margin: 0;
        }

        .title-icon {
          margin-right: 12px;
        }

        .analysis-section {
          margin-bottom: 40px;
          padding: 30px;
          background: #111111;
          border-radius: 16px;
          border: 1px solid #333;
        }

        .analysis-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
          color: #DBFC53;
          display: flex;
          align-items: center;
        }

        .essence-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .essence-card {
          padding: 24px;
          background: #1A1A1A;
          border-radius: 12px;
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .essence-card:hover {
          border-color: #DBFC53;
          transform: translateY(-2px);
        }

        .essence-card h4 {
          color: #DBFC53;
          margin-bottom: 12px;
          font-size: 16px;
        }

        .essence-card p {
          color: #E5E5E5;
          line-height: 1.6;
          margin: 0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .summary-card {
          padding: 20px;
          background: #1A1A1A;
          border-radius: 12px;
          border: 1px solid #333;
        }

        .summary-card h4 {
          color: #10B981;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .topic-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .topic-tag {
          padding: 4px 12px;
          background: rgba(219, 252, 83, 0.1);
          color: #DBFC53;
          border-radius: 16px;
          font-size: 12px;
          border: 1px solid rgba(219, 252, 83, 0.3);
        }

        .segments-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .segment-card {
          background: #1A1A1A;
          border-radius: 12px;
          border: 1px solid #333;
          overflow: hidden;
        }

        .segment-header {
          background: #222;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .time-badge {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .source-badge {
          background: rgba(107, 114, 128, 0.2);
          color: #9CA3AF;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
        }

        .segment-content {
          padding: 20px;
        }

        .segment-content h4 {
          color: #DBFC53;
          margin: 16px 0 8px 0;
          font-size: 14px;
        }

        .segment-content h4:first-child {
          margin-top: 0;
        }

        .highlights-list {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .highlights-list li {
          color: #E5E5E5;
          margin-bottom: 4px;
        }

        .action-board {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .action-card {
          padding: 20px;
          background: #1A1A1A;
          border-radius: 12px;
          border: 1px solid #333;
        }

        .action-card.priority-high {
          border-color: #EF4444;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
        }

        .action-card.priority-medium {
          border-color: #F59E0B;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
        }

        .action-card.priority-low {
          border-color: #6B7280;
          background: linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(107, 114, 128, 0.05));
        }

        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .priority-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .priority-badge.priority-high {
          background: rgba(239, 68, 68, 0.2);
          color: #F87171;
        }

        .priority-badge.priority-medium {
          background: rgba(245, 158, 11, 0.2);
          color: #FBBF24;
        }

        .priority-badge.priority-low {
          background: rgba(107, 114, 128, 0.2);
          color: #9CA3AF;
        }

        .time-estimate {
          color: #9CA3AF;
          font-size: 12px;
        }

        .action-card h4 {
          color: #E5E5E5;
          margin-bottom: 12px;
          font-size: 16px;
        }

        .impact-text, .source-text {
          color: #9CA3AF;
          font-size: 13px;
          margin: 8px 0;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .tip-card {
          padding: 20px;
          background: #1A1A1A;
          border-radius: 12px;
          border: 1px solid #333;
        }

        .tip-card.full-width {
          grid-column: 1 / -1;
        }

        .tip-card h4 {
          color: #10B981;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          padding: 4px 8px;
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          border-radius: 12px;
          font-size: 11px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .improvement-quotes {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quote-text {
          background: rgba(107, 114, 128, 0.1);
          padding: 12px 16px;
          border-radius: 8px;
          color: #D1D5DB;
          font-style: italic;
          border-left: 3px solid #DBFC53;
          margin: 8px 0;
        }

        .meta-info {
          background: #1A1A1A;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #333;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .meta-item {
          color: #9CA3AF;
          font-size: 14px;
        }

        .source-info, .warning-info {
          margin-top: 16px;
        }

        .source-info h4, .warning-info h4 {
          color: #DBFC53;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .source-info ul, .warning-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .source-info li, .warning-info li {
          color: #9CA3AF;
          margin-bottom: 4px;
          font-size: 13px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9CA3AF;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          color: #E5E5E5;
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .content-deep-dive {
            padding: 16px;
          }

          .essence-grid, .summary-grid, .action-board, .tips-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            padding: 20px 16px;
          }

          .section-title {
            font-size: 24px;
          }

          .analysis-section {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default ContentDeepDive