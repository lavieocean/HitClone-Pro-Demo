import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { DebugHelper } from '../../utils/debugHelper'

const SentimentTimeline = ({ data, compact = false }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || !data.sentimentTimeline) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // 响应式宽度计算
    const container = svgRef.current.parentElement
    const containerWidth = container ? container.clientWidth : 800
    const isMobile = window.innerWidth <= 768
    
    const margin = { 
      top: 20, 
      right: isMobile ? 20 : 30, 
      bottom: isMobile ? 30 : 40, 
      left: isMobile ? 40 : 50 
    }
    
    const width = Math.min(
      containerWidth - 40, // 减去padding
      compact ? (isMobile ? containerWidth - 40 : 400) : (isMobile ? containerWidth - 40 : 800)
    )
    const height = compact ? (isMobile ? 150 : 200) : (isMobile ? 200 : 300)
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    svg.attr('width', width).attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 创建比例尺
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data.sentimentTimeline, d => d.time))
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0])

    // 创建线条生成器
    const line = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.sentiment))
      .curve(d3.curveMonotoneX)

    // 添加网格线
    g.selectAll('.grid-line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)

    // 添加渐变
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'sentiment-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', innerHeight)
      .attr('x2', 0).attr('y2', 0)

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.6)

    // 添加区域
    const area = d3.area()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScale(d.sentiment))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data.sentimentTimeline)
      .attr('fill', 'url(#sentiment-gradient)')
      .attr('d', area)

    // 添加线条
    g.append('path')
      .datum(data.sentimentTimeline)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line)

    // 添加数据点
    g.selectAll('.dot')
      .data(data.sentimentTimeline)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.time))
      .attr('cy', d => yScale(d.sentiment))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) {
        // 创建tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')

        tooltip.transition()
          .duration(200)
          .style('opacity', .9)

        tooltip.html(`时间: ${d.time}分${Math.floor((d.time % 1) * 60)}秒<br/>情感值: ${DebugHelper.safeToFixed(d.sentiment * 100, 1, 'SentimentTimeline-tooltip')}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')

        d3.select(this)
          .attr('r', 6)
          .attr('fill', '#1d4ed8')
      })
      .on('mouseout', function() {
        d3.select('.tooltip').remove()
        d3.select(this)
          .attr('r', 4)
          .attr('fill', '#3b82f6')
      })

    // 添加坐标轴
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}分`))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('时间')

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${DebugHelper.safeToFixed(d * 100, 0, 'SentimentTimeline-axis')}%`))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('情感指数')

  }, [data, compact])

  if (!data) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">情感时间线</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">积极 {data.emotionDistribution.positive}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">中性 {data.emotionDistribution.neutral}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">消极 {data.emotionDistribution.negative}%</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">整体情感: {data.overallSentiment}</span>
          <span className="text-gray-600">情感得分: {DebugHelper.safeToFixed(data.sentimentScore * 100, 1, 'SentimentTimeline-sentimentScore')}%</span>
        </div>
      </div>
      
      <div className="chart-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
        <svg ref={svgRef}></svg>
      </div>
      
      {data.keyEmotions && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">关键情绪</h4>
          <div className="flex flex-wrap gap-2">
            {data.keyEmotions.map((emotion, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SentimentTimeline