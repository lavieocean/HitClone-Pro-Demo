/**
 * 完整报告导出器
 * 一键导出所有Tab的完整内容
 */

class CompleteReportExporter {
  constructor() {
    this.version = '2.1-complete'
    this.exportProgress = null
  }

  /**
   * 导出完整报告
   */
  async exportCompleteReport(analysisResults, currentInput = null) {
    try {
      console.log('🚀 开始导出完整报告...')
      
      // 1. 显示进度提示
      this.showProgressIndicator()
      
      // 2. 获取所有Tab信息
      const allTabs = this.getAllTabsInfo()
      this.updateProgress(`发现 ${allTabs.length} 个分析维度`)
      
      // 3. 遍历所有Tab并收集内容
      const allTabsContent = await this.collectAllTabsContent(allTabs)
      
      // 4. 生成完整HTML
      const cleanData = this.sanitizeData(analysisResults, currentInput)
      this.updateProgress('生成完整HTML文件...')
      const htmlContent = this.generateCompleteHTML(cleanData, allTabsContent)
      
      // 5. 下载文件
      this.updateProgress('准备下载...')
      this.downloadHTML(htmlContent, cleanData.meta)
      
      // 6. 显示成功提示
      this.hideProgressIndicator()
      this.showSuccessMessage(allTabs.length)
      
      console.log('✅ 完整报告导出成功')
      return true
    } catch (error) {
      console.error('❌ 完整报告导出失败:', error)
      this.hideProgressIndicator()
      this.showErrorMessage(error.message)
      throw error
    }
  }

  /**
   * 获取所有Tab信息
   */
  getAllTabsInfo() {
    const tabs = [
      { 
        id: 'creator-focused', 
        name: 'Viral DNA Decoder', 
        subtitle: 'What would you miss if you don\'t click today?',
        icon: '🧬',
        selector: '.tab-button'
      },
      { 
        id: 'viral-dna', 
        name: 'Magnetic Title + Spark Thumbnail', 
        subtitle: 'Make people breathless in ten words',
        icon: '🔥',
        selector: '.tab-button'
      },
      { 
        id: 'emotional-rollercoaster', 
        name: 'Story Spine + Interaction Insights', 
        subtitle: 'Which minute holds the emotional peak?',
        icon: '💗',
        selector: '.tab-button'
      },
      { 
        id: 'watch-time-hacks', 
        name: '10s Hook + Retention Triggers', 
        subtitle: 'Will viewers pay 10 minutes of their life?',
        icon: '⚡',
        selector: '.tab-button'
      },
      { 
        id: 'heros-journey', 
        name: 'Hero\'s Journey', 
        subtitle: 'Classic narrative structure analysis',
        icon: '🏔️',
        selector: '.tab-button'
      },
      { 
        id: 'money-shots', 
        name: 'Money Shots', 
        subtitle: 'Best 30 seconds for short clips',
        icon: '💰',
        selector: '.tab-button'
      },
      { 
        id: 'full-report', 
        name: 'Full Report + Next Experiments', 
        subtitle: 'How to clone this viral DNA?',
        icon: '📋',
        selector: '.tab-button'
      }
    ]

    // 只返回在DOM中实际存在的Tab
    return tabs.filter(tab => {
      const buttons = Array.from(document.querySelectorAll('.tab-button'))
      return buttons.some(btn => {
        const tabName = btn.querySelector('.tab-name')?.textContent
        if (!tabName) return false
        
        // 特殊处理各种Tab名称 - 更新为英文识别
        switch (tab.id) {
          case 'creator-focused':
            return tabName.includes('Viral DNA Decoder') || tabName.includes('爆款DNA解码器')
          case 'viral-dna':
            return tabName.includes('Magnetic Title') || tabName.includes('Spark Thumbnail') || 
                   tabName.includes('磁力标题') || tabName.includes('火花缩略图')
          case 'emotional-rollercoaster':
            return tabName.includes('Story Spine') || tabName.includes('Interaction Insights') ||
                   tabName.includes('故事脊柱') || tabName.includes('评论脉搏')
          case 'watch-time-hacks':
            return tabName.includes('10s Hook') || tabName.includes('Retention Triggers') ||
                   tabName.includes('10秒开场') || tabName.includes('留存触发器')
          case 'heros-journey':
            return tabName.includes('Hero\'s Journey') || tabName.includes('英雄之旅')
          case 'money-shots':
            return tabName.includes('Money Shots') || tabName.includes('黄金片段')
          case 'full-report':
            return tabName.includes('Full Report') || tabName.includes('Next Experiments') ||
                   tabName.includes('完整报告') || tabName.includes('下期实验')
          default:
            return tabName.includes(tab.name.split('+')[0])
        }
      })
    })
  }

