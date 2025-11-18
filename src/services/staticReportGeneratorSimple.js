/**
 * 静态HTML报告生成器 - 简化版
 * 基于当前显示内容生成静态报告
 */

class StaticReportGeneratorSimple {
  constructor() {
    this.version = '2.1-simple'
  }

  /**
   * 生成静态HTML报告
   */
  async generateStaticHTML(analysisResults, activeTab = 'creator-focused', currentInput = null) {
    try {
      console.log('🔄 开始生成静态HTML报告...')
      
      // 1. 获取当前显示的内容
      const currentContent = this.getCurrentContent()
      
      // 2. 提取并清理数据
      const cleanData = this.sanitizeData(analysisResults, currentInput)
      
      // 3. 生成完整HTML
      const htmlContent = this.generateCompleteHTML(cleanData, currentContent, activeTab)
      
      // 4. 触发下载
      this.downloadHTML(htmlContent, cleanData.meta)
      
      console.log('✅ 静态HTML报告生成成功')
      return true
    } catch (error) {
      console.error('❌ 静态HTML报告生成失败:', error)
      throw error
    }
  }

  /**
   * 获取当前显示的内容
   */
  getCurrentContent() {
    try {
      // 获取当前报告内容
      const reportContent = document.querySelector('.report-content')
      if (!reportContent) {
        throw new Error('未找到报告内容')
      }

      // 克隆内容
      const contentClone = reportContent.cloneNode(true)
      
      // 清理不需要的元素
      this.cleanupContent(contentClone)
      
      return contentClone.innerHTML
    } catch (error) {
      console.error('获取当前内容失败:', error)
      return this.generateFallbackContent()
    }
  }

  /**
   * 清理内容中不需要的元素
   */
  cleanupContent(element) {
    // 移除可能的交互元素的事件监听器
    const buttons = element.querySelectorAll('button')
    buttons.forEach(btn => {
      btn.removeAttribute('onclick')
      btn.style.cursor = 'default'
    })

    // 确保SVG元素可见
    const svgs = element.querySelectorAll('svg')
    svgs.forEach(svg => {
      svg.style.display = 'block'
      svg.style.maxWidth = '100%'
    })
  }

  /**
   * 生成fallback内容
   */
  generateFallbackContent() {
    return `
      <div style="text-align: center; padding: 60px 20px; color: white;">
        <h2 style="color: #DBFC53; margin-bottom: 16px;">HitClone Pro 分析报告</h2>
        <p style="margin-bottom: 20px;">此报告包含完整的视频分析结果</p>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #DBFC53; margin-bottom: 12px;">报告亮点</h3>
          <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            <li style="margin-bottom: 8px;">🧬 爆款DNA解码器 - 心理触发分析</li>
            <li style="margin-bottom: 8px;">🔥 磁力标题+火花缩略图 - 吸引力优化</li>
            <li style="margin-bottom: 8px;">💗 故事脊柱+评论脉搏 - 情感时间线</li>
            <li style="margin-bottom: 8px;">⚡ 10秒开场+留存触发器 - 观看优化</li>
          </ul>
        </div>
        <p style="font-size: 14px; opacity: 0.8;">原版请访问HitClone Pro在线版本</p>
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
        ${this.generateReportHeader(data)}
        
        <div class="current-view-notice">
            <p>📋 当前导出内容：<strong>${data.meta.exportedTab}</strong></p>
            <p style="font-size: 14px; opacity: 0.8;">提示：如需导出其他分析维度，请切换到对应Tab后重新导出</p>
        </div>
        
        <div class="report-content">
            ${content}
        </div>
        
        ${this.generateFooter(data)}
    </div>
    
    <script>
        ${this.generateJS(data)}
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
        
        /* 当前视图提示 */
        .current-view-notice {
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: center;
            border-left: 4px solid #DBFC53;
        }
        
        /* 内容区域样式 */
        .report-content {
            background: rgba(255,255,255,0.05);
            border-radius: 16px;
            padding: 24px;
            min-height: 500px;
            backdrop-filter: blur(10px);
        }
        
        /* 确保所有内容可见 */
        .report-content * {
            max-width: 100%;
        }
        
        /* SVG图表样式 */
        svg {
            max-width: 100%;
            height: auto;
        }
        
        /* 按钮样式 */
        button {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: default;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .report-details {
                flex-direction: column;
                gap: 8px;
            }
            
            #static-report-container {
                padding: 12px;
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
        
        .export-info {
            font-size: 14px;
            line-height: 1.6;
        }
        
        .version-info {
            font-size: 12px;
            margin-top: 8px;
            opacity: 0.7;
        }
        
        /* 打印优化 */
        @media print {
            body {
                background: white;
                color: black;
            }
            
            .report-header,
            .current-view-notice,
            .report-content {
                background: white !important;
                color: black !important;
            }
            
            .current-view-notice {
                border-left-color: #333;
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
   * 生成页脚
   */
  generateFooter(data) {
    return `
        <div class="report-footer">
            <div class="export-info">
                <p>📋 HitClone Pro 分析报告快照</p>
                <p>导出内容：${data.meta.exportedTab}</p>
                <p style="margin-top: 12px;">
                    此报告展示了HitClone Pro的心理触发式语言设计和创作者视角分析能力
                </p>
            </div>
            <div class="version-info">
                版本: ${data.meta.version} | 导出时间: ${data.meta.exportTime}
            </div>
        </div>
    `
  }

  /**
   * 生成JavaScript
   */
  generateJS(data) {
    return `
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('HitClone Pro 报告快照已加载');
            console.log('导出内容:', '${data.meta.exportedTab}');
            console.log('导出时间:', '${data.meta.exportTime}');
        });
        
        // 阻止所有交互
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON') {
                e.preventDefault();
                console.log('静态报告中的按钮不可交互');
            }
        });
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
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
      const filename = `HitClone_${meta.exportedTab}_${sanitizedTitle}_${timestamp}.html`
      
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
    // 创建临时提示
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
      <div style="opacity: 0.9;">${filename}</div>
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
const staticReportGeneratorSimple = new StaticReportGeneratorSimple()

export default staticReportGeneratorSimple