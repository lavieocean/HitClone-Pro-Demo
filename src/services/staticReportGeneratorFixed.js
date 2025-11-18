/**
 * 静态HTML报告生成器 - 修复版
 * 等待React组件完全渲染后再导出
 */

class StaticReportGeneratorFixed {
  constructor() {
    this.version = '2.1-fixed'
  }

  /**
   * 生成静态HTML报告
   */
  async generateStaticHTML(analysisResults, activeTab = 'creator-focused', currentInput = null) {
    try {
      console.log('🔄 开始生成静态HTML报告...')
      
      // 1. 等待当前组件完全渲染
      await this.waitForComponentRender()
      
      // 2. 获取完整渲染的内容
      const fullContent = this.getFullRenderedContent()
      
      // 3. 提取并清理数据
      const cleanData = this.sanitizeData(analysisResults, currentInput)
      
      // 4. 生成完整HTML
      const htmlContent = this.generateCompleteHTML(cleanData, fullContent, activeTab)
      
      // 5. 触发下载
      this.downloadHTML(htmlContent, cleanData.meta)
      
      console.log('✅ 静态HTML报告生成成功')
      return true
    } catch (error) {
      console.error('❌ 静态HTML报告生成失败:', error)
      throw error
    }
  }

  /**
   * 等待React组件完全渲染
   */
  async waitForComponentRender() {
    console.log('⏳ 等待组件渲染完成...')
    
    // 等待一个渲染周期
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 等待D3图表渲染
    await this.waitForD3Charts()
    
    // 等待所有图片加载
    await this.waitForImages()
    
    // 再等待一小段时间确保所有动画完成
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('✅ 组件渲染完成')
  }

  /**
   * 等待D3图表渲染完成
   */
  async waitForD3Charts() {
    const maxWait = 3000 // 最多等待3秒
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWait) {
      const svgElements = document.querySelectorAll('.report-content svg')
      const chartContainers = document.querySelectorAll('.chart-container, .emotion-chart')
      
      // 检查是否有图表正在渲染
      let hasEmptyCharts = false
      chartContainers.forEach(container => {
        if (container.children.length === 0) {
          hasEmptyCharts = true
        }
      })
      
      if (!hasEmptyCharts && svgElements.length > 0) {
        console.log(`📊 发现 ${svgElements.length} 个SVG图表`)
        break
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  /**
   * 等待图片加载完成
   */
  async waitForImages() {
    const images = Array.from(document.querySelectorAll('.report-content img'))
    
    if (images.length === 0) return
    
    console.log(`🖼️ 等待 ${images.length} 张图片加载...`)
    
    const imagePromises = images.map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = resolve
          img.onerror = resolve // 即使加载失败也继续
          // 设置超时
          setTimeout(resolve, 2000)
        }
      })
    })
    
    await Promise.all(imagePromises)
    console.log('✅ 图片加载完成')
  }

  /**
   * 获取完整渲染的内容
   */
  getFullRenderedContent() {
    try {
      // 获取整个报告容器
      const reportContainer = document.querySelector('.report-container')
      if (!reportContainer) {
        throw new Error('未找到报告容器')
      }

      // 克隆整个容器
      const containerClone = reportContainer.cloneNode(true)
      
      // 清理不需要的元素
      this.cleanupClonedContent(containerClone)
      
      // 修复样式
      this.fixStyles(containerClone)
      
      // 内联SVG样式
      this.inlineSVGStyles(containerClone)
      
      return containerClone.innerHTML
    } catch (error) {
      console.error('获取渲染内容失败:', error)
      return this.generateFallbackContent()
    }
  }

  /**
   * 清理克隆的内容
   */
  cleanupClonedContent(element) {
    // 移除报告头部的操作按钮
    const reportActions = element.querySelector('.report-actions')
    if (reportActions) {
      reportActions.remove()
    }
    
    // 移除返回按钮
    const backButtons = element.querySelectorAll('.back-btn, .back-btn-small')
    backButtons.forEach(btn => btn.remove())
    
    // 移除Tab切换按钮的事件处理
    const tabButtons = element.querySelectorAll('.tab-button')
    tabButtons.forEach(btn => {
      btn.removeAttribute('onclick')
      btn.style.cursor = 'default'
      btn.style.pointerEvents = 'none'
    })
    
    // 移除所有按钮的点击事件
    const allButtons = element.querySelectorAll('button')
    allButtons.forEach(btn => {
      btn.removeAttribute('onclick')
      btn.style.cursor = 'default'
    })
  }

  /**
   * 修复样式
   */
  fixStyles(element) {
    // 确保主容器样式
    element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    element.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    element.style.minHeight = '100vh'
    element.style.color = 'white'
    element.style.padding = '20px'
    
    // 修复所有子元素的颜色
    const allElements = element.querySelectorAll('*')
    allElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el)
      
      // 保持重要的样式属性
      const importantStyles = [
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
        'justifyContent',
        'gap',
        'gridTemplateColumns',
        'gridGap'
      ]
      
      importantStyles.forEach(style => {
        if (computedStyle[style] && computedStyle[style] !== 'initial') {
          el.style[style] = computedStyle[style]
        }
      })
    })
  }

  /**
   * 内联SVG样式
   */
  inlineSVGStyles(element) {
    const svgs = element.querySelectorAll('svg')
    svgs.forEach(svg => {
      svg.style.maxWidth = '100%'
      svg.style.height = 'auto'
      svg.style.display = 'block'
      
      // 确保SVG内部元素的样式
      const svgElements = svg.querySelectorAll('*')
      svgElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el)
        if (computedStyle.fill && computedStyle.fill !== 'none') {
          el.setAttribute('fill', computedStyle.fill)
        }
        if (computedStyle.stroke && computedStyle.stroke !== 'none') {
          el.setAttribute('stroke', computedStyle.stroke)
        }
      })
    })
  }

  /**
   * 生成fallback内容
   */
  generateFallbackContent() {
    return `
      <div style="text-align: center; padding: 60px 20px; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <h1 style="color: #DBFC53; margin-bottom: 24px; font-size: 32px;">HitClone Pro 分析报告</h1>
        <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin: 24px auto; max-width: 600px;">
          <h2 style="color: #DBFC53; margin-bottom: 16px;">报告内容获取失败</h2>
          <p style="margin-bottom: 16px;">请返回在线版本查看完整分析结果</p>
          <div style="text-align: left;">
            <h3 style="color: #DBFC53; margin-bottom: 12px;">HitClone Pro 功能亮点：</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 8px;">🧬 爆款DNA解码器 - 心理触发分析</li>
              <li style="margin-bottom: 8px;">🔥 磁力标题+火花缩略图 - 吸引力优化</li>
              <li style="margin-bottom: 8px;">💗 故事脊柱+评论脉搏 - 情感时间线</li>
              <li style="margin-bottom: 8px;">⚡ 10秒开场+留存触发器 - 观看优化</li>
              <li style="margin-bottom: 8px;">🏔️ 英雄之旅 - 叙事结构分析</li>
              <li style="margin-bottom: 8px;">💰 黄金片段 - 精华内容识别</li>
            </ul>
          </div>
        </div>
      </div>
    `
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
        exportedTab: this.getCurrentTabName()
      }
    }
  }

  /**
   * 获取当前Tab名称
   */
  getCurrentTabName() {
    try {
      const activeButton = document.querySelector('.tab-button.active .tab-name')
      return activeButton?.textContent || '当前页面'
    } catch (error) {
      return '分析报告'
    }
  }

  /**
   * 生成完整的HTML内容
   */
  generateCompleteHTML(data, content, activeTab) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitClone Pro 分析报告 - ${data.meta.title}</title>
    <style>
        ${this.getCompleteCSS()}
    </style>
