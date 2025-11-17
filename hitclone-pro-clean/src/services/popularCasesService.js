/**
 * 热门案例服务
 * 基于真实分析历史生成动态热门案例
 */

class PopularCasesService {
  constructor() {
    this.cacheKey = 'hitclone-popular-cases-cache'
    this.cacheTimeout = 60 * 60 * 1000 // 1小时缓存
    this.minCasesForDynamic = 3 // 最少需要3个历史案例才使用动态模式
    
    // 备用精选案例（当历史数据不足时使用）
    this.fallbackCases = [
      {
        title: "When Your Body Attacks Itself – Autoimmune",
        channel: "Kurzgesagt – In a Nutshell",
        views: "8.2M views",
        score: 92,
        category: "education",
        tags: ["科学", "教育", "动画"],
        isRealData: false,
        isFallback: true,
        thumbnail: "🧬"
      },
      {
        title: "AI Explains: Why We Age and Die",
        channel: "Veritasium",
        views: "12.5M views", 
        score: 89,
        category: "tech",
        tags: ["AI", "科学", "技术"],
        isRealData: false,
        isFallback: true,
        thumbnail: "🤖"
      },
      {
        title: "The Psychology of Money",
        channel: "TED",
        views: "5.8M views",
        score: 87,
        category: "business",
        tags: ["心理学", "金钱", "投资"],
        isRealData: false,
        isFallback: true,
        thumbnail: "💰"
      },
      {
        title: "How to Build Anything",
        channel: "MrBeast",
        views: "25M views",
        score: 95,
        category: "entertainment",
        tags: ["挑战", "创造", "娱乐"],
        isRealData: false,
        isFallback: true,
        thumbnail: "🏗️"
      },
      {
        title: "The Future of Music with AI",
        channel: "NPR Music",
        views: "3.2M views",
        score: 85,
        category: "music",
        tags: ["音乐", "AI", "未来"],
        isRealData: false,
        isFallback: true,
        thumbnail: "🎵"
      },
      {
        title: "Gaming Evolution: Past to Future",
        channel: "Dream",
        views: "18M views",
        score: 88,
        category: "gaming",
        tags: ["游戏", "历史", "发展"],
        isRealData: false,
        isFallback: true,
        thumbnail: "🎮"
      }
    ]
  }

  /**
   * 获取所有历史分析报告
   */
  getHistoryReports() {
    try {
      const saved = localStorage.getItem('hitclone-analysis-history')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('加载历史报告失败:', error)
      return []
    }
  }

  /**
   * 计算报告的综合评分
   */
  calculateScore(report) {
    let score = 0
    
    // 基础病毒因子评分 (40%权重)
    if (report.score && typeof report.score === 'number') {
      score += report.score * 0.4
    }
    
    // 观看数权重 (30%权重)
    const views = this.parseViewCount(report.views)
    if (views > 0) {
      // 使用对数缩放，1M views = 20分，10M = 25分，100M = 30分
      const viewScore = Math.min(30, 15 + Math.log10(views / 100000) * 5)
      score += viewScore * 0.3
    }
    
    // 真实数据奖励 (15%权重)
    if (report.analysisResults?.contentInfo?.hasAutoData) {
      score += 20 * 0.15
    }
    
    // 时间奖励 (15%权重) - 最近的分析获得奖励
    const daysSinceAnalysis = this.getDaysSinceAnalysis(report.analysisDate)
    const timeScore = Math.max(0, 20 - daysSinceAnalysis * 2) // 每天减2分
    score += timeScore * 0.15
    
    return Math.round(score)
  }

  /**
   * 解析观看数字符串为数字
   */
  parseViewCount(viewsStr) {
    if (!viewsStr || typeof viewsStr !== 'string') return 0
    
    const cleanStr = viewsStr.toLowerCase().replace(/[,\s]/g, '')
    const number = parseFloat(cleanStr)
    
    if (cleanStr.includes('m')) return number * 1000000
    if (cleanStr.includes('k')) return number * 1000
    if (cleanStr.includes('万')) return number * 10000
    if (cleanStr.includes('亿')) return number * 100000000
    
    return number || 0
  }

  /**
   * 计算距离分析时间的天数
   */
  getDaysSinceAnalysis(analysisDate) {
    if (!analysisDate) return 999
    
    try {
      const analyzeTime = new Date(analysisDate)
      const now = new Date()
      const diffTime = Math.abs(now - analyzeTime)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch (error) {
      return 999
    }
  }

  /**
   * 格式化时间显示
   */
  formatTimeAgo(analysisDate) {
    if (!analysisDate) return '未知时间'
    
    try {
      const analyzeTime = new Date(analysisDate)
      const now = new Date()
      const diffTime = Math.abs(now - analyzeTime)
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffHours < 1) return '刚刚'
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      
      return analyzeTime.toLocaleDateString('zh-CN')
    } catch (error) {
      return '未知时间'
    }
  }

