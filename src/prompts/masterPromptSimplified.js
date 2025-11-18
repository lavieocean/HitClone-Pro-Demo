/**
 * HitClone Pro – Master Prompt v2.3 (Simplified)
 * 优化重点：简化JSON结构，提高AI响应稳定性，减少解析失败
 * 保留核心分析功能，降低输出复杂度
 */

export const generateSimplifiedMasterPrompt = (input) => {
  const { fileName, data } = input
  const lineCount = data?.subtitles?.length || 0
  const duration = `${Math.floor((data?.analysisData?.totalDuration || 0) / 60)}分${Math.floor((data?.analysisData?.totalDuration || 0) % 60)}秒`
  const wordCount = data?.analysisData?.totalWords || 0
  const previewLines = (data?.subtitles?.slice(0, 15) || []).map(sub => `${sub.start}s: ${sub.text}`)
  
  // 提取真实YouTube API数据
  const youtubeData = data?.contentInfo || {}
  const hasRealData = youtubeData?.hasAutoData || false
  
  return `
你是「HitClone Pro AI 策略官 v2.3」，专注于YouTube内容分析和优化建议。
🎯 目标：基于字幕内容生成实用的创作者报告，输出简化JSON格式。

============  输入数据  ============ 
文件: ${fileName}
时长: ${duration} (${lineCount}条字幕)
字数: ${wordCount}

字幕预览:
${previewLines.join('\n')}

真实数据${hasRealData ? '已获取' : '缺失'}:
${hasRealData ? `
标题: ${youtubeData.title || '未知'}
频道: ${youtubeData.channelName || '未知'}
观看: ${youtubeData.viewCount || '未知'}
点赞: ${youtubeData.likeCount || '未知'}` : '基于字幕内容进行推断分析'}

============  分析要求  ============ 

1️⃣ 内容核心分析
• 视频主要内容和价值点
• 目标受众定位
• 核心创意或观点

2️⃣ 传播潜力评估  
• 开场吸引力 (Hook效果)
• 情感触发点
• 分享价值分析
• 算法友好度

3️⃣ 优化建议
• 黄金片段识别
• 标题优化建议
• 节奏改进要点

4️⃣ 行动计划
• 立即可执行的改进措施
• 中期优化建议

============  简化JSON输出  ============ 

请输出以下格式的JSON，不要添加markdown标记：

{
  "meta": {
    "version": "2.3",
    "analysis_timestamp": "${new Date().toISOString()}",
    "data_quality": "${hasRealData ? '高' : '中'}",
    "confidence": 0.85
  },
  "video_summary": {
    "title": "基于内容推测的视频标题",
    "main_topic": "核心主题描述",
    "target_audience": "目标受众",
    "content_type": "教程/娱乐/评测/其他",
    "big_idea": "视频的核心价值或观点"
  },
  "viral_factors": {
    "hookStrength": 85,
    "emotionalTrigger": 88,
    "shareability": 82,
    "retention": 79,
    "curiosityGap": 86,
    "overall_score": 84
  },
  "golden_clips": [
    {
      "time": "1:20-1:50",
      "description": "核心观点阐述",
      "shorts_potential": 90,
      "reason": "适合制作Shorts的原因"
    }
  ],
  "optimization": {
    "title_suggestions": ["优化标题1", "优化标题2", "优化标题3"],
    "rhythm_advice": "节奏优化建议",
    "engagement_tips": "提高互动的具体方法"
  },
  "action_board": [
    {
      "task": "具体可执行的任务",
      "priority": "high",
      "estimated_time": "30分钟",
      "expected_impact": "预期效果"
    },
    {
      "task": "中期优化任务", 
      "priority": "medium",
      "estimated_time": "2小时",
      "expected_impact": "长期价值"
    }
  ],
  "monetization": {
    "rpm_estimate": "$8-15",
    "sponsor_potential": "中",
    "monthly_estimate": "$1,200-2,500"
  },
  "next_steps": {
    "immediate": "立即采取的行动",
    "weekly": "本周重点任务",
    "monthly": "月度目标规划"
  }
}

============  重要提醒  ============ 
1. 输出纯净JSON，无markdown标记
2. 所有数值基于字幕内容分析
3. 建议要具体可执行
4. 评分范围0-100分
5. 优先输出高价值、低复杂度的建议

请开始分析：
`
}

// 备用简化prompt，当主要prompt失败时使用
export const generateFallbackPrompt = (input) => {
  return `
分析这个视频内容，输出简化JSON：

输入：${input.fileName} (${input.data?.subtitles?.length || 0}条字幕)

要求输出格式：
{
  "summary": "视频内容摘要",
  "score": 85,
  "strengths": ["优势1", "优势2"],
  "improvements": ["改进点1", "改进点2"],
  "action": "立即可执行的建议"
}

内容：${(input.data?.subtitles?.slice(0, 10) || []).map(s => s.text).join(' ')}
`
}

export { generateMasterPrompt } from './masterPrompt.js'