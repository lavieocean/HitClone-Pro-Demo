/**
 * 静态HTML报告生成器 - 完整版
 * 通过DOM操作提取所有Tab内容
 */

class StaticReportGeneratorComplete {
  constructor() {
    this.version = '2.1-complete'
  }

  /**
   * 生成完整的静态HTML报告
   */
  async generateStaticHTML(analysisResults, activeTab = 'creator-focused', currentInput = null) {
    try {
      console.log('🔄 开始生成完整静态HTML报告...')
      
      // 1. 收集所有Tab的渲染内容
      const allTabsContent = await this.collectAllTabsContent()
      
      // 2. 提取并清理数据
      const cleanData = this.sanitizeData(analysisResults, currentInput)
      
      // 3. 生成完整HTML
      const htmlContent = this.generateCompleteHTML(cleanData, allTabsContent, activeTab)
      
      // 4. 触发下载
      this.downloadHTML(htmlContent, cleanData.meta)
      
      console.log('✅ 完整静态HTML报告生成成功')
      return true
    } catch (error) {
      console.error('❌ 静态HTML报告生成失败:', error)
      throw error
    }
  }

  /**
   * 收集所有Tab的内容
   */
  async collectAllTabsContent() {
    console.log('📋 开始收集所有Tab内容...')
    
    const tabContents = {}
    const tabIds = [
      'creator-focused',
      'viral-dna',
      'emotional-rollercoaster',
      'watch-time-hacks',
      'heros-journey',
      'money-shots',
      'full-report'
    ]

    // 获取当前激活的Tab
    const currentActiveTab = document.querySelector('.tab-button.active')?.textContent || ''

    for (const tabId of tabIds) {
      console.log(`📄 收集 ${tabId} 内容...`)
      
      // 点击对应的Tab按钮
      const tabButton = Array.from(document.querySelectorAll('.tab-button')).find(btn => {
        const tabName = btn.querySelector('.tab-name')?.textContent || ''
        return this.getTabIdFromName(tabName) === tabId
      })

      if (tabButton) {
        // 模拟点击切换到该Tab
        tabButton.click()
        
        // 等待内容渲染
        await this.wait(300)
        
        // 获取渲染后的内容
        const reportContent = document.querySelector('.report-content')
        if (reportContent) {
          const contentClone = reportContent.cloneNode(true)
          
          // 清理不需要的元素
          this.cleanupContent(contentClone)
          
          // 提取内联样式
          this.extractInlineStyles(contentClone)
          
          tabContents[tabId] = contentClone.innerHTML
        }
      }
    }

    // 恢复原来的Tab
    const originalTabButton = Array.from(document.querySelectorAll('.tab-button')).find(btn => 
      btn.textContent.includes(currentActiveTab)
    )
    if (originalTabButton) {
      originalTabButton.click()
    }

    console.log('✅ 所有Tab内容收集完成')
    return tabContents
  }

  /**
   * 根据Tab名称获取ID
   */
  getTabIdFromName(name) {
    const mapping = {
      '爆款DNA解码器': 'creator-focused',
      '磁力标题+火花缩略图': 'viral-dna',
      '故事脊柱+评论脉搏': 'emotional-rollercoaster',
      '10秒开场+留存触发器': 'watch-time-hacks',
      '英雄之旅': 'heros-journey',
      '黄金片段': 'money-shots',
      '完整报告+下期实验': 'full-report'
    }
    
    for (const [key, value] of Object.entries(mapping)) {
      if (name.includes(key)) return value
    }
    return null
  }

  /**
   * 清理内容中不需要的元素
   */
  cleanupContent(element) {
    // 移除可能的交互元素
    const interactiveElements = element.querySelectorAll('button, input, select, textarea')
    interactiveElements.forEach(el => {
      if (el.onclick) el.onclick = null
    })
  }