  /**
   * 生成动态标签
   */
  generateTags(report, allReports, isTopScore = false, isRecent = false) {
    const tags = []
    
    // 评分相关标签
    if (isTopScore) {
      tags.push({ text: '🏆 殿堂级', color: '#DBFC53' })
    } else if (report.score >= 90) {
      tags.push({ text: '⭐ 高分析', color: '#10B981' })
    }
    
    // 时间相关标签
    if (isRecent) {
      tags.push({ text: '⚡ 刚刚分析', color: '#F59E0B' })
    }
    
    // 数据类型标签
    if (report.analysisResults?.contentInfo?.hasAutoData) {
      tags.push({ text: '🤖 真实数据', color: '#3B82F6' })
    }
    
    // 本周最热（最近7天的高分报告）
    const daysSince = this.getDaysSinceAnalysis(report.analysisDate)
    if (daysSince <= 7 && report.score >= 85) {
      tags.push({ text: '🔥 本周最热', color: '#EF4444' })
    }
    
    return tags
  }

  /**
   * 获取热门案例列表
   */
  getPopularCases(count = 6) {
    console.log('🔥 获取热门案例，数量:', count)
    
    // 尝试从缓存获取
    const cached = this.getCachedCases()
    if (cached && cached.length >= count) {
      console.log('📦 使用缓存的热门案例:', cached.length)
      return this.shuffleArray(cached).slice(0, count)
    }
    
    // 获取历史报告
    const historyReports = this.getHistoryReports()
    console.log('📊 历史报告数量:', historyReports.length)
    
    // 如果历史数据不足，使用备用案例
    if (historyReports.length < this.minCasesForDynamic) {
      console.log('📄 历史数据不足，使用备用案例')
      return this.shuffleArray(this.fallbackCases).slice(0, count)
    }
    
    // 计算评分并排序
    const scoredReports = historyReports.map(report => ({
      ...report,
      calculatedScore: this.calculateScore(report),
      timeAgo: this.formatTimeAgo(report.analysisDate)
    }))
    
    // 排序获取Top20
    const top20 = scoredReports
      .sort((a, b) => b.calculatedScore - a.calculatedScore)
      .slice(0, 20)
    
    console.log('🏆 Top20 案例评分范围:', 
      top20.length > 0 ? `${top20[top20.length-1].calculatedScore} - ${top20[0].calculatedScore}` : '无数据'
    )
    
    // 生成标签
    const casesWithTags = top20.map((report, index) => ({
      ...report,
      tags: this.generateTags(
        report, 
        top20, 
        index < 3, // 前3名为殿堂级
        this.getDaysSinceAnalysis(report.analysisDate) <= 1 // 1天内为最新
      )
    }))
    
    // 缓存结果
    this.setCachedCases(casesWithTags)
    
    // 随机选择并返回
    return this.shuffleArray(casesWithTags).slice(0, count)
  }

  /**
   * 洗牌算法
   */
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * 获取缓存的案例
   */
  getCachedCases() {
    try {
      const cached = localStorage.getItem(this.cacheKey)
      if (!cached) return null
      
      const { data, timestamp } = JSON.parse(cached)
      
      // 检查缓存是否过期
      if (Date.now() - timestamp > this.cacheTimeout) {
        localStorage.removeItem(this.cacheKey)
        return null
      }
      
      return data
    } catch (error) {
      console.error('获取缓存失败:', error)
      return null
    }
  }

  /**
   * 设置缓存
   */
  setCachedCases(cases) {
    try {
      const cacheData = {
        data: cases,
        timestamp: Date.now()
      }
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
      console.log('💾 热门案例已缓存，数量:', cases.length)
    } catch (error) {
      console.error('设置缓存失败:', error)
    }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    localStorage.removeItem(this.cacheKey)
    console.log('🧹 热门案例缓存已清除')
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const historyReports = this.getHistoryReports()
    
    if (historyReports.length === 0) {
      return {
        totalAnalyses: 0,
        averageScore: 0,
        topChannel: '暂无数据',
        totalChannels: 0
      }
    }
    
    // 计算平均分
    const validScores = historyReports.filter(r => r.score && typeof r.score === 'number')
    const averageScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length)
      : 0
    
    // 统计频道
    const channelCounts = {}
    historyReports.forEach(report => {
      const channel = report.channel || '未知频道'
      channelCounts[channel] = (channelCounts[channel] || 0) + 1
    })
    
    const topChannel = Object.keys(channelCounts).reduce((a, b) => 
      channelCounts[a] > channelCounts[b] ? a : b, '暂无数据'
    )
    
    return {
      totalAnalyses: historyReports.length,
      averageScore,
      topChannel,
      totalChannels: Object.keys(channelCounts).length
    }
  }
}

// 创建全局实例
const popularCasesService = new PopularCasesService()

export default popularCasesService