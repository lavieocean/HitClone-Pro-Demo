import React, { useState, useEffect } from 'react'

const DataRecovery = () => {
  const [allLocalStorageData, setAllLocalStorageData] = useState({})
  const [recoveredReports, setRecoveredReports] = useState([])
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    scanLocalStorage()
  }, [])

  const scanLocalStorage = () => {
    const allData = {}
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          // 尝试解析JSON
          try {
            const parsed = JSON.parse(value)
            allData[key] = {
              type: 'json',
              data: parsed,
              size: value.length,
              raw: value
            }
          } catch {
            allData[key] = {
              type: 'string',
              data: value,
              size: value.length,
              raw: value
            }
          }
        }
      } catch (error) {
        console.error(`读取localStorage key ${key} 失败:`, error)
      }
    })

    setAllLocalStorageData(allData)
    
    // 查找可能的历史报告数据
    findHistoryReports(allData)
  }

  const findHistoryReports = (data) => {
    const possibleReports = []
    
    Object.entries(data).forEach(([key, value]) => {
      // 查找包含分析相关的键
      if (key.toLowerCase().includes('analysis') || 
          key.toLowerCase().includes('history') ||
          key.toLowerCase().includes('report') ||
          key.toLowerCase().includes('hitclone')) {
        
        if (value.type === 'json' && Array.isArray(value.data)) {
          // 检查数组中的对象是否像报告数据
          value.data.forEach((item, index) => {
            if (item && typeof item === 'object' && 
                (item.title || item.analysisResults || item.score !== undefined)) {
              possibleReports.push({
                source: key,
                index: index,
                data: item,
                isHistoryReport: true
              })
            }
          })
        } else if (value.type === 'json' && value.data && typeof value.data === 'object' &&
                   (value.data.title || value.data.analysisResults || value.data.score !== undefined)) {
          possibleReports.push({
            source: key,
            data: value.data,
            isHistoryReport: true
          })
        }
      }
      
      // 也检查其他可能包含视频分析数据的键
      if (value.type === 'json') {
        if (Array.isArray(value.data)) {
          value.data.forEach((item, index) => {
            if (item && typeof item === 'object' && item.contentInfo && item.insights) {
              possibleReports.push({
                source: key,
                index: index,
                data: item,
                isAnalysisResult: true
              })
            }
          })
        }
      }
    })

    setSearchResults(possibleReports)
  }

  const recoverData = (reportData, isFullArray = false) => {
    try {
      let dataToRecover = []
      
      if (isFullArray) {
        dataToRecover = reportData
      } else {
        // 单个报告，需要转换为标准格式
        if (reportData.isAnalysisResult) {
          // 这是分析结果，需要转换为历史报告格式
          const historyItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: reportData.data.contentInfo?.title || '恢复的分析报告',
            channel: reportData.data.contentInfo?.channel || '未知频道',
            views: reportData.data.contentInfo?.views || '0 views',
            duration: reportData.data.contentInfo?.duration || '0:00',
            score: reportData.data.insights?.viralFactors ? 
              Math.round(Object.values(reportData.data.insights.viralFactors).reduce((a, b) => a + b, 0) / 5) : 75,
            type: 'recovered',
            category: 'tech',
            tags: ['数据恢复', 'AI分析'],
            thumbnail: '🔄',
            analysisDate: new Date().toISOString(),
            favorite: false,
            analysisResults: reportData.data
          }
          dataToRecover = [historyItem]
        } else {
          dataToRecover = [reportData.data]
        }
      }
      
      // 获取现有的历史报告
      const existingReports = JSON.parse(localStorage.getItem('hitclone-analysis-history') || '[]')
      
      // 合并数据，避免重复
      const allReports = [...existingReports]
      dataToRecover.forEach(newReport => {
        // 检查是否已存在（基于标题和时间）
        const exists = existingReports.some(existing => 
          existing.title === newReport.title && 
          existing.analysisDate === newReport.analysisDate
        )
        if (!exists) {
          allReports.push(newReport)
        }
      })
      
      // 保存到localStorage
      localStorage.setItem('hitclone-analysis-history', JSON.stringify(allReports))
      
      setRecoveredReports(prev => [...prev, ...dataToRecover])
      
      alert(`成功恢复 ${dataToRecover.length} 个报告！请刷新页面查看。`)
      
    } catch (error) {
      console.error('恢复数据失败:', error)
      alert('恢复数据失败: ' + error.message)
    }
  }

  const restoreFromBackup = () => {
    // 检查常见的备份键名
    const backupKeys = [
      'hitclone-analysis-history',
      'hitclone-analysis-history-backup',
      'hitclone-history-backup', 
      'analysis-history-backup',
      'video-analysis-history',
      'hitclone-reports',
      'youtube-analysis-history',
      'ai-analysis-history'
    ]
    
    let totalFound = 0
    let allRecoveredData = []
    
    // 扫描所有可能的备份位置
    for (const key of backupKeys) {
      const backup = allLocalStorageData[key]
      if (backup && backup.type === 'json' && Array.isArray(backup.data)) {
        console.log(`🔍 发现数据在 ${key}:`, backup.data.length, '个项目')
        totalFound += backup.data.length
        allRecoveredData = [...allRecoveredData, ...backup.data]
      }
    }
    
    if (totalFound > 0) {
      if (confirm(`🎉 发现 ${totalFound} 个历史报告，是否一次性全部恢复？\n\n这将会合并所有找到的数据并去重。`)) {
        // 去重处理
        const uniqueData = []
        const seenIds = new Set()
        const seenTitles = new Set()
        
        allRecoveredData.forEach(item => {
          // 基于ID或标题+时间去重
          const id = item.id || `${item.title}-${item.analysisDate}`
          const titleTime = `${item.title}-${item.analysisDate}`
          
          if (!seenIds.has(id) && !seenTitles.has(titleTime)) {
            seenIds.add(id)
            seenTitles.add(titleTime)
            uniqueData.push(item)
          }
        })
        
        console.log(`📊 去重后: ${uniqueData.length} 个唯一报告`)
        recoverData(uniqueData, true)
        
        // 显示详细恢复信息
        setTimeout(() => {
          alert(`✅ 恢复完成！\n\n原始数据: ${totalFound} 个\n去重后: ${uniqueData.length} 个\n\n请刷新页面查看恢复的历史报告。`)
        }, 1000)
        
        return
      }
    }
    
    // 如果没有找到自动备份，扫描所有可能包含分析数据的键
    const potentialKeys = Object.keys(allLocalStorageData).filter(key => 
      key.toLowerCase().includes('analysis') || 
      key.toLowerCase().includes('history') ||
      key.toLowerCase().includes('report') ||
      key.toLowerCase().includes('video') ||
      key.toLowerCase().includes('hitclone')
    )
    
    if (potentialKeys.length > 0) {
      const keyList = potentialKeys.join('\n- ')
      if (confirm(`未找到标准备份，但发现 ${potentialKeys.length} 个可能包含数据的键:\n\n- ${keyList}\n\n是否手动检查这些数据？`)) {
        // 显示详细的数据分析界面
        alert('请在下方的数据列表中手动选择要恢复的数据。')
      }
    } else {
      alert('❌ 未找到任何可恢复的历史数据。\n\n可能的原因:\n1. 数据从未保存过\n2. 使用了不同的浏览器或设备\n3. 清除了浏览器数据')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.95)',
      color: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.2)',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 10000
    }}>
      <h2 style={{ marginBottom: '20px', color: '#DBFC53' }}>
        🔄 数据恢复工具
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={restoreFromBackup}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            marginRight: '12px',
            fontWeight: '600'
          }}
        >
          🎯 一键恢复所有数据
        </button>
        
        <button
          onClick={() => {
            // 快速扫描主要位置
            const mainKey = 'hitclone-analysis-history'
            const backup = allLocalStorageData[mainKey]
            if (backup && backup.type === 'json' && Array.isArray(backup.data)) {
              if (confirm(`发现主数据位置有 ${backup.data.length} 个报告，是否恢复？`)) {
                recoverData(backup.data, true)
              }
            } else {
              restoreFromBackup()
            }
          }}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            marginRight: '12px'
          }}
        >
          🔍 快速扫描
        </button>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: '#10B981',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          ✅ 完成恢复
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#F59E0B', marginBottom: '12px' }}>
          📊 LocalStorage 数据扫描
        </h3>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
          找到 {Object.keys(allLocalStorageData).length} 个localStorage键
        </div>
      </div>

      {searchResults.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#10B981', marginBottom: '12px' }}>
            🎯 发现的历史报告数据
          </h3>
          {searchResults.map((result, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '12px',
              marginBottom: '8px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#DBFC53' }}>
                    {result.data.title || '未知标题'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    来源: {result.source} | 类型: {result.isAnalysisResult ? '分析结果' : '历史报告'}
                  </div>
                  {result.data.channel && (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                      频道: {result.data.channel}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => recoverData(result)}
                  style={{
                    padding: '6px 12px',
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  恢复
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 style={{ color: '#F59E0B', marginBottom: '12px' }}>
          🗂️ 所有 LocalStorage 数据
        </h3>
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {Object.entries(allLocalStorageData).map(([key, value]) => (
            <div key={key} style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '8px',
              marginBottom: '4px',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#DBFC53', fontWeight: 'bold' }}>{key}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {value.type} | {value.size} chars
                </span>
              </div>
              {value.type === 'json' && Array.isArray(value.data) && (
                <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                  数组长度: {value.data.length}
                  {value.data.length > 0 && value.data[0].title && (
                    <button
                      onClick={() => recoverData(value.data, true)}
                      style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        background: '#F59E0B',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      恢复全部
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {recoveredReports.length > 0 && (
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
          <div style={{ color: '#10B981', fontWeight: 'bold' }}>
            ✅ 已恢复 {recoveredReports.length} 个报告
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
            请点击"完成恢复"按钮刷新页面查看恢复的数据
          </div>
        </div>
      )}
    </div>
  )
}

export default DataRecovery