import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { DebugHelper } from '../../utils/debugHelper'

const EmotionalRollercoaster = ({ analysisResults }) => {
  const chartRef = useRef()
  
  // 情感时间线数据
  const emotionalTimeline = analysisResults?.emotions?.timeline || [
    { time: 0, emotion: 'curiosity', intensity: 70, label: '开场好奇' },
    { time: 15, emotion: 'surprise', intensity: 85, label: '意外震撼' },
    { time: 30, emotion: 'excitement', intensity: 90, label: '兴奋高峰' },
    { time: 45, emotion: 'tension', intensity: 75, label: '紧张悬念' },
    { time: 60, emotion: 'relief', intensity: 60, label: '释然放松' },
    { time: 75, emotion: 'excitement', intensity: 95, label: '再次高潮' },
    { time: 90, emotion: 'satisfaction', intensity: 80, label: '满足感' }
  ]

  const emotionColors = {
    curiosity: '#A855F7',
    surprise: '#F59E0B', 
    excitement: '#DBFC53',
    tension: '#EF4444',
    relief: '#06B6D4',
    satisfaction: '#10B981'
  }

  const emotionLabels = {
    curiosity: '好奇',
    surprise: '惊讶', 
    excitement: '兴奋',
    tension: '紧张',
    relief: '释然',
    satisfaction: '满足'
  }

  useEffect(() => {
    if (!chartRef.current || !emotionalTimeline.length) return

    // 清除之前的图表
    d3.select(chartRef.current).selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 800 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // 定义比例尺
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0])

    // 定义线条生成器
    const line = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.intensity))
      .curve(d3.curveCardinal)

    // 绘制背景网格
    g.selectAll(".grid-line")
      .data(yScale.ticks(5))
      .enter().append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-dasharray", "2,2")

    // 绘制情感曲线
    g.append("path")
      .datum(emotionalTimeline)
      .attr("fill", "none")
      .attr("stroke", "#DBFC53")
      .attr("stroke-width", 3)
      .attr("d", line)

    // 绘制情感点
    g.selectAll(".emotion-point")
      .data(emotionalTimeline)
      .enter().append("circle")
      .attr("class", "emotion-point")
      .attr("cx", d => xScale(d.time))
      .attr("cy", d => yScale(d.intensity))
      .attr("r", 6)
      .attr("fill", d => emotionColors[d.emotion])
      .attr("stroke", "#000")
      .attr("stroke-width", 2)

    // 添加情感标签
    g.selectAll(".emotion-label")
      .data(emotionalTimeline)
      .enter().append("text")
      .attr("class", "emotion-label")
      .attr("x", d => xScale(d.time))
      .attr("y", d => yScale(d.intensity) - 15)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .text(d => emotionLabels[d.emotion])

    // 添加坐标轴
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("fill", "#fff")

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "#fff")

  }, [emotionalTimeline])

  // 情感分布统计
  const emotionalStats = {
    dominant: 'excitement',
    variety: 6,
    intensity: 82,
    stability: 68
  }

  return (
    <div className="emotional-rollercoaster-container">
      {/* 情感概览 */}
      <div className="emotional-overview">
        <h3 className="section-title">🎢 情感过山车分析</h3>
        <div className="emotion-summary">
          <div className="emotion-stat">
            <div className="stat-icon">😍</div>
            <div className="stat-content">
              <h4>主导情感</h4>
              <div className="stat-value">兴奋/激动</div>
              <p>观众主要体验到高强度的兴奋感</p>
            </div>
          </div>
          
          <div className="emotion-stat">
            <div className="stat-icon">🌈</div>
            <div className="stat-content">
              <h4>情感丰富度</h4>
              <div className="stat-value">{emotionalStats.variety}种</div>
              <p>情感类型多样，层次丰富</p>
            </div>
          </div>
          
          <div className="emotion-stat">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h4>平均强度</h4>
              <div className="stat-value">{emotionalStats.intensity}%</div>
              <p>情感强度远超平均水平</p>
            </div>
          </div>
          
          <div className="emotion-stat">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>情感稳定性</h4>
              <div className="stat-value">{emotionalStats.stability}%</div>
              <p>起伏适中，节奏控制良好</p>
            </div>
          </div>
        </div>
      </div>

      {/* 情感时间线图表 */}
      <div className="emotional-timeline">
        <h3 className="section-title">📈 情感强度时间线</h3>
        <div className="chart-container">
          <div ref={chartRef} className="emotion-chart"></div>
        </div>
      </div>

      {/* 关键情感节点 */}
      <div className="emotion-highlights">
        <h3 className="section-title">🎯 关键情感节点</h3>
        <div className="highlights-grid">
          {emotionalTimeline.map((point, index) => (
            <div key={index} className="highlight-card">
              <div className="highlight-time">{DebugHelper.safeToFixed(point.time, 0, 'EmotionalRollercoaster-time')}%</div>
              <div 
                className="highlight-emotion"
                style={{ color: emotionColors[point.emotion] }}
              >
                {emotionLabels[point.emotion]}
              </div>
              <div className="highlight-intensity">
                强度: {point.intensity}%
              </div>
              <div className="highlight-description">{point.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 情感策略分析 */}
      <div className="emotion-strategy">
        <h3 className="section-title">🧠 情感设计策略</h3>
        <div className="strategy-grid">
          <div className="strategy-card">
            <div className="strategy-header">
              <span className="strategy-icon">🚀</span>
              <h4>开场吸引</h4>
            </div>
            <p>通过好奇心快速抓住观众注意，为后续情感铺垫奠定基础</p>
            <div className="strategy-effectiveness">
              有效性: <span className="effectiveness-high">95%</span>
            </div>
          </div>
          
          <div className="strategy-card">
            <div className="strategy-header">
              <span className="strategy-icon">🎢</span>
              <h4>情感起伏</h4>
            </div>
            <p>通过张弛有度的节奏控制，创造令人难忘的情感体验</p>
            <div className="strategy-effectiveness">
              有效性: <span className="effectiveness-high">88%</span>
            </div>
          </div>
          
          <div className="strategy-card">
            <div className="strategy-header">
              <span className="strategy-icon">🏁</span>
              <h4>情感收尾</h4>
            </div>
            <p>以满足感结束，让观众带着正面情绪离开并产生分享冲动</p>
            <div className="strategy-effectiveness">
              有效性: <span className="effectiveness-medium">78%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="emotion-recommendations">
        <h3 className="section-title">💡 情感优化建议</h3>
        <div className="recommendations-list">
          <div className="recommendation-item">
            <div className="rec-icon">⚡</div>
            <div className="rec-content">
              <h4>强化情感高峰</h4>
              <p>在75%处的兴奋高峰可以再延长10-15秒，充分利用观众的情感投入</p>
            </div>
          </div>
          
          <div className="recommendation-item">
            <div className="rec-icon">🔄</div>
            <div className="rec-content">
              <h4>平滑情感过渡</h4>
              <p>在60%的释然阶段增加过渡元素，避免情感落差过大导致观众流失</p>
            </div>
          </div>
          
          <div className="recommendation-item">
            <div className="rec-icon">🎯</div>
            <div className="rec-content">
              <h4>情感召回点</h4>
              <p>在关键情感节点加入视觉或音频提示，增强观众的情感记忆</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionalRollercoaster