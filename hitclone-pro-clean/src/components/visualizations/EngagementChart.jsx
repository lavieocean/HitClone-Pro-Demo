import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { DebugHelper } from '../../utils/debugHelper'

const EngagementChart = ({ data, compact = false }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!data || !data.hourlyViews) return

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
    const xScale = d3.scaleBand()
      .domain(data.hourlyViews.map(d => d.hour))
      .range([0, innerWidth])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data.hourlyViews, d => d.views)])
      .range([innerHeight, 0])

    // 创建颜色比例尺
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data.hourlyViews, d => d.views)])
      .interpolator(d3.interpolateBlues)

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

    // 添加柱状图
    g.selectAll('.bar')
      .data(data.hourlyViews)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.hour))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.views))
      .attr('height', d => innerHeight - yScale(d.views))
      .attr('fill', d => colorScale(d.views))
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
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

        tooltip.html(`第${d.hour}小时<br/>观看数: ${d.views.toLocaleString()}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')

        d3.select(this)
          .attr('stroke-width', 2)
          .attr('stroke', '#1d4ed8')
      })
      .on('mouseout', function() {
        d3.select('.tooltip').remove()
        d3.select(this)
          .attr('stroke-width', 1)
          .attr('stroke', '#3b82f6')
      })

    // 添加坐标轴
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}h`))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('发布后小时数')

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d >= 1000 ? `${DebugHelper.safeToFixed(d/1000, 1, 'EngagementChart-axis')}K` : d))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('观看数')

  }, [data, compact])

  if (!data) return null

  const formatRate = (rate) => `${DebugHelper.safeToFixed(rate, 1, 'EngagementChart-formatRate')}%`

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">参与度分析</h3>
        <div className="text-sm text-gray-600">
          参与度: {formatRate(data.engagementRate)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold text-blue-600">{formatRate(data.engagementRate)}</p>
          <p className="text-sm text-gray-600">参与度率</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-lg font-semibold text-green-600">{data.peakEngagementTime}</p>
          <p className="text-sm text-gray-600">高峰时间</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-lg font-semibold text-purple-600">{formatRate(data.audienceRetention)}</p>
          <p className="text-sm text-gray-600">观众保留</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-lg font-semibold text-orange-600">{data.interactionPattern}</p>
          <p className="text-sm text-gray-600">互动模式</p>
        </div>
      </div>
      
      <div className="chart-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
        <svg ref={svgRef}></svg>
      </div>
      
      {data.dropoffPoints && data.dropoffPoints.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">观众流失点</h4>
          <div className="flex flex-wrap gap-2">
            {data.dropoffPoints.map((point, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EngagementChart