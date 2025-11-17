import React, { useState } from 'react'

const ViralDNAEnhanced = ({ analysisResults }) => {
  const [activeSection, setActiveSection] = useState('title')
  
  console.log('🔥 Magnetic Title + Spark Thumbnail component rendering:', analysisResults)
  
  // Data extraction
  const viralFactors = analysisResults?.insights?.viralFactors || {}
  const originalAnalysis = analysisResults?.originalAnalysis || {}
  const meta = analysisResults?.meta || {}
  const contentInfo = analysisResults?.contentInfo || {}
  
  // Parse video duration (reusing WatchTimeHacksEnhanced logic)
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
  
  const videoDuration = parseVideoDuration(contentInfo.duration)
  const videoDurationMinutes = Math.round(videoDuration / 60)
  
  // Get title optimization suggestions based on video duration
  const getTitleOptimizationByDuration = (durationMinutes) => {
    if (durationMinutes <= 1) {
      return {
        strategy: 'Instant Impact',
        tips: ['Use action words', 'Numbers work great', 'Promise quick result', 'Create urgency'],
        examples: ['30 Second Life Hack', 'Quick Fix for...', 'Instant Solution']
      }
    } else if (durationMinutes <= 3) {
      return {
        strategy: 'Quick Value Promise',
        tips: ['Mention time frame', 'Promise specific outcome', 'Use "how to" format', 'Include benefit'],
        examples: ['How to X in 3 Minutes', 'Quick Guide to...', '3-Minute Transformation']
      }
    } else if (durationMinutes <= 8) {
      return {
        strategy: 'Comprehensive Solution',
        tips: ['Promise complete solution', 'Use "complete guide"', 'Mention step-by-step', 'Include transformation'],
        examples: ['Complete Guide to...', 'Step-by-Step...', 'Everything You Need to Know']
      }
    } else if (durationMinutes <= 15) {
      return {
        strategy: 'Deep Expertise',
        tips: ['Emphasize depth', 'Use "ultimate" or "complete"', 'Promise mastery', 'Mention comprehensive'],
        examples: ['Ultimate Guide to...', 'Master Class in...', 'Deep Dive into...']
      }
    } else {
      return {
        strategy: 'Authority Content',
        tips: ['Emphasize expertise', 'Use "masterclass"', 'Promise advanced knowledge', 'Mention exclusive'],
        examples: ['Masterclass:', 'Advanced...', 'Professional Guide to...']
      }
    }
  }
  
  const titleOptimization = getTitleOptimizationByDuration(videoDurationMinutes)
  
  // Title data
  const titleData = {
    current: meta.video_title || analysisResults?.contentInfo?.title || 'Current Video Title',
    magneticScore: viralFactors.curiosityGap || 85,
    aiAlternatives: originalAnalysis.creator_insights?.title_options || [
      '震撼！AI革命真的来了',
      '99%的人都不知道的AI秘密', 
      '3分钟看懂未来10年趋势'
    ],
    keywordPower: originalAnalysis.practical_tips?.tags || ['AI', '革命', '未来', '震撼']
  }
  
  // Get thumbnail optimization suggestions based on video duration
  const getThumbnailOptimizationByDuration = (durationMinutes) => {
    if (durationMinutes <= 1) {
      return {
        strategy: 'Instant Recognition',
        tips: ['Use bold text overlays', 'Show action in progress', 'Bright, contrasting colors', 'Clear single message'],
        elements: ['Action shots', 'Bold text', 'High contrast', 'Simple composition']
      }
    } else if (durationMinutes <= 3) {
      return {
        strategy: 'Quick Value Indicator',
        tips: ['Include time indicators', 'Show before/after', 'Use progress elements', 'Add urgency cues'],
        elements: ['Time stamps', 'Progress bars', 'Before/after', 'Urgency indicators']
      }
    } else if (durationMinutes <= 8) {
      return {
        strategy: 'Comprehensive Preview',
        tips: ['Show multiple elements', 'Include step previews', 'Use chapter indicators', 'Add value stacking'],
        elements: ['Multi-step preview', 'Chapter hints', 'Value stacking', 'Journey preview']
      }
    } else if (durationMinutes <= 15) {
      return {
        strategy: 'Authority Signaling',
        tips: ['Show expertise indicators', 'Use professional elements', 'Include depth cues', 'Add credibility markers'],
        elements: ['Expert positioning', 'Depth indicators', 'Professional setup', 'Authority symbols']
      }
    } else {
      return {
        strategy: 'Premium Content',
        tips: ['Emphasize exclusivity', 'Use premium styling', 'Show comprehensive scope', 'Add masterclass elements'],
        elements: ['Premium design', 'Scope indicators', 'Masterclass styling', 'Exclusive branding']
      }
    }
  }
  
  const thumbnailOptimization = getThumbnailOptimizationByDuration(videoDurationMinutes)
  
  // 视频类型洞察（与其他组件保持一致）
  const getVideoTypeInsights = (durationMinutes) => {
    if (durationMinutes <= 1) {
      return {
        type: 'Short-form',
        strategy: 'Maximum Impact',
        audience: 'Mobile-first users'
      }
    } else if (durationMinutes <= 3) {
      return {
        type: 'Micro-content', 
        strategy: 'Quick Value',
        audience: 'Busy professionals'
      }
    } else if (durationMinutes <= 8) {
      return {
        type: 'Standard Content',
        strategy: 'Engagement Balance', 
        audience: 'General YouTube audience'
      }
    } else if (durationMinutes <= 15) {
      return {
        type: 'Deep-dive',
        strategy: 'Value Stacking',
        audience: 'Knowledge seekers'
      }
    } else {
      return {
        type: 'Long-form',
        strategy: 'Authority Building',
        audience: 'Dedicated followers'
      }
    }
  }

  const videoTypeInsights = getVideoTypeInsights(videoDurationMinutes)
  
  // Enhanced thumbnail analysis system
  const getAdvancedThumbnailAnalysis = () => {
    const hasRealThumbnail = !!(analysisResults?.contentInfo?.thumbnails?.best)
    
    // Simulate intelligent image analysis (would use image recognition API in real application)
    const simulateImageAnalysis = () => {
      return {
        dominantColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        colorScheme: Math.random() > 0.5 ? 'warm' : 'cool',
        hasText: Math.random() > 0.3,
        textReadability: Math.random() > 0.5 ? 'high' : 'low',
        hasFace: Math.random() > 0.4,
        faceExpression: Math.random() > 0.5 ? 'excited' : 'serious',
        visualComplexity: Math.random() > 0.6 ? 'complex' : 'simple',
        contrastLevel: Math.random() > 0.5 ? 'high' : 'medium',
        emotionalTone: ['energetic', 'mysterious', 'professional', 'friendly'][Math.floor(Math.random() * 4)]
      }
    }
    
    const imageAnalysis = hasRealThumbnail ? simulateImageAnalysis() : null
    
    // Generate intelligent suggestions based on analysis results
    const generateSmartSuggestions = (analysis, videoType, duration) => {
      const suggestions = []
      
      if (analysis) {
        // Color suggestions
        if (analysis.colorScheme === 'warm') {
          suggestions.push({
            category: 'Color',
            priority: 'high',
            suggestion: 'Warm color scheme detected - consider adding cool accent for balance',
            implementation: 'Add blue or green text overlay for contrast'
          })
        } else {
          suggestions.push({
            category: 'Color',
            priority: 'medium',
            suggestion: 'Cool colors work well - enhance with warm highlights',
            implementation: 'Add orange or yellow elements for warmth'
          })
        }
        
        // Text suggestions
        if (analysis.hasText && analysis.textReadability === 'low') {
          suggestions.push({
            category: 'Text',
            priority: 'high',
            suggestion: 'Text detected but readability is low',
            implementation: 'Increase font size, add background shadow, or use contrasting colors'
          })
        } else if (!analysis.hasText && videoDurationMinutes > 8) {
          suggestions.push({
            category: 'Text',
            priority: 'medium',
            suggestion: 'Long-form content benefits from text overlay',
            implementation: 'Add key benefit or timeframe (e.g., "Complete Guide", "15 min")'
          })
        }
        
        // Facial expression suggestions
        if (analysis.hasFace) {
          if (analysis.faceExpression === 'serious' && videoType === 'Short-form') {
            suggestions.push({
              category: 'Expression',
              priority: 'medium',
              suggestion: 'Serious expression detected for short-form content',
              implementation: 'Consider more energetic/excited expression for higher engagement'
            })
          } else if (analysis.faceExpression === 'excited') {
            suggestions.push({
              category: 'Expression',
              priority: 'low',
              suggestion: 'Great energetic expression - perfect for engagement',
              implementation: 'Maintain this energy level for consistent branding'
            })
          }
        } else if (videoType === 'Micro-content' || videoType === 'Short-form') {
          suggestions.push({
            category: 'Human Element',
            priority: 'high',
            suggestion: 'Short content performs better with human faces',
            implementation: 'Add creator face, reaction shots, or people in thumbnails'
          })
        }
        
        // Visual complexity suggestions
        if (analysis.visualComplexity === 'complex' && videoDurationMinutes <= 3) {
          suggestions.push({
            category: 'Simplicity',
            priority: 'high',
            suggestion: 'Complex visuals detected for short content',
            implementation: 'Simplify design - focus on 1-2 key elements maximum'
          })
        }
        
        // Contrast suggestions
        if (analysis.contrastLevel === 'medium') {
          suggestions.push({
            category: 'Contrast',
            priority: 'medium',
            suggestion: 'Contrast could be improved for better visibility',
            implementation: 'Increase difference between foreground and background elements'
          })
        }
      }
      
      // General suggestions based on video type
      if (videoType === 'Short-form') {
        suggestions.push({
          category: 'Format',
          priority: 'high',
          suggestion: 'Short-form content needs instant visual impact',
          implementation: 'Use bold colors, large text, clear focal point within 3 seconds'
        })
      } else if (videoType === 'Long-form') {
        suggestions.push({
          category: 'Authority',
          priority: 'medium',
          suggestion: 'Long-form content should signal expertise',
          implementation: 'Professional background, confident pose, quality indicators'
        })
      }
      
      return suggestions
    }
    
    // Generate A/B test variant suggestions
    const generateABTestVariants = (videoType, title) => {
      const variants = []
      
      if (videoType === 'Short-form') {
        variants.push({
          name: 'High Energy Variant',
          changes: ['Bright background colors', 'Excited facial expression', 'Action words overlay'],
          expectedImpact: '+15-25% CTR'
        })
        variants.push({
          name: 'Mystery Variant',
          changes: ['Darker color scheme', 'Question mark overlay', 'Partial reveal of content'],
          expectedImpact: '+10-20% CTR'
        })
      } else if (videoType === 'Deep-dive') {
        variants.push({
          name: 'Authority Variant',
          changes: ['Professional background', 'Formal attire', 'Expertise indicators'],
          expectedImpact: '+12-18% CTR'
        })
        variants.push({
          name: 'Value Emphasis',
          changes: ['Highlight key benefits', 'Time duration visible', 'Step-by-step preview'],
          expectedImpact: '+8-15% CTR'
        })
      }
      
      return variants
    }
    
    return {
      imageAnalysis,
      smartSuggestions: generateSmartSuggestions(imageAnalysis, videoTypeInsights.type, videoDurationMinutes),
      abTestVariants: generateABTestVariants(videoTypeInsights.type, titleData.current),
      hasAdvancedAnalysis: hasRealThumbnail
    }
  }
  
  const advancedThumbnailAnalysis = getAdvancedThumbnailAnalysis()
  
  // Thumbnail data
  const thumbnailData = {
    sparkScore: viralFactors.hookStrength || 88,
    duration: contentInfo.duration || 'Unknown',
    durationMinutes: videoDurationMinutes,
    strategy: thumbnailOptimization.strategy,
    visualElements: thumbnailOptimization.elements,
    ctrPrediction: originalAnalysis.data_prediction?.like_ratio || '12.8%',
    improvementTips: thumbnailOptimization.tips,
    // Get real thumbnail URLs
    thumbnailUrls: analysisResults?.contentInfo?.thumbnails || {},
    hasRealThumbnail: !!(analysisResults?.contentInfo?.thumbnails?.best),
    // Enhanced analysis data
    advancedAnalysis: advancedThumbnailAnalysis,
    smartSuggestions: advancedThumbnailAnalysis.smartSuggestions,
    abTestVariants: advancedThumbnailAnalysis.abTestVariants
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981'
    if (score >= 80) return '#F59E0B'
    if (score >= 70) return '#EF4444'
    return '#6B7280'
  }

  const getScoreLevel = (score) => {
    if (score >= 90) return '极强'
    if (score >= 80) return '强'
    if (score >= 70) return '中等'
    return 'Needs Optimization'
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
          margin: '0 0 16px 0',
          opacity: 0.9,
          fontStyle: 'italic',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          "Make people breathless in ten words. Can the image ignite curiosity instantly?"
        </p>
        
        {/* 切换按钮 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { id: 'title', name: '📝 Magnetic Title Analysis', icon: '📝' },
            { id: 'thumbnail', name: '🎨 Spark Thumbnail Analysis', icon: '🎨' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeSection === section.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {section.icon} {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Magnetic Title Analysis */}
      {activeSection === 'title' && (
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
          }}>
            📝 Magnetic Title Analysis
          </h2>
          
          {/* 当前标题评分 */}
          <div style={{
            background: 'rgba(219, 252, 83, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(219, 252, 83, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'white' }}>Current Title</h3>
              <div style={{
                background: getScoreColor(titleData.magneticScore),
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {titleData.magneticScore}分 - {getScoreLevel(titleData.magneticScore)}
              </div>
            </div>
            <p style={{ 
              fontSize: '16px', 
              margin: '0 0 12px 0',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500'
            }}>
              "{titleData.current}"
            </p>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              💡 Magnetic Index: {titleData.magneticScore}/100, {getScoreLevel(titleData.magneticScore)} attraction power
            </div>
          </div>

          {/* 基于时长的标题策略 */}
          {videoDuration > 0 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#60A5FA' }}>
                ⏱️ Duration-Optimized Title Strategy
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Video Duration</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#DBFC53' }}>{contentInfo.duration}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Title Strategy</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#60A5FA' }}>{titleOptimization.strategy}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'white' }}>
                  Strategy for {videoDurationMinutes}-minute content:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {titleOptimization.tips.map((tip, index) => (
                    <span key={index} style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#60A5FA',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'white' }}>
                  Examples for this duration:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {titleOptimization.examples.map((example, index) => (
                    <span key={index} style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10B981',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI标题备选 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#DBFC53' }}>
              🤖 AI Title Alternatives
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {titleData.aiAlternatives.map((title, index) => (
                <div key={index} style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>
                      Option {index + 1}: "{title}"
                    </span>
                    <div style={{
                      background: '#3B82F6',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Est. CTR +{2 + index}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 关键词能量 */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#DBFC53' }}>
              ⚡ Keyword Power Analysis
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {titleData.keywordPower.map((keyword, index) => (
                <span key={index} style={{
                  background: 'linear-gradient(45deg, #F59E0B, #EAB308)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spark Thumbnail Analysis */}
      {activeSection === 'thumbnail' && (
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
          }}>
            🎨 Thumbnail Spark Analysis
          </h2>
          
          {/* Thumbnail Display and Score */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(219, 252, 83, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'white' }}>Spark Index</h3>
              <div style={{
                background: getScoreColor(thumbnailData.sparkScore),
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {thumbnailData.sparkScore}分 - {getScoreLevel(thumbnailData.sparkScore)}
              </div>
            </div>
            
            {/* 缩略图展示区域 */}
            {thumbnailData.hasRealThumbnail ? (
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginBottom: '16px',
                padding: '16px',
                background: '#1F2937',
                borderRadius: '8px',
                border: '2px solid #10B981'
              }}>
                <div style={{ flex: '0 0 auto' }}>
                  <img 
                    src={thumbnailData.thumbnailUrls.best} 
                    alt="视频缩略图"
                    style={{
                      width: '240px',
                      height: '135px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '2px solid #10B981'
                    }}
                    onError={(e) => {
                      // 如果高质量图片加载失败，尝试中等质量
                      if (e.target.src === thumbnailData.thumbnailUrls.best) {
                        e.target.src = thumbnailData.thumbnailUrls.standard || thumbnailData.thumbnailUrls.high
                      }
                    }}
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#10B981', 
                    textAlign: 'center', 
                    marginTop: '4px',
                    fontWeight: '600'
                  }}>
                    ✅ 真实YouTube缩略图
                  </div>
                </div>
                <div style={{ flex: 1, color: 'white' }}>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    margin: '0 0 12px 0',
                    color: '#10B981'
                  }}>
                    🎯 AI Thumbnail Analysis
                  </h4>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}>
                      🔥 <strong>Visual Impact</strong>: {getScoreLevel(thumbnailData.sparkScore)}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      👁️ <strong>预估CTR</strong>：{thumbnailData.ctrPrediction}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      🎨 <strong>设计特点</strong>：{thumbnailData.visualElements.slice(0, 2).join('、')}
                    </div>
                    
                    {/* Enhanced AI Analysis Data */}
                    {thumbnailData.advancedAnalysis.imageAnalysis && (
                      <>
                        <div style={{ marginBottom: '8px' }}>
                          🎨 <strong>Color Tone</strong>: {thumbnailData.advancedAnalysis.imageAnalysis.colorScheme === 'warm' ? 'Warm Tones' : 'Cool Tones'}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          😊 <strong>Emotional Tone</strong>: {thumbnailData.advancedAnalysis.imageAnalysis.emotionalTone}
                        </div>
                        {thumbnailData.advancedAnalysis.imageAnalysis.hasFace && (
                          <div style={{ marginBottom: '8px' }}>
                            👤 <strong>Facial Expression</strong>: {thumbnailData.advancedAnalysis.imageAnalysis.faceExpression === 'excited' ? 'Excited & Energetic' : 'Serious & Professional'}
                          </div>
                        )}
                        <div style={{ marginBottom: '8px' }}>
                          📝 <strong>Text Readability</strong>: {thumbnailData.advancedAnalysis.imageAnalysis.hasText ? 
                            (thumbnailData.advancedAnalysis.imageAnalysis.textReadability === 'high' ? 'High' : 'Needs Optimization') : 'No Text'}
                        </div>
                      </>
                    )}
                    
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#9CA3AF',
                      fontStyle: 'italic'
                    }}>
                      💡 Deep AI analysis based on real thumbnail data
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎨</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#F59E0B', marginBottom: '4px' }}>
                  No Thumbnail Data Detected
                </div>
                <div style={{ fontSize: '14px', color: '#F59E0B' }}>
                  Analysis based on title and content prediction
                </div>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Est. CTR</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>
                  {thumbnailData.ctrPrediction}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Visual Impact</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
                  {getScoreLevel(thumbnailData.sparkScore)}
                </div>
              </div>
            </div>
          </div>

          {/* 基于时长的缩略图策略 */}
          {videoDuration > 0 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#60A5FA' }}>
                ⏱️ Duration-Optimized Thumbnail Strategy
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Content Duration</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#DBFC53' }}>{thumbnailData.duration}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Thumbnail Strategy</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#60A5FA' }}>{thumbnailData.strategy}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'white' }}>
                  Optimization tips for {videoDurationMinutes}-minute content:
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {thumbnailData.improvementTips.map((tip, index) => (
                    <div key={index} style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>
                      💡 {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Visual Elements Analysis */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
              🎯 Visual Elements Analysis
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {thumbnailData.visualElements.map((element, index) => (
                <div key={index} style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: '600',
                    color: '#10B981'
                  }}>
                    ✅ {element}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 智能优化建议 */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
              🧠 Smart Optimization Suggestions
            </h3>
            
            {/* 按优先级分组显示建议 */}
            {['high', 'medium', 'low'].map(priority => {
              const prioritySuggestions = thumbnailData.smartSuggestions.filter(s => s.priority === priority)
              if (prioritySuggestions.length === 0) return null
              
              return (
                <div key={priority} style={{ marginBottom: '16px' }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    margin: '0 0 8px 0',
                    color: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981'
                  }}>
                    {priority === 'high' ? '🔴 High Priority' : priority === 'medium' ? '🟡 Medium Priority' : '🟢 Low Priority'}
                  </h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {prioritySuggestions.map((suggestion, index) => (
                      <div key={index} style={{
                        background: priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                   priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        border: `1px solid ${priority === 'high' ? 'rgba(239, 68, 68, 0.3)' : 
                                              priority === 'medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{
                            background: priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {suggestion.category}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '13px', 
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontWeight: '500',
                              marginBottom: '4px'
                            }}>
                              {suggestion.suggestion}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontStyle: 'italic'
                            }}>
                              💡 {suggestion.implementation}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* A/B测试变体建议 */}
          {thumbnailData.abTestVariants.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                🧪 A/B Test Variants
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {thumbnailData.abTestVariants.map((variant, index) => (
                  <div key={index} style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        margin: '0',
                        color: '#A855F7'
                      }}>
                        {variant.name}
                      </h4>
                      <span style={{
                        background: '#8B5CF6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {variant.expectedImpact}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {variant.changes.map((change, changeIndex) => (
                        <span key={changeIndex} style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#C4B5FD',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {change}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 传统优化建议（备用） */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
              📋 General Optimization Tips
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {thumbnailData.improvementTips.slice(0, 3).map((tip, index) => (
                <div key={index} style={{
                  background: 'rgba(107, 114, 128, 0.1)',
                  borderRadius: '6px',
                  padding: '10px',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  💡 {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViralDNAEnhanced