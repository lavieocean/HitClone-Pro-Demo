import React, { useState, useEffect } from 'react'
import DataRecovery from '../debug/DataRecovery'

const HistoryReports = ({ currentPage, onLoadReport, onPageChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('category') // 'category' or 'channel'
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [showDataRecovery, setShowDataRecovery] = useState(false)

  // 添加脉冲动画样式
  const pulseKeyframes = `
    @keyframes pulse {
      0% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
      50% { box-shadow: 0 6px 25px rgba(16, 185, 129, 0.6); }
      100% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
    }
  `
  
  // 注入样式到页面
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = pulseKeyframes
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // 从localStorage获取真实的历史报告数据
  const getHistoryReports = () => {
    try {
      const saved = localStorage.getItem('hitclone-analysis-history')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('加载历史报告失败:', error)
      return []
    }
  }

  const [historyReports, setHistoryReports] = useState(getHistoryReports())

  // 清除历史记录功能
  const clearAllHistory = () => {
    if (confirm('确定要清除所有历史记录吗？此操作不可撤销。')) {
      localStorage.removeItem('hitclone-analysis-history')
      setHistoryReports([])
    }
  }

  // 删除单个报告
  const deleteReport = (reportId) => {
    if (confirm('确定要删除这个分析报告吗？')) {
      const updatedReports = historyReports.filter(report => report.id !== reportId)
      setHistoryReports(updatedReports)
      localStorage.setItem('hitclone-analysis-history', JSON.stringify(updatedReports))
    }
  }

  // 深度扫描恢复功能
  const deepScanRestore = async () => {
    console.log('🔍 开始深度扫描恢复...')
    console.log('📊 当前历史报告数量:', historyReports.length)
    
    // 显示加载提示
    const loadingToast = document.createElement('div')
    loadingToast.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9); color: white; padding: 20px 30px;
      border-radius: 12px; border: 2px solid #667eea; z-index: 10000;
      font-size: 16px; font-weight: 600; text-align: center;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    `
    loadingToast.innerHTML = `
      <div style="margin-bottom: 12px;">🔍 深度扫描所有localStorage数据...</div>
      <div style="font-size: 14px; color: rgba(255,255,255,0.8);">正在查找所有可能的历史报告</div>
    `
    document.body.appendChild(loadingToast)

    try {
      const allKeys = Object.keys(localStorage)
      let totalFound = 0
      let allRecoveredData = []
      
      console.log(`🔍 深度扫描 ${allKeys.length} 个localStorage键...`)
      
      // 扫描所有localStorage键
      for (const key of allKeys) {
        try {
          const data = localStorage.getItem(key)
          if (data && data.length > 50) { // 跳过太短的数据
            try {
              const parsed = JSON.parse(data)
              
              // 检查数组格式
              if (Array.isArray(parsed)) {
                const reports = parsed.filter(item => {
                  if (!item || typeof item !== 'object') return false
                  
                  // 检查报告特征
                  const hasTitle = item.title && typeof item.title === 'string'
                  const hasAnalysis = item.analysisResults && typeof item.analysisResults === 'object'
                  const hasScore = typeof item.score === 'number'
                  const hasChannel = item.channel && typeof item.channel === 'string'
                  const hasDate = item.analysisDate || item.date || item.timestamp
                  
                  return (hasTitle && (hasAnalysis || hasScore)) || 
                         (hasChannel && hasTitle) ||
                         (hasTitle && hasDate && item.type)
                })
                
                if (reports.length > 0) {
                  console.log(`✅ 在 "${key}" 中发现 ${reports.length} 个报告`)
                  totalFound += reports.length
                  allRecoveredData = [...allRecoveredData, ...reports]
                }
              }
              // 检查单个对象
              else if (typeof parsed === 'object' && parsed.title && 
                      (parsed.analysisResults || parsed.score !== undefined)) {
                console.log(`✅ 在 "${key}" 中发现 1 个报告对象`)
                totalFound += 1
                allRecoveredData = [...allRecoveredData, parsed]
              }
            } catch (jsonError) {
              // 跳过非JSON数据
            }
          }
        } catch (e) {
          console.warn(`扫描 ${key} 时出错:`, e.message)
        }
      }
      
      // 更新进度
      loadingToast.innerHTML = `
        <div style="margin-bottom: 12px;">🎯 深度扫描完成</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">
          共扫描 ${allKeys.length} 个键，发现 ${totalFound} 个报告
        </div>
      `
      
      if (totalFound === 0) {
        setTimeout(() => {
          loadingToast.innerHTML = `
            <div style="color: #F59E0B; margin-bottom: 12px;">⚠️ 深度扫描未发现数据</div>
            <div style="font-size: 14px; color: rgba(255,255,255,0.8);">
              扫描了所有 ${allKeys.length} 个localStorage键<br>
              可能数据已被清除或在其他浏览器中
            </div>
          `
          setTimeout(() => {
            if (document.body.contains(loadingToast)) {
              document.body.removeChild(loadingToast)
            }
          }, 4000)
        }, 1000)
        return
      }
      
      // 去重和保存
      const uniqueData = []
      const seenIds = new Set()
      
      allRecoveredData.forEach(item => {
        const id = item.id || `${item.title}-${item.analysisDate || item.date || Date.now()}`
        if (!seenIds.has(id)) {
          seenIds.add(id)
          // 标准化数据格式
          const standardizedItem = {
            ...item,
            id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            analysisDate: item.analysisDate || item.date || new Date().toISOString(),
            type: item.type || 'recovered',
            category: item.category || 'tech',
            tags: item.tags || ['深度恢复', 'AI分析'],
            favorite: item.favorite || false
          }
          uniqueData.push(standardizedItem)
        }
      })
      
      // 保存恢复的数据
      const existingReports = getHistoryReports()
      const finalData = [...uniqueData, ...existingReports]
      const finalUnique = []
      const finalSeenIds = new Set()
      
      finalData.forEach(item => {
        const id = item.id || `${item.title}-${item.analysisDate}`
        if (!finalSeenIds.has(id)) {
          finalSeenIds.add(id)
          finalUnique.push(item)
        }
      })
      
      localStorage.setItem('hitclone-analysis-history', JSON.stringify(finalUnique))
      setHistoryReports(finalUnique)
      
      // 显示成功结果
      setTimeout(() => {
        loadingToast.innerHTML = `
          <div style="color: #10B981; margin-bottom: 12px;">✅ 深度恢复完成！</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.8);">
            新恢复: ${uniqueData.length} 个报告<br>
            总计: ${finalUnique.length} 个历史报告
          </div>
        `
        
        setTimeout(() => {
          if (document.body.contains(loadingToast)) {
            document.body.removeChild(loadingToast)
          }
          
          // 显示成功提示
          const successToast = document.createElement('div')
          successToast.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 16px 20px; border-radius: 12px; z-index: 10000;
            font-size: 14px; max-width: 300px; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          `
          successToast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">🔍 深度恢复成功</div>
            <div>• 深度扫描: ${allKeys.length} 个键</div>
            <div>• 新增报告: ${uniqueData.length} 个</div>
            <div>• 总计报告: ${finalUnique.length} 个</div>
          `
          document.body.appendChild(successToast)
          
          setTimeout(() => {
            if (document.body.contains(successToast)) {
              document.body.removeChild(successToast)
            }
          }, 6000)
        }, 1500)
      }, 1000)
      
    } catch (error) {
      console.error('深度扫描失败:', error)
      loadingToast.innerHTML = `
        <div style="color: #EF4444; margin-bottom: 12px;">❌ 深度扫描失败</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">${error.message}</div>
      `
      setTimeout(() => {
        if (document.body.contains(loadingToast)) {
          document.body.removeChild(loadingToast)
        }
      }, 3000)
    }
  }

  // 快速自动恢复功能
  const quickAutoRestore = async () => {
    console.log('🚀 开始快速自动恢复...')
    console.log('📊 当前历史报告数量:', historyReports.length)
    
    // 显示加载提示
    const loadingToast = document.createElement('div')
    loadingToast.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9); color: white; padding: 20px 30px;
      border-radius: 12px; border: 2px solid #10B981; z-index: 10000;
      font-size: 16px; font-weight: 600; text-align: center;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    `
    loadingToast.innerHTML = `
      <div style="margin-bottom: 12px;">🔄 正在扫描历史数据...</div>
      <div style="font-size: 14px; color: rgba(255,255,255,0.8);">请稍候，正在自动恢复报告</div>
    `
    document.body.appendChild(loadingToast)

    try {
      // 扫描所有可能的备份位置 - 扩展列表
      const backupKeys = [
        // 标准键名
        'hitclone-analysis-history',
        'hitclone-analysis-history-backup',
        'hitclone-history-backup', 
        'analysis-history-backup',
        'video-analysis-history',
        'hitclone-reports',
        'youtube-analysis-history',
        'ai-analysis-history',
        
        // 扩展键名 - 可能的变体
        'hitclone_analysis_history',
        'hitclone-video-analysis',
        'hitclone-video-reports', 
        'video-analysis-reports',
        'analysis-results-history',
        'youtube-video-analysis',
        'ai-video-analysis',
        'video-analysis-data',
        'hitclone-data',
        'hitclone-storage',
        'video-reports',
        'analysis-reports',
        'hitclone-backup',
        'video-backup',
        'analysis-backup',
        
        // 可能的时间戳版本
        'hitclone-analysis-history-2024',
        'hitclone-analysis-history-2023',
        'analysis-history-v1',
        'analysis-history-v2',
        'hitclone-v1',
        'hitclone-v2'
      ]
      
      let totalFound = 0
      let allRecoveredData = []
      
      console.log('🔍 扫描备份位置...')
      
      for (const key of backupKeys) {
        try {
          const backup = localStorage.getItem(key)
          console.log(`🔍 检查 ${key}:`, backup ? `存在 ${backup.length} 字符` : '不存在')
          if (backup) {
            const parsed = JSON.parse(backup)
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`✅ 发现数据在 ${key}: ${parsed.length} 个项目`)
              console.log('📋 数据样本:', parsed.slice(0, 2))
              totalFound += parsed.length
              allRecoveredData = [...allRecoveredData, ...parsed]
            } else {
              console.log(`⚠️ ${key} 存在但不是有效数组:`, typeof parsed, Array.isArray(parsed))
            }
          }
        } catch (e) {
          console.warn(`跳过无效数据 ${key}:`, e.message)
        }
      }
      
      console.log(`📊 总计找到 ${totalFound} 个报告，来自 ${allRecoveredData.length} 个条目`)
      
      // 如果标准扫描没找到数据，进行全局localStorage扫描
      if (totalFound === 0) {
        console.log('🔍 开始全局localStorage扫描...')
        const allKeys = Object.keys(localStorage)
        console.log(`📋 localStorage中共有 ${allKeys.length} 个键`)
        
        // 查找可能包含分析数据的键
        const potentialKeys = allKeys.filter(key => {
          const keyLower = key.toLowerCase()
          return keyLower.includes('analysis') || 
                 keyLower.includes('history') ||
                 keyLower.includes('report') ||
                 keyLower.includes('video') ||
                 keyLower.includes('hitclone') ||
                 keyLower.includes('youtube') ||
                 keyLower.includes('ai') ||
                 keyLower.includes('data') ||
                 keyLower.includes('backup')
        })
        
        console.log(`🎯 找到 ${potentialKeys.length} 个可能相关的键:`, potentialKeys)
        
        // 扫描这些键
        for (const key of potentialKeys) {
          try {
            const data = localStorage.getItem(key)
            if (data) {
              const parsed = JSON.parse(data)
              
              // 检查是否是数组格式的报告数据
              if (Array.isArray(parsed)) {
                const validReports = parsed.filter(item => 
                  item && typeof item === 'object' && 
                  (item.title || item.analysisResults || item.score !== undefined)
                )
                
                if (validReports.length > 0) {
                  console.log(`✅ 在 ${key} 中发现 ${validReports.length} 个有效报告`)
                  totalFound += validReports.length
                  allRecoveredData = [...allRecoveredData, ...validReports]
                }
              }
              // 检查是否是单个报告对象
              else if (typeof parsed === 'object' && 
                      (parsed.title || parsed.analysisResults || parsed.score !== undefined)) {
                console.log(`✅ 在 ${key} 中发现 1 个报告对象`)
                totalFound += 1
                allRecoveredData = [...allRecoveredData, parsed]
              }
            }
          } catch (e) {
            // 跳过无效的JSON数据
            console.warn(`跳过无效JSON ${key}:`, e.message)
          }
        }
        
        console.log(`🔍 全局扫描完成，额外找到 ${totalFound} 个报告`)
      }

      // 更新进度
      loadingToast.innerHTML = `
        <div style="margin-bottom: 12px;">📊 发现 ${totalFound} 个报告</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">正在去重和整理...</div>
      `

      if (totalFound === 0) {
        console.log('❌ 未发现任何历史数据')
        // 检查当前是否有数据
        const currentReports = getHistoryReports()
        console.log('📊 当前存储的报告数量:', currentReports.length)
        
        loadingToast.innerHTML = `
          <div style="color: #F59E0B; margin-bottom: 12px;">⚠️ 未发现历史数据</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.8);">
            当前已有: ${currentReports.length} 个报告<br>
            可能数据从未保存或已被清除
          </div>
        `
        setTimeout(() => {
          if (document.body.contains(loadingToast)) {
            document.body.removeChild(loadingToast)
          }
        }, 4000)
        return
      }

      // 去重处理
      const uniqueData = []
      const seenIds = new Set()
      const seenTitles = new Set()
      
      allRecoveredData.forEach(item => {
        if (!item || typeof item !== 'object') return
        
        const id = item.id || `${item.title}-${item.analysisDate}`
        const titleTime = `${item.title}-${item.analysisDate}`
        
        if (!seenIds.has(id) && !seenTitles.has(titleTime)) {
          seenIds.add(id)
          seenTitles.add(titleTime)
          uniqueData.push(item)
        }
      })

      console.log(`📊 去重后: ${uniqueData.length} 个唯一报告`)

      // 更新进度
      loadingToast.innerHTML = `
        <div style="margin-bottom: 12px;">💾 保存 ${uniqueData.length} 个报告</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">正在合并到历史记录...</div>
      `

      // 合并到现有历史记录
      const existingReports = getHistoryReports()
      const allReports = [...uniqueData, ...existingReports]
      
      // 再次去重，避免与现有数据重复
      const finalUniqueData = []
      const finalSeenIds = new Set()
      
      allReports.forEach(item => {
        const id = item.id || `${item.title}-${item.analysisDate}`
        if (!finalSeenIds.has(id)) {
          finalSeenIds.add(id)
          finalUniqueData.push(item)
        }
      })

      // 保存到localStorage
      localStorage.setItem('hitclone-analysis-history', JSON.stringify(finalUniqueData))
      
      // 更新组件状态
      setHistoryReports(finalUniqueData)

      // 显示成功消息
      loadingToast.innerHTML = `
        <div style="color: #10B981; margin-bottom: 12px;">✅ 恢复完成！</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">
          共恢复 ${uniqueData.length} 个新报告<br>
          总计 ${finalUniqueData.length} 个历史报告
        </div>
      `

      console.log(`✅ 快速恢复完成: 新增${uniqueData.length}个，总计${finalUniqueData.length}个`)
      console.log('📋 恢复的数据样本:', uniqueData.slice(0, 3))

      setTimeout(() => {
        if (document.body.contains(loadingToast)) {
          document.body.removeChild(loadingToast)
        }
        
        // 显示详细结果提示
        if (uniqueData.length > 0) {
          const resultToast = document.createElement('div')
          resultToast.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white; padding: 16px 20px; border-radius: 12px; z-index: 10000;
            font-size: 14px; max-width: 300px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
          `
          resultToast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">🎉 历史数据恢复成功</div>
            <div>• 新增报告: ${uniqueData.length} 个</div>
            <div>• 总计报告: ${finalUniqueData.length} 个</div>
          `
          document.body.appendChild(resultToast)
          
          setTimeout(() => {
            if (document.body.contains(resultToast)) {
              document.body.removeChild(resultToast)
            }
          }, 5000)
        }
      }, 2000)

    } catch (error) {
      console.error('快速恢复失败:', error)
      loadingToast.innerHTML = `
        <div style="color: #EF4444; margin-bottom: 12px;">❌ 恢复失败</div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.8);">${error.message}</div>
      `
      setTimeout(() => document.body.removeChild(loadingToast), 3000)
    }
  }

  const categories = [
    { id: 'all', name: '全部', count: historyReports.length },
    { id: 'tech', name: '科技', count: historyReports.filter(r => r.category === 'tech').length },
    { id: 'entertainment', name: '娱乐', count: historyReports.filter(r => r.category === 'entertainment').length },
    { id: 'education', name: '教育', count: historyReports.filter(r => r.category === 'education').length },
    { id: 'business', name: '商业', count: historyReports.filter(r => r.category === 'business').length },
    { id: 'music', name: '音乐', count: historyReports.filter(r => r.category === 'music').length }
  ]

  // 获取频道聚合数据
  const getChannelAggregation = () => {
    const channelMap = new Map()
    historyReports.forEach(report => {
      const channel = report.channel || '未知频道'
      if (!channelMap.has(channel)) {
        channelMap.set(channel, {
          channel,
          count: 0,
          reports: [],
          avgScore: 0,
          totalViews: 0,
          latestDate: null
        })
      }
      const channelData = channelMap.get(channel)
      channelData.count++
      channelData.reports.push(report)
      channelData.totalViews += parseInt(report.views?.replace(/[^0-9]/g, '') || 0)
      
      const reportDate = new Date(report.analysisDate)
      if (!channelData.latestDate || reportDate > channelData.latestDate) {
        channelData.latestDate = reportDate
      }
    })
    
    // 计算平均分
    channelMap.forEach((data, channel) => {
      const totalScore = data.reports.reduce((sum, report) => sum + (report.score || 0), 0)
      data.avgScore = Math.round(totalScore / data.count)
    })
    
    return Array.from(channelMap.values())
      .sort((a, b) => b.count - a.count)
  }

  const channelAggregation = getChannelAggregation()
  const eligibleChannels = channelAggregation.filter(channel => channel.count >= 3)
  
  const channels = [
    { id: 'all', name: '全部频道', count: historyReports.length },
    ...eligibleChannels.map(channel => ({
      id: channel.channel,
      name: channel.channel,
      count: channel.count,
      avgScore: channel.avgScore,
      totalViews: channel.totalViews,
      latestDate: channel.latestDate
    }))
  ]

  // 过滤报告
  const filteredReports = historyReports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory
    const matchesChannel = selectedChannel === 'all' || report.channel === selectedChannel
    // 确保title和channel是字符串
    const title = String(report.title || '')
    const channel = String(report.channel || '')
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.tags && report.tags.some(tag => String(tag).toLowerCase().includes(searchTerm.toLowerCase())))
    const matchesPage = currentPage === 'history' || (currentPage === 'favorites' && report.favorite)
    
    return matchesCategory && matchesChannel && matchesSearch && matchesPage
  })

  const getScoreColor = (score) => {
    if (score >= 90) return '#DBFC53'
    if (score >= 80) return '#A8E063'  
    if (score >= 70) return '#FCD34D'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const getTypeIcon = (type) => {
    return type === 'url' ? '🔗' : '📄'
  }

  const loadExampleReport = (report) => {
    // 加载保存的分析报告，不重新触发分析
    onLoadReport({ 
      type: 'saved_report', 
      analysisResults: report.analysisResults,
      data: {
        title: report.title,
        channel: report.channel,
        views: report.views,
        score: report.score
      }
    })
  }

  // 启动智能频道分析
  const startSmartChannelAnalysis = (channelData) => {
    console.log('🚀 启动智能频道分析:', channelData)
    
    // 显示加载提示
    const loadingToast = document.createElement('div')
    loadingToast.id = 'smart-analysis-loading'
    loadingToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `
    loadingToast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        🧠 正在启动Smart Channel Analysis...
      </div>
    `
    
    // 添加CSS动画
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(loadingToast)
    
    try {
      // 准备频道数据，包含该频道的所有视频报告
      const channelVideos = channelData.reports.map(report => ({
        id: report.id,
        title: report.title,
        url: report.analysisResults?.contentInfo?.url || '#',
        analysisResults: report.analysisResults,
        videoData: report.analysisResults?.contentInfo,
        analysisDate: report.analysisDate,
        score: report.score
      }))

      // 验证数据完整性
      if (!channelVideos.length) {
        throw new Error('频道视频数据为空')
      }

      // 通过页面跳转到 HitClone Channel，并携带频道数据
      onPageChange('hitclone-channel')
      
      // 使用延迟确保页面切换完成后再传递数据
      setTimeout(() => {
        try {
          // 触发自动频道分析
          const channelAnalysisData = {
            channelName: channelData.channel,
            channelId: `smart_${channelData.channel}`,
            totalVideos: channelData.count,
            videos: channelVideos,
            source: 'smart_history_analysis',
            canAnalyze: true,
            timestamp: new Date().toISOString()
          }
          
          console.log('📡 发送Smart Channel Analysis事件:', channelAnalysisData)
          
          // 通过 window 事件传递数据到 HitClone Channel 组件
          window.dispatchEvent(new CustomEvent('smartChannelAnalysis', { 
            detail: channelAnalysisData 
          }))
          
          // 更新加载提示
          setTimeout(() => {
            if (loadingToast && loadingToast.parentNode) {
              loadingToast.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                  ✅ Smart Channel Analysis 已启动
                </div>
              `
              setTimeout(() => {
                loadingToast.remove()
              }, 2000)
            }
          }, 500)
          
        } catch (error) {
          console.error('❌ 事件发送失败:', error)
          if (loadingToast && loadingToast.parentNode) {
            loadingToast.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px;">
                ❌ 启动失败: ${error.message}
              </div>
            `
            setTimeout(() => loadingToast.remove(), 3000)
          }
        }
      }, 200)
      
    } catch (error) {
      console.error('❌ Smart Channel Analysis启动失败:', error)
      if (loadingToast && loadingToast.parentNode) {
        loadingToast.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            ❌ 启动失败: ${error.message}
          </div>
        `
        setTimeout(() => loadingToast.remove(), 3000)
      }
    }
  }

  return (
    <div className="history-reports-container">
      {/* 页面头部 */}
      <div className="history-header">
        <div className="header-content">
          <h1 className="page-title">
            {currentPage === 'history' ? '📊 History Reports' : '⭐ My Favorites'}
          </h1>
          <p className="page-subtitle">
            {currentPage === 'history' 
              ? '查看所有历史分析报告，快速回顾和对比' 
              : '我收藏的精选分析报告'
            }
          </p>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="搜索报告标题、频道或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            onClick={quickAutoRestore}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              marginLeft: '12px',
              transition: 'all 0.3s',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              animation: historyReports.length === 0 ? 'pulse 2s infinite' : 'none'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)'
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
            title="一键自动扫描并恢复所有历史报告数据"
          >
            🎯 一键恢复历史数据
          </button>

          <button 
            onClick={deepScanRestore}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: '8px',
              transition: 'all 0.2s',
              fontWeight: '600'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            title="深度扫描所有localStorage数据，查找丢失的历史报告"
          >
            🔍 深度恢复
          </button>

          <button 
            className="data-recovery-btn"
            onClick={() => setShowDataRecovery(true)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: '8px',
              transition: 'all 0.2s',
              fontWeight: '600'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            title="高级数据恢复工具，可手动选择数据"
          >
            🛠️ 高级恢复
          </button>

          {historyReports.length > 0 && (
            <button 
              className="clear-all-btn"
              onClick={clearAllHistory}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                color: '#EF4444',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '12px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            >
              🗑️ 清空历史 ({historyReports.length})
            </button>
          )}
        </div>
      </div>

      {/* 视图模式切换 */}
      {currentPage === 'history' && (
        <div className="view-mode-switcher" style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          gap: '8px'
        }}>
          <button
            className={`mode-btn ${viewMode === 'category' ? 'active' : ''}`}
            onClick={() => setViewMode('category')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #e5e5e5',
              background: viewMode === 'category' ? '#007AFF' : 'transparent',
              color: viewMode === 'category' ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📊 按分类浏览
          </button>
          <button
            className={`mode-btn ${viewMode === 'channel' ? 'active' : ''}`}
            onClick={() => setViewMode('channel')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #e5e5e5',
              background: viewMode === 'channel' ? '#007AFF' : 'transparent',
              color: viewMode === 'channel' ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📺 按频道浏览 {eligibleChannels.length > 0 && `(${eligibleChannels.length})`}
          </button>
        </div>
      )}

      {/* 分类/频道过滤 */}
      {currentPage === 'history' && (
        <div className="category-filters">
          <div className="filters-container">
            {viewMode === 'category' ? (
              categories.map(category => (
                <button
                  key={category.id}
                  className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="filter-name">{category.name}</span>
                  <span className="filter-count">{category.count}</span>
                </button>
              ))
            ) : (
              channels.map(channel => (
                <button
                  key={channel.id}
                  className={`filter-btn ${selectedChannel === channel.id ? 'active' : ''}`}
                  onClick={() => setSelectedChannel(channel.id)}
                  style={{
                    position: 'relative',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    minHeight: '60px',
                    padding: '8px 12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span className="filter-name" style={{ fontSize: '14px', fontWeight: '600' }}>
                      {channel.name}
                    </span>
                    <span className="filter-count">{channel.count}</span>
                  </div>
                  {channel.id !== 'all' && (
                    <>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#666' }}>
                        <span>均分: {channel.avgScore}</span>
                        <span>最新: {channel.latestDate?.toLocaleDateString('zh-CN')}</span>
                      </div>
                      {/* Smart Channel Analysis Button - 只对符合条件的频道显示 */}
                      {channel.count >= 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // 防止触发频道选择
                            const channelData = channelAggregation.find(c => c.channel === channel.name)
                            if (channelData) {
                              startSmartChannelAnalysis(channelData)
                            }
                          }}
                          style={{
                            marginTop: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'scale(1.05)'
                            e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)'
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'scale(1)'
                            e.target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)'
                          }}
                          title={`智能分析 ${channel.name} 频道的 ${channel.count} 个视频`}
                        >
                          🧠 Smart Channel Analysis
                        </button>
                      )}
                    </>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* 报告列表 */}
      <div className="reports-section">
        <div className="section-header">
          <h3 className="section-title">
            {filteredReports.length > 0 
              ? `共 ${filteredReports.length} 个报告${viewMode === 'channel' && selectedChannel !== 'all' ? ` - ${selectedChannel}` : ''}` 
              : '暂无匹配的报告'
            }
          </h3>
          
          {filteredReports.length > 0 && (
            <div className="sort-options">
              <select className="sort-select">
                <option value="date">按日期排序</option>
                <option value="score">按评分排序</option>
                <option value="title">按标题排序</option>
              </select>
            </div>
          )}
        </div>

        {filteredReports.length > 0 ? (
          <div className="reports-grid">
            {filteredReports.map(report => (
              <div key={report.id} className="report-card">
                <div className="report-thumbnail">
                  <div className="thumbnail-content">
                    {/* 优先显示真实缩略图，fallback到图标 */}
                    {report.analysisResults?.contentInfo?.thumbnails ? (
                      <img 
                        src={report.analysisResults.contentInfo.thumbnails.medium || 
                             report.analysisResults.contentInfo.thumbnails.high ||
                             report.analysisResults.contentInfo.thumbnails.standard ||
                             report.analysisResults.contentInfo.thumbnails.default}
                        alt={report.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          // 图片加载失败时显示默认图标
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div 
                      style={{ 
                        display: report.analysisResults?.contentInfo?.thumbnails ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        fontSize: '24px'
                      }}
                    >
                      {report.type === 'srt' ? '📄' : report.thumbnail || '🎥'}
                    </div>
                  </div>
                  <div className="report-type">
                    <span>{getTypeIcon(report.type)}</span>
                  </div>
                  {report.favorite && (
                    <div className="favorite-badge">⭐</div>
                  )}
                  {/* 新增：真实数据标识 */}
                  {report.analysisResults?.contentInfo?.hasAutoData && (
                    <div className="auto-data-badge" style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: '#10B981',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}>
                      AUTO
                    </div>
                  )}
                </div>
                
                <div className="report-content">
                  <div className="report-header">
                    <h4 className="report-title">{report.title}</h4>
                    <div className="report-score">
                      <span 
                        className="score-value"
                        style={{ color: getScoreColor(report.score) }}
                      >
                        {report.score}
                      </span>
                    </div>
                  </div>
                  
                  <div className="report-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📺</span>
                      <span className="meta-text">{report.channel}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">👁️</span>
                      <span className="meta-text">{report.views}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span className="meta-text">{report.duration}</span>
                    </div>
                  </div>
                  
                  <div className="report-tags">
                    {report.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="report-footer">
                    <div className="report-date">
                      分析时间: {new Date(report.analysisDate).toLocaleDateString('zh-CN')}
                    </div>
                    <div className="report-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => loadExampleReport(report)}
                      >
                        查看报告
                      </button>
                      <button className="action-btn secondary">
                        <span>📤</span>
                      </button>
                      <button className="action-btn secondary">
                        <span>{report.favorite ? '⭐' : '☆'}</span>
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteReport(report.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid #EF4444',
                          color: '#EF4444'
                        }}
                        title="删除报告"
                      >
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {currentPage === 'favorites' ? '⭐' : '📊'}
            </div>
            <h3 className="empty-title">
              {currentPage === 'favorites' ? '还没有收藏的报告' : '暂无分析报告'}
            </h3>
            <p className="empty-description">
              {currentPage === 'favorites' 
                ? '收藏您感兴趣的分析报告，方便随时查阅'
                : searchTerm || selectedCategory !== 'all'
                  ? '试试调整搜索条件或筛选分类'
                  : '开始分析您的第一个视频或SRT文件'
              }
            </p>
            {currentPage === 'history' && historyReports.length === 0 && !searchTerm && selectedCategory === 'all' && (
              <button 
                className="empty-action-btn"
                onClick={clearAllHistory}
              >
                🗑️ 清除历史记录
              </button>
            )}
          </div>
        )}
      </div>

      {/* 数据恢复弹窗 */}
      {showDataRecovery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDataRecovery(false)}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px',
                zIndex: 10001
              }}
            >
              ✕
            </button>
            <DataRecovery />
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryReports