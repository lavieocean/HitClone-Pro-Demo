/**
 * 静态HTML报告生成器
 * 用于生成独立的HTML文件，便于团队内部分享原型报告
 */

class StaticReportGenerator {
  constructor() {
    this.version = '2.1-prototype'
  }

  /**
   * 生成完整的静态HTML报告
   * @param {Object} analysisResults - 分析结果数据
   * @param {string} activeTab - 当前激活的标签页
   * @param {Object} currentInput - 当前输入信息
   */
  async generateStaticHTML(analysisResults, activeTab = 'creator-focused', currentInput = null) {
    try {
      console.log('🔄 开始生成静态HTML报告...')
      
      // 1. 提取并清理数据
      const cleanData = this.sanitizeData(analysisResults, currentInput)
      
      // 2. 生成HTML内容
      const htmlContent = this.generateHTMLContent(cleanData, activeTab)
      
      // 3. 触发下载
      this.downloadHTML(htmlContent, cleanData.meta)
      
      console.log('✅ 静态HTML报告生成成功')
      return true
    } catch (error) {
      console.error('❌ 静态HTML报告生成失败:', error)
      throw error
    }
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
      // 核心分析数据
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
      // 元数据
      meta: {
        title: videoTitle,
        channel: channelName,
        exportTime: new Date().toLocaleString('zh-CN'),
        version: this.version,
        activeTab: 'creator-focused' // 默认打开创作者视角
      }
    }
  }

  /**
   * 生成完整的HTML内容
   */
  generateHTMLContent(data, activeTab) {
    const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitClone Pro 分析报告 - ${data.meta.title}</title>
    <style>
        ${this.getInlineCSS()}
    </style>
</head>
<body>
    <div id="static-report-container">
        ${this.generateReportHeader(data)}
        ${this.generateTabNavigation()}
        ${this.generateReportContent(data)}
        ${this.generateFooter(data)}
    </div>
    
    <script>
        ${this.generateInlineJS(data)}
    </script>
</body>
</html>`

    return htmlTemplate
  }

  /**
   * 生成内联CSS样式
   */
  getInlineCSS() {
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
        
        .tab-name {
            font-weight: 600;
            margin-bottom: 4px;
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
        }
        
        .tab-content.active {
            display: block;
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
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .report-tabs {
                flex-direction: column;
            }
            
            .tab-button {
                min-width: auto;
                width: 100%;
            }
            
            .report-details {
                flex-direction: column;
                gap: 8px;
            }
        }
        
        /* 特殊内容样式 - 适配原有组件 */
        .viral-dna-container,
        .creator-focused-container {
            color: white;
        }
        
        /* 通用卡片样式 */
        .analysis-card {
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .analysis-card h3 {
            color: #DBFC53;
            margin-bottom: 16px;
            font-size: 18px;
        }
        
        /* 简化的组件样式 */
        .simple-placeholder {
            text-align: center;
            padding: 60px 20px;
            color: rgba(255,255,255,0.8);
        }
        
        .simple-placeholder h3 {
            font-size: 24px;
            margin-bottom: 12px;
            color: #DBFC53;
        }
        
        .simple-placeholder p {
            font-size: 16px;
            line-height: 1.6;
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
  generateTabNavigation() {
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
        id: 'money-shots', 
        name: '黄金片段', 
        subtitle: '最值得剪成短视频的30秒',
        icon: '💰' 
      }
    ]

    return `
        <div class="report-tabs">
            ${tabs.map(tab => `
                <button class="tab-button ${tab.id === 'creator-focused' ? 'active' : ''}" 
                        onclick="switchTab('${tab.id}')">
                    <div style="display: flex; align-items: center; gap: 8px;">
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
   * 生成报告内容
   */
  generateReportContent(data) {
    return `
        <div class="report-content">
            <div id="creator-focused" class="tab-content active">
                ${this.generateCreatorFocusedContent(data)}
            </div>
            <div id="viral-dna" class="tab-content">
                ${this.generateViralDNAContent(data)}
            </div>
            <div id="emotional-rollercoaster" class="tab-content">
                ${this.generatePlaceholderContent('故事脊柱+评论脉搏', '情绪时间线图表和观众参与度分析')}
            </div>
            <div id="watch-time-hacks" class="tab-content">
                ${this.generatePlaceholderContent('10秒开场+留存触发器', '观看时长优化策略和关键节点分析')}
            </div>
            <div id="money-shots" class="tab-content">
                ${this.generatePlaceholderContent('黄金片段', '最具分享价值的关键时刻识别')}
            </div>
        </div>
    `
  }

  /**
   * 生成创作者视角内容
   */
  generateCreatorFocusedContent(data) {
    const analysisResults = data.analysisResults
    const viralFactors = analysisResults.insights?.viralFactors || {}
    
    return `
        <div class="creator-focused-container">
            <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                    🧬 爆款DNA解码器
                </h1>
                <p style="font-size: 18px; margin-bottom: 16px; opacity: 0.9; font-style: italic; font-weight: 600;">
                    "如果今天不点开，你会错过什么？"
                </p>
            </div>
            
            <div class="analysis-card">
                <h3>🎯 病毒性指数总览</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    <div style="text-align: center; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: 700; color: #DBFC53;">
                            ${viralFactors.hookStrength || 85}
                        </div>
                        <div style="font-size: 14px; opacity: 0.8;">开场吸引力</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: 700; color: #DBFC53;">
                            ${viralFactors.curiosityGap || 78}
                        </div>
                        <div style="font-size: 14px; opacity: 0.8;">好奇心缺口</div>
                    </div>
                    <div style="text-align: center; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="font-size: 24px; font-weight: 700; color: #DBFC53;">
                            ${viralFactors.emotionalTrigger || 82}
                        </div>
                        <div style="font-size: 14px; opacity: 0.8;">情感触发器</div>
                    </div>
                </div>
            </div>
            
            <div class="analysis-card">
                <h3>💡 核心洞察</h3>
                <p style="line-height: 1.6; color: rgba(255,255,255,0.9);">
                    该视频展现出强劲的病毒式传播潜力，特别是在开场设计和情感触发方面表现突出。
                    建议在保持现有优势的基础上，进一步优化好奇心缺口的设置，以提升整体传播效果。
                </p>
            </div>
            
            <div class="analysis-card">
                <h3>🚀 下一次实验</h3>
                <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                    <h4 style="color: #F59E0B; margin-bottom: 12px;">实验方向：强化悬念设置</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #DBFC53;">•</span>
                            在开头3秒内设置明确的问题钩子
                        </li>
                        <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #DBFC53;">•</span>
                            中段增加"但是"转折点，制造认知冲突
                        </li>
                        <li style="padding-left: 20px; position: relative;">
                            <span style="position: absolute; left: 0; color: #DBFC53;">•</span>
                            结尾留白，激发讨论和分享动机
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `
  }

  /**
   * 生成病毒DNA内容
   */
  generateViralDNAContent(data) {
    return `
        <div class="viral-dna-container">
            <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                    🔥 磁力标题 + 火花缩略图
                </h1>
                <p style="font-size: 18px; margin-bottom: 16px; opacity: 0.9; font-style: italic; font-weight: 600;">
                    "十个字内，让人呼吸一滞。画面能否瞬间点燃好奇分贝？"
                </p>
            </div>
            
            <div class="analysis-card">
                <h3>📝 磁力标题分析</h3>
                <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <h4 style="margin-bottom: 12px;">当前标题</h4>
                    <p style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">
                        "${data.meta.title}"
                    </p>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px;">
                            磁力指数: 85/100
                        </span>
                        <span style="color: rgba(255,255,255,0.7);">强吸引力</span>
                    </div>
                </div>
                
                <h4 style="margin-bottom: 12px;">AI优化建议</h4>
                <div style="display: grid; gap: 8px;">
                    <div style="background: rgba(59,130,246,0.1); padding: 12px; border-radius: 6px; border-left: 3px solid #3B82F6;">
                        方案1: "震撼！这个AI功能99%的人都不知道"
                    </div>
                    <div style="background: rgba(59,130,246,0.1); padding: 12px; border-radius: 6px; border-left: 3px solid #3B82F6;">
                        方案2: "3分钟看懂，为什么它能改变一切"
                    </div>
                    <div style="background: rgba(59,130,246,0.1); padding: 12px; border-radius: 6px; border-left: 3px solid #3B82F6;">
                        方案3: "不敢相信！原来真相是这样的"
                    </div>
                </div>
            </div>
            
            <div class="analysis-card">
                <h3>🎨 火花缩略图分析</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <h4 style="margin-bottom: 8px;">火花指数</h4>
                        <div style="font-size: 24px; font-weight: 700; color: #F59E0B;">88/100</div>
                        <div style="font-size: 14px; opacity: 0.8;">强视觉冲击</div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 8px;">预估CTR</h4>
                        <div style="font-size: 24px; font-weight: 700; color: #10B981;">12.8%</div>
                        <div style="font-size: 14px; opacity: 0.8;">高于平均水平</div>
                    </div>
                </div>
            </div>
        </div>
    `
  }

  /**
   * 生成占位符内容
   */
  generatePlaceholderContent(title, description) {
    return `
        <div class="simple-placeholder">
            <h3>${title}</h3>
            <p>${description}</p>
            <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <p style="font-size: 14px; opacity: 0.7;">
                    此功能在原型阶段，完整实现请参考源代码中的对应组件。
                </p>
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
                <p>📋 HitClone Pro 静态报告</p>
                <p>此报告由HitClone Pro原型系统生成，用于团队内部产品体验分享</p>
            </div>
            <div class="version-info">
                版本: ${data.meta.version} | 导出时间: ${data.meta.exportTime}
            </div>
        </div>
    `
  }

  /**
   * 生成内联JavaScript
   */
  generateInlineJS(data) {
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
            console.log('HitClone Pro 静态报告已加载');
            console.log('报告数据:', ${JSON.stringify(data, null, 2)});
            
            // 确保默认标签页激活
            switchTab('creator-focused');
        });
        
        // 键盘快捷键支持
        document.addEventListener('keydown', function(e) {
            if (e.altKey) {
                const tabs = ['creator-focused', 'viral-dna', 'emotional-rollercoaster', 'watch-time-hacks', 'money-shots'];
                const currentIndex = tabs.findIndex(tab => document.getElementById(tab).classList.contains('active'));
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    switchTab(tabs[currentIndex - 1]);
                    e.preventDefault();
                } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
                    switchTab(tabs[currentIndex + 1]);
                    e.preventDefault();
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
    const filename = `HitClone_Report_${sanitizedTitle}_${timestamp}.html`
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100)
    
    console.log(`📋 HTML报告已下载: ${filename}`)
  }
}

// 创建全局实例
const staticReportGenerator = new StaticReportGenerator()

export default staticReportGenerator