  /**
   * 收集所有Tab的内容
   */
  async collectAllTabsContent(allTabs) {
    const tabContents = {}
    const originalActiveTab = this.getCurrentActiveTab()
    
    console.log(`📋 开始收集 ${allTabs.length} 个Tab的内容...`)
    
    for (let i = 0; i < allTabs.length; i++) {
      const tab = allTabs[i]
      const progress = `(${i + 1}/${allTabs.length})`
      
      try {
        this.updateProgress(`正在收集：${tab.name} ${progress}`)
        console.log(`📄 收集 ${tab.name} 内容...`)
        
        // 切换到目标Tab
        await this.switchToTab(tab)
        
        // 等待内容渲染
        await this.waitForTabRender()
        
        // 获取渲染后的内容
        const content = await this.getTabContent(tab)
        tabContents[tab.id] = {
          ...tab,
          content: content
        }
        
        console.log(`✅ ${tab.name} 内容收集完成`)
        
      } catch (error) {
        console.error(`❌ 收集 ${tab.name} 失败:`, error)
        tabContents[tab.id] = {
          ...tab,
          content: this.generateErrorContent(tab, error.message)
        }
      }
    }
    
    // 恢复原来的Tab
    if (originalActiveTab) {
      await this.switchToTab(originalActiveTab)
    }
    
    console.log('✅ 所有Tab内容收集完成')
    return tabContents
  }

  /**
   * 获取当前激活的Tab
   */
  getCurrentActiveTab() {
    try {
      const activeButton = document.querySelector('.tab-button.active')
      if (!activeButton) return null
      
      const tabName = activeButton.querySelector('.tab-name')?.textContent
      if (!tabName) return null
      
      const allTabs = this.getAllTabsInfo()
      return allTabs.find(tab => {
        switch (tab.id) {
          case 'creator-focused':
            return tabName.includes('Viral DNA Decoder') || tabName.includes('爆款DNA解码器')
          case 'viral-dna':
            return tabName.includes('Magnetic Title') || tabName.includes('Spark Thumbnail') || 
                   tabName.includes('磁力标题') || tabName.includes('火花缩略图')
          case 'emotional-rollercoaster':
            return tabName.includes('Story Spine') || tabName.includes('Interaction Insights') ||
                   tabName.includes('故事脊柱') || tabName.includes('评论脉搏')
          case 'watch-time-hacks':
            return tabName.includes('10s Hook') || tabName.includes('Retention Triggers') ||
                   tabName.includes('10秒开场') || tabName.includes('留存触发器')
          case 'heros-journey':
            return tabName.includes('Hero\'s Journey') || tabName.includes('英雄之旅')
          case 'money-shots':
            return tabName.includes('Money Shots') || tabName.includes('黄金片段')
          case 'full-report':
            return tabName.includes('Full Report') || tabName.includes('Next Experiments') ||
                   tabName.includes('完整报告') || tabName.includes('下期实验')
          default:
            return tabName.includes(tab.name.split('+')[0])
        }
      })
    } catch (error) {
      console.error('获取当前Tab失败:', error)
      return null
    }
  }