  /**
   * 提取内联样式
   */
  extractInlineStyles(element) {
    // 确保所有样式都是内联的
    const allElements = element.querySelectorAll('*')
    allElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el)
      const importantStyles = [
        'color',
        'background',
        'backgroundColor',
        'fontSize',
        'fontWeight',
        'padding',
        'margin',
        'borderRadius',
        'display',
        'flexDirection',
        'gap',
        'alignItems',
        'justifyContent'
      ]
      
      importantStyles.forEach(prop => {
        if (computedStyle[prop] && !el.style[prop]) {
          el.style[prop] = computedStyle[prop]
        }
      })
    })
  }

  /**
   * 等待函数
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 数据清理和准备
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
      analysisResults: {
        insights: analysisResults?.insights || {},
        originalAnalysis: analysisResults?.originalAnalysis || {},
        contentInfo: {
          title: videoTitle,
          channel: channelName,
          views: currentInput?.data?.views || analysisResults?.contentInfo?.views || '0 views'
        },
        meta: analysisResults?.meta || {}
      },
      meta: {
        title: videoTitle,
        channel: channelName,
        exportTime: new Date().toLocaleString('zh-CN'),
        version: this.version,
        activeTab: activeTab
      }
    }
  }

  /**
   * 生成完整的HTML内容
   */
  generateCompleteHTML(data, allTabsContent, activeTab) {
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
    <div id="static-report-container">
        ${this.generateReportHeader(data)}
        ${this.generateTabNavigation(activeTab)}
        
        <div class="report-content">
            ${this.generateAllTabContents(allTabsContent, activeTab)}
        </div>
        
        ${this.generateFooter(data, allTabsContent)}
    </div>
    
    <script>
        ${this.generateCompleteJS(data, Object.keys(allTabsContent))}
    </script>
</body>
</html>`
  }

  /**
   * 生成完整的CSS样式
   */
  getCompleteCSS() {
    // 获取当前页面的计算样式
    const styles = Array.from(document.styleSheets)
      .filter(sheet => {
        try {
          return sheet.cssRules || sheet.rules
        } catch (e) {
          return false
        }
      })
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules || sheet.rules)
            .map(rule => rule.cssText)
            .join('\n')
        } catch (e) {
          return ''
        }
      })
      .join('\n')

    return `
        /* 基础样式重置 */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            overflow-x: auto;
        }
        
        #static-report-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* 报告头部样式 */
        .report-header {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            backdrop-filter: blur(10px);
        }
        
        .report-meta h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            color: white;
        }
        
        .report-details {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            opacity: 0.9;
        }
        
        .report-details span {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
        }
        
        /* Tab导航样式 */
        .report-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            overflow-x: auto;
            padding-bottom: 8px;
            -webkit-overflow-scrolling: touch;
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
        
        /* 内容区域样式 */
        .report-content {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 0;
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
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .report-tabs {
                flex-wrap: wrap;
            }
            
            .tab-button {
                min-width: calc(50% - 4px);
            }
        }
        
        /* 页脚样式 */
        .report-footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6);
        }
        
        /* 组件样式保持 */
        ${styles}
        
        /* 打印优化 */
        @media print {
            body {
                background: white;
                color: black;
            }
            
            .report-tabs {
                display: none;
            }
            
            .tab-content {
                display: block !important;
                page-break-before: always;
            }
            
            .tab-content:first-child {
                page-break-before: avoid;
            }
        }
    `
  }

  /**
   * 生成报告头部
   */
  generateReportHeader(data) {
    return `
        <div class="report-header">
            <div class="report-meta">
                <h1>${data.meta.title}</h1>
                <div class="report-details">
                    <span>📺 ${data.meta.channel}</span>
                    <span>📊 ${data.analysisResults.contentInfo.views}</span>
                    <span>📅 导出时间: ${data.meta.exportTime}</span>
                    <span>🏷️ ${data.meta.version}</span>
                </div>
            </div>
        </div>
    `
  }

  /**
   * 生成Tab导航
   */
  generateTabNavigation(activeTab) {
    const tabs = [
      { 
        id: 'creator-focused', 
        name: '爆款DNA解码器', 
        subtitle: '如果今天不点开，你会错过什么？',
        icon: '🧬' 
      },
      { 
        id: 'viral-dna', 
        name: '磁力标题+火花缩略图', 
        subtitle: '十个字内，让人呼吸一滞',
        icon: '🔥' 
      },
      { 
        id: 'emotional-rollercoaster', 
        name: '故事脊柱+评论脉搏', 
        subtitle: '情绪高峰在哪一分一秒？',
        icon: '💗' 
      },
      { 
        id: 'watch-time-hacks', 
        name: '10秒开场+留存触发器', 
        subtitle: '观众是否愿意付余生10分钟？',
        icon: '⚡' 
      },
      { 
        id: 'heros-journey', 
        name: '英雄之旅', 
        subtitle: '经典叙事结构分析',
        icon: '🏔️' 
      },
      { 
        id: 'money-shots', 
        name: '黄金片段', 
        subtitle: '最值得剪成短视频的30秒',
        icon: '💰' 
      }
    ]

    return `
        <div class="report-tabs">
            ${tabs.map(tab => `
                <button class="tab-button ${tab.id === activeTab ? 'active' : ''}" 
                        onclick="switchTab('${tab.id}')">
                    <div class="tab-header">
                        <span>${tab.icon}</span>
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
  generateAllTabContents(allTabsContent, activeTab) {
    return Object.entries(allTabsContent).map(([tabId, content]) => `
        <div id="${tabId}" class="tab-content ${tabId === activeTab ? 'active' : ''}">
            ${content}
        </div>
    `).join('')
  }

  /**
   * 生成页脚
   */
  generateFooter(data, allTabsContent) {
    const tabCount = Object.keys(allTabsContent).length
    return `
        <div class="report-footer">
            <div class="export-info">
                <p>📋 HitClone Pro 完整分析报告</p>
                <p>此报告包含 ${tabCount} 个分析维度的完整内容</p>
                <p style="margin-top: 12px;">
                    <strong>使用提示：</strong>
                    使用 Alt+左右箭头 切换Tab | Alt+数字键 快速跳转 | Ctrl+P 打印报告
                </p>
            </div>
            <div class="version-info">
                版本: ${data.meta.version} | 导出时间: ${data.meta.exportTime}
            </div>
        </div>
    `
  }

  /**
   * 生成完整的JavaScript
   */
  generateCompleteJS(data, tabIds) {
    return `
        // Tab切换功能
        function switchTab(tabId) {
            // 隐藏所有内容
            const allTabs = document.querySelectorAll('.tab-content');
            allTabs.forEach(tab => tab.classList.remove('active'));
            
            // 移除所有按钮的active状态
            const allButtons = document.querySelectorAll('.tab-button');
            allButtons.forEach(btn => btn.classList.remove('active'));
            
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
            
            console.log('切换到标签页:', tabId);
        }
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('HitClone Pro 完整报告已加载');
            console.log('包含的分析维度:', ${JSON.stringify(tabIds)});
        });
        
        // 键盘快捷键支持
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
                } else if (e.key >= '1' && e.key <= '9') {
                    const index = parseInt(e.key) - 1;
                    if (tabs[index]) {
                        switchTab(tabs[index]);
                        e.preventDefault();
                    }
                }
            }
        });
    `
  }

  /**
   * 下载HTML文件
   */
  downloadHTML(htmlContent, meta) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    // 生成文件名
    const sanitizedTitle = meta.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
    const filename = `HitClone_Complete_Report_${sanitizedTitle}_${timestamp}.html`
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100)
    
    console.log(`📋 完整HTML报告已下载: ${filename}`)
    console.log(`📊 包含 ${Object.keys(meta).length} 个分析维度的完整内容`)
  }
}

// 创建全局实例
const staticReportGeneratorComplete = new StaticReportGeneratorComplete()

export default staticReportGeneratorComplete