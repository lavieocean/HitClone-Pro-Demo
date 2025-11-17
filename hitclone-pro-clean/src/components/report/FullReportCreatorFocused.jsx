import React, { useState, useEffect, useMemo, memo } from 'react'

const FullReportCreatorFocused = memo(({ analysisResults }) => {
  const [scoreAnimated, setScoreAnimated] = useState(0)
  const [selectedRPMCategory, setSelectedRPMCategory] = useState('tech')

  // 移除频繁的控制台日志以优化性能
  // console.log('🎯 创作者专注版报告组件收到的分析结果:', analysisResults)
  
  // 使用useMemo优化数据提取，避免每次渲染重新计算
  const extractedData = useMemo(() => {
    return {
      monetization: analysisResults?.monetization || {},
      optimization: analysisResults?.optimization || {},
      meta: analysisResults?.meta || {},
      viralFactors: analysisResults?.insights?.viralFactors || {},
      contentInfo: analysisResults?.contentInfo || {},
      // v2.2 新增数据结构
      videoSummary: analysisResults?.video_summary || {},
      segmentNotes: analysisResults?.segment_notes || [],
      essenceSummary: analysisResults?.essence_summary || {},
      actionBoard: analysisResults?.action_board || [],
      // 兼容旧版数据
      legacyCreatorInsights: analysisResults?.originalAnalysis?.创作者洞察 || {},
      legacyViralPotential: analysisResults?.originalAnalysis?.爆款潜力 || {},
      legacyDataPredict: analysisResults?.originalAnalysis?.数据预测 || {},
      legacyRevenueEstimate: analysisResults?.originalAnalysis?.收益预估 || {},
      dataPredict: analysisResults?.originalAnalysis?.data_prediction || analysisResults?.originalAnalysis?.数据预测 || {},
      practicalAdvice: analysisResults?.originalAnalysis?.实用建议 || {}
    }
  }, [analysisResults])
  
  const {
    monetization,
    optimization,
    meta,
    viralFactors,
    contentInfo,
    // v2.2 新增数据
    videoSummary,
    segmentNotes,
    essenceSummary,
    actionBoard,
    // 兼容旧版数据
    legacyCreatorInsights,
    legacyViralPotential,
    legacyDataPredict,
    legacyRevenueEstimate,
    dataPredict,
    practicalAdvice
  } = extractedData
  
  // 数据验证 - 优先使用 v2.1 结构
  const isRealCreatorData = (monetization && Object.keys(monetization).length > 0) || 
                           (legacyCreatorInsights && Object.keys(legacyCreatorInsights).length > 0)
  // 数据来源和质量指示
  const dataQuality = meta?.data_quality || 'unknown'
  const analysisMode = meta?.analysis_mode || '未知模式'
  const dataWarnings = meta?.data_warning || []
  
  const getDataSourceDisplay = () => {
    if (dataQuality === '高') {
      return '✅ 真实YouTube数据分析'
    } else if (dataQuality === '中') {
      return '🔍 基于URL推断分析'
    } else {
      return '⚠️ 有限信息推断'
    }
  }
  
  const dataSource = getDataSourceDisplay()
  
  // 减少控制台日志以优化性能
  // console.log('🎬 v2.1 变现数据:', monetization)
  // console.log('🛠 v2.1 优化数据:', optimization)
  // console.log('📋 v2.1 元数据:', meta)
  // console.log('🔥 病毒因子数据:', viralFactors)
  
  // 解析视频时长（复用其他组件的逻辑）
  const parseVideoDuration = (duration) => {
    if (!duration) return 0
    
    if (duration.includes('PT')) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        const hours = parseInt(match[1] || 0)
        const minutes = parseInt(match[2] || 0)
        const seconds = parseInt(match[3] || 0)
        return hours * 3600 + minutes * 60 + seconds
      }
    }
    
    if (duration.includes('分') || duration.includes('秒')) {
      const minuteMatch = duration.match(/(\d+)分/)
      const secondMatch = duration.match(/(\d+)秒/)
      const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
      const seconds = secondMatch ? parseInt(secondMatch[1]) : 0
      return minutes * 60 + seconds
    }
    
    const parts = duration.split(':').map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    
    return 0
  }

  // 使用useMemo优化视频类型分析，避免重复计算
  const videoAnalysis = useMemo(() => {
    const videoDuration = parseVideoDuration(contentInfo.duration)
    const videoDurationMinutes = Math.round(videoDuration / 60)
    
    // 获取视频类型和策略建议
    const getVideoTypeStrategy = (durationMinutes) => {
    if (durationMinutes <= 1) {
      return {
        type: 'Short-form',
        strategy: 'Maximum Impact',
        monetizationFactor: 0.7, // 短视频变现系数较低
        viralPotential: 1.3, // 但传播潜力高
        competitiveAdvantage: 'Instant gratification',
        targetAudience: 'Mobile-first users',
        keyMetrics: ['View completion rate', 'Share rate', 'Loop rate']
      }
    } else if (durationMinutes <= 3) {
      return {
        type: 'Micro-content',
        strategy: 'Quick Value',
        monetizationFactor: 0.85,
        viralPotential: 1.2,
        competitiveAdvantage: 'Digestible insights',
        targetAudience: 'Busy professionals',
        keyMetrics: ['Retention rate', 'Click-through rate', 'Save rate']
      }
    } else if (durationMinutes <= 8) {
      return {
        type: 'Standard Content',
        strategy: 'Engagement Balance',
        monetizationFactor: 1.0,
        viralPotential: 1.0,
        competitiveAdvantage: 'Comprehensive coverage',
        targetAudience: 'General YouTube audience',
        keyMetrics: ['Watch time', 'Engagement rate', 'Subscriber conversion']
      }
    } else if (durationMinutes <= 15) {
      return {
        type: 'Deep-dive',
        strategy: 'Value Stacking',
        monetizationFactor: 1.15,
        viralPotential: 0.8,
        competitiveAdvantage: 'Expert positioning',
        targetAudience: 'Knowledge seekers',
        keyMetrics: ['Session duration', 'Return viewer rate', 'Comment quality']
      }
    } else {
      return {
        type: 'Long-form',
        strategy: 'Authority Building',
        monetizationFactor: 1.3,
        viralPotential: 0.6,
        competitiveAdvantage: 'Thought leadership',
        targetAudience: 'Dedicated followers',
        keyMetrics: ['Total watch time', 'Subscriber loyalty', 'Brand partnerships']
      }
    }
  }

    
    const videoTypeStrategy = getVideoTypeStrategy(videoDurationMinutes)
    
    return {
      videoDuration,
      videoDurationMinutes,
      videoTypeStrategy
    }
  }, [contentInfo.duration])
  
  // 辅助函数：为黄金片段生成情感标签
  const getEmotionTags = (segment, index) => {
    const allTags = ['💥 高潮', '🎯 转折', '💡 洞察', '😮 震撼', '🔥 燃点', '⚡ 爆发', '💎 精华', '🎪 戏剧', '🚀 突破']
    const baseTags = ['🎬 可视化', '📱 移动友好']
    
    // 根据评分和位置生成标签
    const score = segment.shorts_potential || segment.短视频潜力 || segment.传播价值 || 95
    const selectedTags = [...baseTags]
    
    if (score >= 95) selectedTags.push(allTags[0], allTags[6]) // 高潮 + 精华
    else if (score >= 90) selectedTags.push(allTags[1], allTags[2]) // 转折 + 洞察
    else if (score >= 85) selectedTags.push(allTags[3], allTags[4]) // 震撼 + 燃点
    else selectedTags.push(allTags[index % allTags.length])
    
    return selectedTags.slice(0, 4) // 最多显示4个标签
  }

  // 使用useMemo优化评分计算，避免每次渲染重新计算
  const overallScores = useMemo(() => {
    const baseViralScore = Math.round((viralFactors.hookStrength + viralFactors.shareability + viralFactors.retention) / 3) || 
                          legacyViralPotential.综合评分 || 88
    const baseMonetizationScore = monetization.sponsorPotential === '高' ? 95 : 
                                 monetization.sponsorPotential === '中' ? 75 : 
                                 legacyRevenueEstimate.品牌合作潜力 === '高' ? 95 : 
                                 legacyRevenueEstimate.品牌合作潜力 === '中' ? 75 : 70

    return {
      viralPotential: Math.round(baseViralScore * videoAnalysis.videoTypeStrategy.viralPotential),
      monetization: Math.round(baseMonetizationScore * videoAnalysis.videoTypeStrategy.monetizationFactor),
      competitiveness: monetization.competitiveEdge ? 85 : legacyCreatorInsights.竞争优势 ? 85 : 75,
      optimization: optimization.goldenClips?.length > 0 ? 90 : 75,
      overall: Math.round((viralFactors.hookStrength + viralFactors.shareability + viralFactors.retention + viralFactors.emotionalTrigger + viralFactors.curiosityGap) / 5) || 
              legacyViralPotential.综合评分 || 88,
      videoType: videoAnalysis.videoTypeStrategy.type,
      contentStrategy: videoAnalysis.videoTypeStrategy.strategy
    }
  }, [viralFactors, monetization, legacyViralPotential, legacyRevenueEstimate, legacyCreatorInsights, optimization, videoAnalysis])

  // 优化动画效果，只在overall分数变化时才重新计算
  useEffect(() => {
    const targetScore = overallScores.overall
    if (targetScore === scoreAnimated) return // 避免相同分数的重复动画
    
    let currentScore = 0
    const increment = targetScore / (600 / 16)
    
    const updateScore = () => {
      currentScore += increment
      if (currentScore >= targetScore) {
        setScoreAnimated(targetScore)
      } else {
        setScoreAnimated(Math.floor(currentScore))
        requestAnimationFrame(updateScore)
      }
    }
    
    const timeout = setTimeout(updateScore, 300)
    return () => clearTimeout(timeout)
  }, [overallScores.overall, scoreAnimated])

  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981'
    if (score >= 80) return '#F59E0B'
    if (score >= 70) return '#EF4444'
    return '#6B7280'
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* 标题区域 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#1F2937', 
              margin: '0 0 8px 0' 
            }}>
              🧬 爆款DNA解码器
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#059669', 
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              如果今天不点开，你会错过什么？
            </p>
            <p style={{ 
              fontSize: '18px', 
              color: '#6B7280', 
              margin: 0 
            }}>
              {meta.video_title || monetization.contentPosition || legacyCreatorInsights.视频标题建议 || analysisResults?.contentInfo?.title || '视频分析报告'}
            </p>
          </div>
          <div style={{
            background: `linear-gradient(45deg, ${getScoreColor(scoreAnimated)}, ${getScoreColor(scoreAnimated)}dd)`,
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            {scoreAnimated}
          </div>
        </div>
        <div style={{ 
          marginTop: '16px', 
          fontSize: '14px', 
          color: dataQuality === '高' ? '#10B981' : dataQuality === '中' ? '#F59E0B' : '#EF4444',
          fontWeight: '600'
        }}>
          {dataSource}
        </div>
        
        {/* 视频类型分析指示器 */}
        {videoAnalysis.videoDuration > 0 && (
          <div style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Video Type:</span>
              <span style={{ fontSize: '14px', color: '#3B82F6', fontWeight: '700' }}>
                {videoAnalysis.videoTypeStrategy.type}
              </span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                ({contentInfo.duration})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Strategy:</span>
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: '700' }}>
                {videoAnalysis.videoTypeStrategy.strategy}
              </span>
            </div>
          </div>
        )}
        
        {/* 数据质量警告 */}
        {dataWarnings.length > 0 && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            {dataWarnings.map((warning, index) => (
              <div key={index} style={{
                fontSize: '12px',
                color: '#D97706',
                margin: '2px 0'
              }}>
                💡 {warning}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* v2.2 精华总结 */}
      {essenceSummary && Object.keys(essenceSummary).length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✨ 精华总结 - 30秒抓住核心
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '600' }}>💡 核心创意</div>
              <div style={{ fontSize: '16px', lineHeight: '1.4' }}>
                {essenceSummary.big_idea || '视频的核心价值和独特观点'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '600' }}>🚀 电梯推介</div>
              <div style={{ fontSize: '16px', lineHeight: '1.4' }}>
                {essenceSummary.elevator_pitch || '30秒向投资人推介这个视频的价值'}
              </div>
            </div>
          </div>
          {essenceSummary.core_quote && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px 16px', 
              background: 'rgba(255, 255, 255, 0.15)', 
              borderRadius: '8px',
              borderLeft: '4px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>💬 核心引用</div>
              <div style={{ fontSize: '14px', fontStyle: 'italic' }}>
                "{essenceSummary.core_quote}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* v2.2 视频摘要和时间轴 */}
      {(videoSummary && Object.keys(videoSummary).length > 0) || (segmentNotes && segmentNotes.length > 0) && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '24px', 
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 内容时间轴分析
          </h3>
          
          {videoSummary.core_description && (
            <div style={{ marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '16px' }}>📝 核心内容</h4>
              <p style={{ margin: '0', color: '#6B7280', lineHeight: '1.5' }}>
                {videoSummary.core_description}
              </p>
              {videoSummary.core_quote && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px 12px', 
                  background: '#EBF8FF', 
                  borderRadius: '6px',
                  borderLeft: '3px solid #3B82F6'
                }}>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>引用: </span>
                  <span style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
                    {videoSummary.core_quote}
                  </span>
                </div>
              )}
            </div>
          )}

          {segmentNotes && segmentNotes.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: '18px' }}>⏰ 分时段分析</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {segmentNotes.slice(0, 4).map((segment, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    background: index % 2 === 0 ? '#F1F5F9' : '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{
                      background: '#3B82F6',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      alignSelf: 'flex-start'
                    }}>
                      {segment.time_range || `段落 ${index + 1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#374151', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                        {segment.summary || '内容摘要'}
                      </div>
                      {segment.core_quote && (
                        <div style={{ 
                          padding: '8px 12px', 
                          background: '#FEF3C7', 
                          borderRadius: '6px',
                          marginBottom: '8px',
                          borderLeft: '3px solid #F59E0B'
                        }}>
                          <span style={{ fontSize: '11px', color: '#92400E', fontWeight: '600' }}>原文引用: </span>
                          <span style={{ fontSize: '12px', color: '#78350F', fontStyle: 'italic' }}>
                            {segment.core_quote}
                          </span>
                        </div>
                      )}
                      {segment.analysis && (
                        <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.4' }}>
                          💡 {segment.analysis}
                        </div>
                      )}
                      {segment.highlights && segment.highlights.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {segment.highlights.map((highlight, hIndex) => (
                            <span key={hIndex} style={{
                              background: '#D1FAE5',
                              color: '#065F46',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {segmentNotes.length > 4 && (
                  <div style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px', fontStyle: 'italic' }}>
                    还有 {segmentNotes.length - 4} 个时间段分析...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Why Now? 时效性分析 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h3 style={{ 
          fontSize: '24px', 
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⏰ Why Now? - 时效性分析
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>趋势关键词</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              {meta.trend_keywords?.join(', ') || 'AI革命, 技术突破'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>发布窗口</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              {meta.timing_window || '周二-周四 14:00-16:00'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>社会话题热度</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {meta.social_heat || 85}°C
            </div>
          </div>
        </div>
      </div>

      {/* 创作者核心关注卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* 爆款潜力 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '20px', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔥 爆款潜力评估
          </h3>
          <p style={{ 
            color: '#059669', 
            fontSize: '14px', 
            margin: '0 0 16px 0',
            fontStyle: 'italic',
            fontWeight: '600'
          }}>
            "这个视频能火吗？投入值得吗？"
          </p>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>开场Hook</span>
              <span style={{ fontWeight: '600' }}>{viralFactors.hookStrength || legacyViralPotential.开场Hook || 85}分</span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: '8px', height: '6px' }}>
              <div style={{
                background: '#10B981',
                height: '100%',
                borderRadius: '8px',
                width: `${viralFactors.hookStrength || legacyViralPotential.开场Hook || 85}%`
              }} />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>分享动机</span>
              <span style={{ fontWeight: '600' }}>{viralFactors.shareability || legacyViralPotential.分享价值 || 81}分</span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: '8px', height: '6px' }}>
              <div style={{
                background: '#F59E0B',
                height: '100%',
                borderRadius: '8px',
                width: `${viralFactors.shareability || legacyViralPotential.分享价值 || 81}%`
              }} />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>算法友好度</span>
              <span style={{ fontWeight: '600' }}>{viralFactors.retention || legacyViralPotential.算法友好度 || 86}分</span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: '8px', height: '6px' }}>
              <div style={{
                background: '#8B5CF6',
                height: '100%',
                borderRadius: '8px',
                width: `${viralFactors.retention || legacyViralPotential.算法友好度 || 86}%`
              }} />
            </div>
          </div>
        </div>

        {/* 变现潜力 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '20px', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💰 Revenue Radar - 收益雷达
          </h3>
          <p style={{ 
            color: '#059669', 
            fontSize: '14px', 
            margin: '0 0 16px 0',
            fontStyle: 'italic',
            fontWeight: '600'
          }}>
            "一百万播放，口袋能进多少？"
          </p>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#10B981',
              marginBottom: '4px'
            }}>
              {monetization.monthlyEstimate || legacyRevenueEstimate.月收益预估 || '$1,200-3,500'}
            </div>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>
              预估月收益范围
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
              RPM收益预估 
              {monetization.rpm?.confidence && (
                <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '8px' }}>
                  置信度: {Math.round(monetization.rpm.confidence * 100)}%
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {['low', 'mid', 'high'].map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedRPMCategory(level)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: selectedRPMCategory === level ? '#3B82F6' : '#F3F4F6',
                    color: selectedRPMCategory === level ? 'white' : '#6B7280',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {level === 'low' ? '低档' : level === 'mid' ? '中档' : '高档'}
                </button>
              ))}
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1F2937' 
            }}>
              {monetization.rpm?.[selectedRPMCategory] || 
               legacyRevenueEstimate.广告RPM?.[selectedRPMCategory] || 
               (selectedRPMCategory === 'low' ? '$2-4' : 
                selectedRPMCategory === 'mid' ? '$8-15' : '$12-25')}
            </div>
          </div>
          
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>品牌合作潜力</div>
            <div style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: (monetization.sponsorPotential || legacyRevenueEstimate.品牌合作潜力) === '高' ? '#D1FAE5' : 
                         (monetization.sponsorPotential || legacyRevenueEstimate.品牌合作潜力) === '中' ? '#FEF3C7' : '#FEE2E2',
              color: (monetization.sponsorPotential || legacyRevenueEstimate.品牌合作潜力) === '高' ? '#059669' : 
                     (monetization.sponsorPotential || legacyRevenueEstimate.品牌合作潜力) === '中' ? '#D97706' : '#DC2626',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {monetization.sponsorPotential || legacyRevenueEstimate.品牌合作潜力 || '中'}
            </div>
          </div>
        </div>

        {/* 竞争分析 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '20px', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎯 竞争优势分析
          </h3>
          <p style={{ 
            color: '#059669', 
            fontSize: '14px', 
            margin: '0 0 16px 0',
            fontStyle: 'italic',
            fontWeight: '600'
          }}>
            "同类内容这么多，我的优势在哪？"
          </p>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>内容定位</div>
            <div style={{ color: '#6B7280' }}>
              {monetization.contentPosition || legacyCreatorInsights.内容定位 || '科技教育类内容'}
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>核心卖点</div>
            <div style={{ color: '#6B7280' }}>
              {monetization.coreHighlight || legacyCreatorInsights.核心卖点 || '深度技术解析与实用案例'}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>竞争优势</div>
            <div style={{ color: '#6B7280' }}>
              {monetization.competitiveEdge || legacyCreatorInsights.竞争优势 || videoAnalysis.videoTypeStrategy.competitiveAdvantage}
            </div>
          </div>
          
          {/* 基于视频类型的详细分析 */}
          {videoAnalysis.videoDuration > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: '#1F2937' }}>
                📊 {videoAnalysis.videoTypeStrategy.type} Content Analysis
              </h4>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Target Audience: </span>
                <span style={{ fontSize: '12px', color: '#1F2937' }}>{videoAnalysis.videoTypeStrategy.targetAudience}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Key Metrics: </span>
                <span style={{ fontSize: '12px', color: '#1F2937' }}>{videoAnalysis.videoTypeStrategy.keyMetrics.join(', ')}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <div style={{
                  flex: 1,
                  padding: '6px 8px',
                  background: videoAnalysis.videoTypeStrategy.viralPotential > 1 ? '#D1FAE5' : '#FEF3C7',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Viral Potential</div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: videoAnalysis.videoTypeStrategy.viralPotential > 1 ? '#059669' : '#D97706'
                  }}>
                    {videoAnalysis.videoTypeStrategy.viralPotential > 1 ? 'High' : videoAnalysis.videoTypeStrategy.viralPotential === 1 ? 'Standard' : 'Moderate'}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  padding: '6px 8px',
                  background: videoAnalysis.videoTypeStrategy.monetizationFactor > 1 ? '#D1FAE5' : '#FEF3C7',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Monetization</div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: videoAnalysis.videoTypeStrategy.monetizationFactor > 1 ? '#059669' : '#D97706'
                  }}>
                    {videoAnalysis.videoTypeStrategy.monetizationFactor > 1 ? 'High' : videoAnalysis.videoTypeStrategy.monetizationFactor === 1 ? 'Standard' : 'Lower'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 数据预测和优化建议 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* 数据预测 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '20px', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 数据表现预测
          </h3>
          <p style={{ 
            color: '#059669', 
            fontSize: '14px', 
            margin: '0 0 16px 0',
            fontStyle: 'italic',
            fontWeight: '600'
          }}>
            "这个视频的数据表现会如何？"
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>
                {dataPredict.retention || dataPredict.留存率 || '65%'}
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>预估留存率</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                {dataPredict.like_ratio || dataPredict.点赞率 || '8.2%'}
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>预估点赞率</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
                {dataPredict.comment_ratio || dataPredict.评论率 || '2.1%'}
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>预估评论率</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
                {dataPredict.recommend_pct || dataPredict.推荐流量占比 || '78%'}
              </div>
              <div style={{ color: '#6B7280', fontSize: '14px' }}>推荐流量</div>
            </div>
          </div>
        </div>

        {/* 黄金片段 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '20px', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⭐ 黄金片段推荐
          </h3>
          <p style={{ 
            color: '#059669', 
            fontSize: '14px', 
            margin: '0 0 16px 0',
            fontStyle: 'italic',
            fontWeight: '600'
          }}>
            "最值得剪成短视频的30秒在哪？"
          </p>
          {optimization.goldenClips && optimization.goldenClips.length > 0 ? (
            optimization.goldenClips.slice(0, 3).map((segment, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #FEF7CD 0%, #FBBF24 20%, #F59E0B 100%)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                border: '2px solid #D97706',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      background: '#92400E',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}>
                      ⏰ {segment.time || segment.时间 || `${segment.开始时间 || '2:15'}-${segment.结束时间 || '2:45'}s`}
                    </span>
                    <span style={{ fontSize: '12px', color: '#92400E', fontWeight: '600' }}>
                      黄金片段 #{index + 1}
                    </span>
                  </div>
                  <div style={{
                    background: '#065F46',
                    color: '#D1FAE5',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🎯 {segment.shorts_potential || segment.短视频潜力 || segment.传播价值 || 95}分
                  </div>
                </div>

                {/* 场景描述 */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '12px',
                  border: '1px solid rgba(146, 64, 14, 0.2)'
                }}>
                  <h5 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#92400E', 
                    fontSize: '14px', 
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    🎬 场景画面
                  </h5>
                  <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.4', marginBottom: '8px' }}>
                    {segment.desc || segment.描述 || `这是一个关键转折点，创作者通过具体案例展示核心观点，画面中可能包含演示、图表或重要表情变化。`}
                  </div>
                  
                  {/* 添加字幕原文引用 */}
                  {segment.core_quote && (
                    <div style={{ 
                      background: '#FEF3C7', 
                      borderLeft: '4px solid #F59E0B',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      marginTop: '8px'
                    }}>
                      <span style={{ fontSize: '11px', color: '#92400E', fontWeight: '600' }}>📝 字幕原文: </span>
                      <span style={{ fontSize: '13px', color: '#78350F', fontStyle: 'italic' }}>
                        "{segment.core_quote}"
                      </span>
                    </div>
                  )}
                </div>

                {/* 短视频制作指导 */}
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  borderRadius: '8px', 
                  padding: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <h5 style={{ 
                    margin: '0 0 6px 0', 
                    color: '#059669', 
                    fontSize: '13px', 
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ✂️ 短视频剪辑建议
                  </h5>
                  <div style={{ color: '#047857', fontSize: '12px', lineHeight: '1.3' }}>
                    💡 {segment.suggest || segment.建议 || segment.推荐理由 || `开头3秒用吸引眼球的标题卡，保留核心观点表达，结尾加上悬念引导观看完整版。建议添加字幕和关键词高亮。`}
                  </div>
                  
                  {/* 情感标签 */}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {getEmotionTags(segment, index).map((tag, tIndex) => (
                      <span key={tIndex} style={{
                        background: '#D1FAE5',
                        color: '#065F46',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '20px',
              textAlign: 'center',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '2px dashed #D1D5DB'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎬</div>
              <div style={{ color: '#6B7280', fontStyle: 'italic', marginBottom: '4px' }}>
                暂无黄金片段数据
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                AI 正在分析视频内容，寻找最具传播价值的精彩片段...
              </div>
            </div>
          )}
          
          {/* v2.1 新功能：A/B 测试建议 */}
          {optimization.autoAssets && (optimization.autoAssets.title_pairs?.length > 0 || optimization.autoAssets.thumb_pairs?.length > 0) && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#EBF8FF', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1E40AF', fontSize: '14px' }}>🤖 AI A/B 测试建议</h4>
              {optimization.autoAssets.title_pairs?.slice(0, 1).map((pair, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>标题对比:</div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>
                    A: {pair.A} vs B: {pair.B}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                    💡 {pair.why}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* v2.2 行动清单 */}
      {actionBoard && actionBoard.length > 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            color: '#1F2937', 
            fontSize: '24px', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 3小时内执行清单
          </h3>
          <p style={{ 
            color: '#059669', 
            fontSize: '16px', 
            margin: '0 0 20px 0',
            fontStyle: 'italic',
            fontWeight: '600'
          }}>
            "具体可执行的任务，按优先级排序"
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {actionBoard.map((action, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '16px',
                padding: '20px',
                background: action.priority === 'high' ? '#FEF2F2' : action.priority === 'medium' ? '#FEF3C7' : '#F0F9FF',
                borderRadius: '12px',
                border: `2px solid ${action.priority === 'high' ? '#FECACA' : action.priority === 'medium' ? '#FDE68A' : '#DBEAFE'}`
              }}>
                <div style={{
                  background: action.priority === 'high' ? '#DC2626' : action.priority === 'medium' ? '#D97706' : '#2563EB',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start'
                }}>
                  {action.priority === 'high' ? '🔥 HIGH' : action.priority === 'medium' ? '⚡ MED' : '📌 LOW'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#1F2937', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {action.task}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      <span style={{ fontWeight: '600' }}>⏱️ 预计时间: </span>
                      {action.estimated_time || '30分钟'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      <span style={{ fontWeight: '600' }}>📈 预期影响: </span>
                      {action.expected_impact || '提升内容质量'}
                    </div>
                  </div>
                  {action.supporting_quote && (
                    <div style={{ 
                      padding: '8px 12px', 
                      background: '#F8FAFC', 
                      borderRadius: '6px',
                      borderLeft: '3px solid #6366F1'
                    }}>
                      <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: '600' }}>支撑引用: </span>
                      <span style={{ fontSize: '12px', color: '#374151', fontStyle: 'italic' }}>
                        {action.supporting_quote}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 实用建议 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          color: '#1F2937', 
          fontSize: '24px', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🚀 下一次实验计划
        </h3>
        <p style={{ 
          color: '#059669', 
          fontSize: '16px', 
          margin: '0 0 20px 0',
          fontStyle: 'italic',
          fontWeight: '600'
        }}>
          "如何把这条爆款的DNA再复制到下一支？"
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* 下期选题 */}
          <div>
            <h4 style={{ color: '#1F2937', fontSize: '16px', margin: '0 0 8px 0' }}>
              📝 下期选题建议
            </h4>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>
              {optimization.nextTopic || practicalAdvice.下期选题 || '基于当前热度，可以深入探讨具体实现细节'}
            </div>
          </div>

          {/* 发布策略 */}
          <div>
            <h4 style={{ color: '#1F2937', fontSize: '16px', margin: '0 0 8px 0' }}>
              ⏰ 发布策略
            </h4>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>
              {optimization.publishStrategy || practicalAdvice.发布策略 || '建议在周二-周四下午2-4点发布，配合社区预热'}
            </div>
          </div>

          {/* 互动策略 */}
          <div>
            <h4 style={{ color: '#1F2937', fontSize: '16px', margin: '0 0 8px 0' }}>
              💬 互动策略
            </h4>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>
              {optimization.engagementStrategy || practicalAdvice.互动策略 || '在评论区提问引导讨论，及时回复前50个评论'}
            </div>
          </div>

          {/* v2.1 新功能：短视频 CTA */}
          <div>
            <h4 style={{ color: '#1F2937', fontSize: '16px', margin: '0 0 8px 0' }}>
              📱 短视频CTA
            </h4>
            <div style={{ 
              color: '#DC2626', 
              fontSize: '16px', 
              fontWeight: '600',
              background: '#FEF2F2',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #FECACA'
            }}>
              "{optimization.hookAiCta || '关注更新'}"
            </div>
            <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
              ≤10字，适合 YouTube Shorts 片尾
            </div>
          </div>

          {/* 标签推荐 */}
          <div>
            <h4 style={{ color: '#1F2937', fontSize: '16px', margin: '0 0 8px 0' }}>
              🏷️ 推荐标签
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {optimization.tags ? 
                optimization.tags.map((tag, index) => (
                  <span key={index} style={{
                    background: '#EBF8FF',
                    color: '#1E40AF',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {tag}
                  </span>
                )) : 
                practicalAdvice.标签推荐 ? 
                practicalAdvice.标签推荐.map((tag, index) => (
                  <span key={index} style={{
                    background: '#EBF8FF',
                    color: '#1E40AF',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {tag}
                  </span>
                )) : 
                ['YouTube创作', '内容优化', '数据分析'].map((tag, index) => (
                  <span key={index} style={{
                    background: '#EBF8FF',
                    color: '#1E40AF',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {tag}
                  </span>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

FullReportCreatorFocused.displayName = 'FullReportCreatorFocused'

export default FullReportCreatorFocused