  /**
   * 切换到指定Tab
   */
  async switchToTab(targetTab) {
    const buttons = Array.from(document.querySelectorAll('.tab-button'))
    const targetButton = buttons.find(btn => {
      const tabName = btn.querySelector('.tab-name')?.textContent
      if (!tabName) return false
      
      // 使用相同的英文/中文双重识别逻辑
      switch (targetTab.id) {
        case 'creator-focused':
          return tabName.includes('Viral DNA Decoder') || tabName.includes('爆款DNA解码器')
        case 'viral-dna':
          return tabName.includes('Magnetic Title') || tabName.includes('Spark Thumbnail') ||
                 tabName.includes('磁力标题') || tabName.includes('火花缩略图')
        case 'emotional-rollercoaster':
          return tabName.includes('Story Spine') || tabName.includes('Interaction Insights') ||
                 tabName.includes('故事脊柱') || tabName.includes('评论脉搏')
        case 'watch-time-hacks':
          return tabName.includes('10s Hook') || tabName.includes('Retention Triggers') ||
                 tabName.includes('10秒开场') || tabName.includes('留存触发器')
        case 'heros-journey':
          return tabName.includes('Hero\'s Journey') || tabName.includes('英雄之旅')
        case 'money-shots':
          return tabName.includes('Money Shots') || tabName.includes('黄金片段')
        case 'full-report':
          return tabName.includes('Full Report') || tabName.includes('Next Experiments') ||
                 tabName.includes('完整报告') || tabName.includes('下期实验')
        default:
          return tabName.includes(targetTab.name.split('+')[0])
      }
    })
    
    if (targetButton) {
      console.log(`🔄 切换到Tab: ${targetTab.name}`)
      targetButton.click()
      await this.wait(100) // 等待React状态更新
    } else {
      throw new Error(`未找到 ${targetTab.name} 的Tab按钮`)
    }
  }

  /**
   * 等待Tab渲染完成
   */
  async waitForTabRender() {
    // 等待React重新渲染
    await this.wait(200)
    
    // 等待D3图表渲染
    await this.waitForD3Charts()
    
    // 等待图片加载
    await this.waitForImages()
    
    // 额外等待时间确保所有内容稳定
    await this.wait(300)
  }