</head>
<body>
    <div id="static-report-container">
        ${content}
        
        <div class="export-footer">
            <div style="text-align: center; margin-top: 40px; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">
                <div style="font-size: 14px; line-height: 1.6;">
                    <p>📋 HitClone Pro 完整分析报告</p>
                    <p>导出内容：${data.meta.exportedTab} | 导出时间：${data.meta.exportTime}</p>
                    <p style="margin-top: 12px;">
                        此报告展示了HitClone Pro的心理触发式语言设计和创作者视角分析能力
                    </p>
                </div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">
                    版本: ${data.meta.version}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        console.log('HitClone Pro 完整报告已加载');
        console.log('导出内容:', '${data.meta.exportedTab}');
        
        // 阻止交互
        document.addEventListener('click', function(e) {
            e.preventDefault();
        });
    </script>
</body>
</html>`
  }

  /**
   * 生成CSS样式
   */
  getCompleteCSS() {
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
        
        /* 确保所有内容可见 */
        * {
            max-width: 100%;
        }
        
        /* SVG图表样式 */
        svg {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
        }
        
        /* 按钮样式 */
        button {
            background: rgba(255,255,255,0.2) !important;
            border: 1px solid rgba(255,255,255,0.3) !important;
            color: white !important;
            padding: 8px 16px !important;
            border-radius: 6px !important;
            cursor: default !important;
            pointer-events: none !important;
        }
        
        /* 确保文字可见 */
        .report-content,
        .report-content * {
            color: white !important;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            #static-report-container {
                padding: 12px;
            }
        }
        
        /* 打印优化 */
        @media print {
            body {
                background: white !important;
                color: black !important;
            }
            
            .report-content,
            .report-content * {
                color: black !important;
                background: white !important;
            }
        }
    `
  }

  /**
   * 下载HTML文件
   */
  downloadHTML(htmlContent, meta) {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      // 生成文件名
      const sanitizedTitle = meta.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
      const sanitizedTab = meta.exportedTab.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
      const filename = `HitClone_${sanitizedTab}_${sanitizedTitle}_${timestamp}.html`
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理URL对象
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      
      console.log(`📋 HTML报告已下载: ${filename}`)
      
      // 显示成功提示
      this.showSuccessMessage(filename)
      
    } catch (error) {
      console.error('下载失败:', error)
      throw error
    }
  }

  /**
   * 显示成功消息
   */
  showSuccessMessage(filename) {
    const message = document.createElement('div')
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
    `
    message.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">✅ 导出成功</div>
      <div style="opacity: 0.9; font-size: 12px;">${filename}</div>
      <div style="opacity: 0.8; font-size: 11px; margin-top: 4px;">包含完整的${this.getCurrentTabName()}内容</div>
    `
    
    document.body.appendChild(message)
    
    // 3秒后移除
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message)
      }
    }, 3000)
  }
}

// 创建全局实例
const staticReportGeneratorFixed = new StaticReportGeneratorFixed()

export default staticReportGeneratorFixed