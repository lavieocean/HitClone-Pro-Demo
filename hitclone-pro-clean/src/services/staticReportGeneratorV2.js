/**
 * 静态HTML报告生成器 V2
 * 完整导出所有报告Tab内容
 */

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ViralDNAEnhanced from '../components/report/ViralDNAEnhanced'
import EmotionalRollercoasterEnhanced from '../components/report/EmotionalRollercoasterEnhanced'
import WatchTimeHacksEnhanced from '../components/report/WatchTimeHacksEnhanced'
import FullReportCreatorFocused from '../components/report/FullReportCreatorFocused'
import HerosJourney from '../components/report/HerosJourney'
import MoneyShots from '../components/report/MoneyShots'

class StaticReportGeneratorV2 {
  constructor() {
    this.version = '2.1-prototype'
  }

  /**
   * 生成完整的静态HTML报告
   */
  async generateStaticHTML(analysisResults, activeTab = 'creator-focused', currentInput = null) {
    try {
      console.log('🔄 开始生成完整静态HTML报告...')
      
      // 1. 提取并清理数据
      const cleanData = this.sanitizeData(analysisResults, currentInput)
      
      // 2. 生成所有组件的HTML
      const componentsHTML = this.renderAllComponents(cleanData.analysisResults)
      
      // 3. 生成完整HTML
      const htmlContent = this.generateCompleteHTML(cleanData, componentsHTML, activeTab)
      
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
   * 渲染所有组件并提取HTML
   */
  renderAllComponents(analysisResults) {
    const components = {
      'creator-focused': FullReportCreatorFocused,
      'viral-dna': ViralDNAEnhanced,
      'emotional-rollercoaster': EmotionalRollercoasterEnhanced,
      'watch-time-hacks': WatchTimeHacksEnhanced,
      'heros-journey': HerosJourney,
      'money-shots': MoneyShots
    }

    const renderedHTML = {}

    // 渲染每个组件
    Object.entries(components).forEach(([key, Component]) => {
      try {
        // 创建React元素
        const element = React.createElement(Component, { analysisResults })
        // 渲染为HTML字符串
        const html = ReactDOMServer.renderToStaticMarkup(element)
        renderedHTML[key] = html
      } catch (error) {
        console.error(`渲染组件 ${key} 失败:`, error)
        renderedHTML[key] = this.generateErrorPlaceholder(key)
      }
    })

    return renderedHTML
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
        meta: analysisResults?.meta || {},
        emotions: analysisResults?.emotions || {},
        heros: analysisResults?.heros || {},
        moneyShots: analysisResults?.moneyShots || {}
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
  generateCompleteHTML(data, componentsHTML, activeTab) {
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
        ${this.generateTabNavigation(activeTab)}
        
        <div class="report-content">
            ${this.generateAllTabContents(componentsHTML, activeTab)}
        </div>
        
        ${this.generateFooter(data)}
    </div>
    
    <script>
        ${this.generateCompleteJS(data)}
    </script>
</body>
</html>`
  }

  /**
   * 生成完整的CSS样式
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
            text-decoration: none;
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
        
        /* 组件内容样式修复 */
        .tab-content > div {
            background: transparent !important;
            padding: 0 !important;
            color: white !important;
        }
        
        /* D3图表容器样式 */
        .chart-container svg {
            max-width: 100%;
            height: auto;
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
            .tab-content {
                background: white !important;
                color: black !important;
            }
            
            .report-tabs {
                display: none;
            }
            
            .tab-content {
                display: block !important;
                page-break-before: always;
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
  generateAllTabContents(componentsHTML, activeTab) {
    const tabIds = [
      'creator-focused',
      'viral-dna',
      'emotional-rollercoaster',
      'watch-time-hacks',
      'heros-journey',
      'money-shots'
    ]

    return tabIds.map(tabId => `
        <div id="${tabId}" class="tab-content ${tabId === activeTab ? 'active' : ''}">
            ${componentsHTML[tabId] || this.generateErrorPlaceholder(tabId)}
        </div>
    `).join('')
  }

  /**
   * 生成错误占位符
   */
  generateErrorPlaceholder(tabId) {
    return `
        <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.8);">
            <h3 style="font-size: 24px; margin-bottom: 12px; color: #DBFC53;">
                组件加载失败
            </h3>
            <p style="font-size: 16px; line-height: 1.6;">
                ${tabId} 组件暂时无法加载，请查看在线版本。
            </p>
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
                <p>📋 HitClone Pro 完整分析报告</p>
                <p>此报告包含所有分析维度的完整内容，由HitClone Pro原型系统生成</p>
                <p style="margin-top: 12px;">
                    <strong>包含的分析维度：</strong>
                    爆款DNA解码器 | 磁力标题+火花缩略图 | 故事脊柱+评论脉搏 | 
                    10秒开场+留存触发器 | 英雄之旅 | 黄金片段
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
  generateCompleteJS(data) {
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
            
            // 保存当前Tab到localStorage
            localStorage.setItem('hitclone-export-active-tab', tabId);
            
            console.log('切换到标签页:', tabId);
        }
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('HitClone Pro 完整报告已加载');
            console.log('报告包含 ${Object.keys(data).length} 个分析维度');
            
            // 恢复上次查看的Tab
            const savedTab = localStorage.getItem('hitclone-export-active-tab');
            if (savedTab && document.getElementById(savedTab)) {
                switchTab(savedTab);
            }
            
            // 打印提示
            console.log('提示：按 Ctrl+P 可以打印此报告');
        });
        
        // 键盘快捷键支持
        document.addEventListener('keydown', function(e) {
            if (e.altKey) {
                const tabs = [
                    'creator-focused', 
                    'viral-dna', 
                    'emotional-rollercoaster', 
                    'watch-time-hacks', 
                    'heros-journey', 
                    'money-shots'
                ];
                const currentIndex = tabs.findIndex(tab => 
                    document.getElementById(tab).classList.contains('active')
                );
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    switchTab(tabs[currentIndex - 1]);
                    e.preventDefault();
                } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
                    switchTab(tabs[currentIndex + 1]);
                    e.preventDefault();
                } else if (e.key >= '1' && e.key <= '6') {
                    const index = parseInt(e.key) - 1;
                    if (tabs[index]) {
                        switchTab(tabs[index]);
                        e.preventDefault();
                    }
                }
            }
        });
        
        // 全屏查看功能
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
        
        // 监听F11键
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
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
  }
}

// 创建全局实例
const staticReportGeneratorV2 = new StaticReportGeneratorV2()

export default staticReportGeneratorV2