  /**
   * 等待D3图表渲染完成
   */
  async waitForD3Charts() {
    const maxWait = 2000 // 最多等待2秒
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWait) {
      const svgElements = document.querySelectorAll('.report-content svg')
      const chartContainers = document.querySelectorAll('.chart-container, .emotion-chart')
      
      // 检查是否有空的图表容器
      let hasEmptyCharts = false
      chartContainers.forEach(container => {
        if (container.children.length === 0) {
          hasEmptyCharts = true
        }
      })
      
      // 如果没有空图表或者已经有SVG了，就认为渲染完成
      if (!hasEmptyCharts || svgElements.length > 0) {
        break
      }
      
      await this.wait(50)
    }
  }

  /**
   * 等待图片加载完成
   */
  async waitForImages() {
    const images = Array.from(document.querySelectorAll('.report-content img'))
    if (images.length === 0) return
    
    const imagePromises = images.map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = resolve
          img.onerror = resolve
          setTimeout(resolve, 1000) // 1秒超时
        }
      })
    })
    
    await Promise.all(imagePromises)
  }

  /**
   * 获取Tab内容
   */
  async getTabContent(tab) {
    try {
      const reportContent = document.querySelector('.report-content')
      if (!reportContent) {
        throw new Error('未找到报告内容容器')
      }

      // 克隆内容
      const contentClone = reportContent.cloneNode(true)
      
      // 清理和修复内容
      this.cleanupTabContent(contentClone)
      this.fixTabStyles(contentClone)
      
      return contentClone.innerHTML
    } catch (error) {
      console.error(`获取 ${tab.name} 内容失败:`, error)
      return this.generateErrorContent(tab, error.message)
    }
  }

  /**
   * 清理Tab内容
   */
  cleanupTabContent(element) {
    // 移除按钮的事件处理
    const buttons = element.querySelectorAll('button')
    buttons.forEach(btn => {
      btn.removeAttribute('onclick')
      btn.style.cursor = 'default'
      btn.style.pointerEvents = 'none'
    })
    
    // 确保SVG可见
    const svgs = element.querySelectorAll('svg')
    svgs.forEach(svg => {
      svg.style.maxWidth = '100%'
      svg.style.height = 'auto'
      svg.style.display = 'block'
    })
  }

  /**
   * 修复Tab样式
   */
  fixTabStyles(element) {
    // 内联重要样式
    const allElements = element.querySelectorAll('*')
    allElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el)
      
      // 保持关键样式
      const criticalStyles = [
        'backgroundColor',
        'color',
        'fontSize',
        'fontWeight',
        'padding',
        'margin',
        'borderRadius',
        'display',
        'flexDirection',
        'alignItems',
        'justifyContent'
      ]
      
      criticalStyles.forEach(style => {
        if (computedStyle[style] && computedStyle[style] !== 'initial') {
          el.style[style] = computedStyle[style]
        }
      })
    })
  }

  /**
   * 生成错误内容
   */
  generateErrorContent(tab, errorMessage) {
    return `
      <div style="text-align: center; padding: 60px 20px; color: white;">
        <h2 style="color: #EF4444; margin-bottom: 16px;">${tab.icon} ${tab.name}</h2>
        <p style="margin-bottom: 12px; opacity: 0.8;">内容收集失败</p>
        <p style="font-size: 14px; opacity: 0.6;">${errorMessage}</p>
        <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.1); border-radius: 8px;">
          <p style="font-size: 14px;">请在在线版本中查看此分析维度的完整内容</p>
        </div>
      </div>
    `
  }

  /**
   * 等待函数
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 显示进度指示器
   */
  showProgressIndicator() {
    // 创建进度指示器
    this.exportProgress = document.createElement('div')
    this.exportProgress.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 24px 32px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      z-index: 10000;
      text-align: center;
      min-width: 300px;
      backdrop-filter: blur(10px);
    `
    
    this.exportProgress.innerHTML = `
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">📋 导出完整报告</div>
      <div id="progress-text" style="font-size: 14px; opacity: 0.8; margin-bottom: 16px;">准备中...</div>
      <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
        <div id="progress-bar" style="width: 0%; height: 100%; background: #10B981; transition: width 0.3s ease;"></div>
      </div>
    `
    
    document.body.appendChild(this.exportProgress)
  }

  /**
   * 更新进度
   */
  updateProgress(text, progress = null) {
    if (!this.exportProgress) return
    
    const progressText = this.exportProgress.querySelector('#progress-text')
    const progressBar = this.exportProgress.querySelector('#progress-bar')
    
    if (progressText) {
      progressText.textContent = text
    }
    
    if (progress !== null && progressBar) {
      progressBar.style.width = `${progress}%`
    }
    
    console.log(`📊 导出进度: ${text}`)
  }

  /**
   * 隐藏进度指示器
   */
  hideProgressIndicator() {
    if (this.exportProgress && this.exportProgress.parentNode) {
      this.exportProgress.parentNode.removeChild(this.exportProgress)
      this.exportProgress = null
    }
  }

  /**
   * 数据清理
   */
  sanitizeData(analysisResults, currentInput) {
    const videoTitle = currentInput?.data?.title || 
                      analysisResults?.contentInfo?.title || 
                      analysisResults?.meta?.video_title || 
                      '视频分析报告'

    const channelName = currentInput?.data?.channel || 
                       analysisResults?.contentInfo?.channel || 
                       '未知频道'

    return {
      analysisResults,
      meta: {
        title: videoTitle,
        channel: channelName,
        exportTime: new Date().toLocaleString('zh-CN'),
        version: this.version
      }
    }
  }

  /**
   * 生成完整HTML
   */
  generateCompleteHTML(data, allTabsContent) {
    const tabsArray = Object.values(allTabsContent)
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitClone Pro 完整分析报告 - ${data.meta.title}</title>
    <style>
        ${this.getCompleteCSS()}
    </style>
</head>
<body>
    <div id="complete-report-container">
        ${this.generateReportHeader(data, tabsArray.length)}
        ${this.generateTabNavigation(tabsArray)}
        ${this.generateAllTabContents(tabsArray)}
        ${this.generateReportFooter(data, tabsArray.length)}
    </div>
    
    <script>
        ${this.generateInteractiveJS(tabsArray)}
    </script>
</body>
</html>`
  }

  /**
   * 生成报告头部
   */
  generateReportHeader(data, tabCount) {
    return `
      <div class="report-header">
        <h1>${data.meta.title}</h1>
        <div class="report-details">
          <span>📺 ${data.meta.channel}</span>
          <span>📊 完整分析报告 (${tabCount}个维度)</span>
          <span>📅 导出时间: ${data.meta.exportTime}</span>
          <span>🏷️ ${data.meta.version}</span>
        </div>
        <div class="report-description">
          <p>此报告包含HitClone Pro的完整分析结果，展示了心理触发式语言设计和创作者视角的产品创新</p>
        </div>
      </div>
    `
  }

  /**
   * 生成Tab导航
   */
  generateTabNavigation(tabsArray) {
    return `
      <div class="report-tabs">
        ${tabsArray.map((tab, index) => `
          <button class="tab-button ${index === 0 ? 'active' : ''}" onclick="switchTab('${tab.id}')">
            <div class="tab-header">
              <span class="tab-icon">${tab.icon}</span>
              <span class="tab-name">${tab.name}</span>
            </div>
            <span class="tab-subtitle">${tab.subtitle}</span>
          </button>
        `).join('')}
      </div>
    `
  }

  /**
   * 生成所有Tab内容
   */
  generateAllTabContents(tabsArray) {
    return `
      <div class="report-content-container">
        ${tabsArray.map((tab, index) => `
          <div id="${tab.id}" class="tab-content ${index === 0 ? 'active' : ''}">
            ${tab.content}
          </div>
        `).join('')}
      </div>
    `
  }

  /**
   * 生成页脚
   */
  generateReportFooter(data, tabCount) {
    return `
      <div class="report-footer">
        <div class="footer-content">
          <h3>📋 HitClone Pro 完整分析报告</h3>
          <p>包含 ${tabCount} 个分析维度的完整内容</p>
          <div class="footer-stats">
            <span>导出时间: ${data.meta.exportTime}</span>
            <span>版本: ${data.meta.version}</span>
            <span>心理触发式语言设计</span>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 生成CSS样式
   */
  getCompleteCSS() {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: white;
      }
      
      #complete-report-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .report-header {
        background: rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 24px;
        backdrop-filter: blur(10px);
      }
      
      .report-header h1 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 12px;
      }
      
      .report-details {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        margin-bottom: 16px;
        opacity: 0.9;
      }
      
      .report-details span {
        font-size: 14px;
        color: rgba(255,255,255,0.8);
      }
      
      .report-description {
        font-size: 16px;
        opacity: 0.8;
        font-style: italic;
      }
      
      .report-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        overflow-x: auto;
        padding-bottom: 8px;
      }
      
      .tab-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 16px;
        background: rgba(255,255,255,0.1);
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 140px;
        backdrop-filter: blur(10px);
      }
      
      .tab-button:hover {
        background: rgba(255,255,255,0.2);
        transform: translateY(-2px);
      }
      
      .tab-button.active {
        background: rgba(255,255,255,0.25);
        box-shadow: 0 4px 20px rgba(255,255,255,0.1);
      }
      
      .tab-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      
      .tab-name {
        font-weight: 600;
        font-size: 14px;
      }
      
      .tab-subtitle {
        font-size: 11px;
        color: rgba(255,255,255,0.7);
        font-style: italic;
        text-align: center;
        line-height: 1.2;
      }
      
      .report-content-container {
        background: rgba(255,255,255,0.05);
        border-radius: 16px;
        min-height: 500px;
        backdrop-filter: blur(10px);
      }
      
      .tab-content {
        display: none;
        padding: 24px;
        animation: fadeIn 0.3s ease;
      }
      
      .tab-content.active {
        display: block;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .report-footer {
        text-align: center;
        margin-top: 40px;
        padding: 24px;
        background: rgba(255,255,255,0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);
      }
      
      .footer-content h3 {
        color: #DBFC53;
        margin-bottom: 8px;
      }
      
      .footer-stats {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 12px;
        font-size: 12px;
        opacity: 0.7;
      }
      
      svg {
        max-width: 100% !important;
        height: auto !important;
      }
      
      @media (max-width: 768px) {
        .report-tabs {
          flex-wrap: wrap;
        }
        .tab-button {
          min-width: calc(50% - 4px);
        }
        .footer-stats {
          flex-direction: column;
          gap: 8px;
        }
      }
    `
  }

  /**
   * 生成交互JS
   */
  generateInteractiveJS(tabsArray) {
    const tabIds = tabsArray.map(tab => tab.id)
    
    return `
      function switchTab(tabId) {
        // 隐藏所有内容
        document.querySelectorAll('.tab-content').forEach(tab => {
          tab.classList.remove('active');
        });
        
        // 移除所有按钮的active状态
        document.querySelectorAll('.tab-button').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // 显示目标内容
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
          targetTab.classList.add('active');
        }
        
        // 激活对应按钮
        const targetButton = document.querySelector('[onclick="switchTab(\\'' + tabId + '\\')"]');
        if (targetButton) {
          targetButton.classList.add('active');
        }
        
        console.log('切换到:', tabId);
      }
      
      document.addEventListener('DOMContentLoaded', function() {
        console.log('HitClone Pro 完整报告已加载');
        console.log('包含分析维度:', ${JSON.stringify(tabIds)});
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
          if (e.altKey) {
            const tabs = ${JSON.stringify(tabIds)};
            const currentTab = document.querySelector('.tab-content.active');
            const currentIndex = currentTab ? tabs.indexOf(currentTab.id) : 0;
            
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
              switchTab(tabs[currentIndex - 1]);
              e.preventDefault();
            } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
              switchTab(tabs[currentIndex + 1]);
              e.preventDefault();
            } else if (e.key >= '1' && e.key <= '${tabIds.length}') {
              const index = parseInt(e.key) - 1;
              if (tabs[index]) {
                switchTab(tabs[index]);
                e.preventDefault();
              }
            }
          }
        });
      });
    `
  }

  /**
   * 下载HTML文件
   */
  downloadHTML(htmlContent, meta) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const sanitizedTitle = meta.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
    const filename = `HitClone_Complete_Report_${sanitizedTitle}_${timestamp}.html`
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    
    console.log(`📋 完整报告已下载: ${filename}`)
  }

  /**
   * 显示成功消息
   */
  showSuccessMessage(tabCount) {
    const message = document.createElement('div')
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 380px;
    `
    message.innerHTML = `
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">✅ 完整报告导出成功</div>
      <div style="opacity: 0.9; font-size: 14px; margin-bottom: 8px;">包含 ${tabCount} 个分析维度的完整内容：</div>
      <div style="opacity: 0.8; font-size: 11px; line-height: 1.4; margin-bottom: 8px;">
        🧬 爆款DNA解码器 | 🔥 磁力标题+火花缩略图 | 💗 故事脊柱+评论脉搏<br>
        ⚡ 10秒开场+留存触发器 | 🏔️ 英雄之旅 | 💰 黄金片段 | 📋 完整报告+下期实验
      </div>
      <div style="opacity: 0.8; font-size: 12px;">团队成员可直接打开HTML文件浏览所有分析结果</div>
    `
    
    document.body.appendChild(message)
    
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message)
      }
    }, 6000) // 延长显示时间
  }

  /**
   * 显示错误消息
   */
  showErrorMessage(errorText) {
    const message = document.createElement('div')
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #EF4444;
      color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 350px;
    `
    message.innerHTML = `
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">❌ 导出失败</div>
      <div style="opacity: 0.9; font-size: 14px;">${errorText}</div>
    `
    
    document.body.appendChild(message)
    
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message)
      }
    }, 5000)
  }
}

// 创建全局实例
const completeReportExporter = new CompleteReportExporter()

export default completeReportExporter