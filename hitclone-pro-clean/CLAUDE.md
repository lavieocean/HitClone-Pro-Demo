# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HitClone Pro是一个专为Claude Artifacts环境设计的AI驱动视频分析工具。该项目完全基于Claude的内建API (`window.claude.complete`)，无需外部API配置，用户使用自己的Claude订阅额度即可享受完整的视频分析服务。

## Core Architecture

### 技术栈
- **React 18**: 现代化UI框架，支持Concurrent特性
- **D3.js**: 强大的数据可视化库，用于创建交互式图表
- **Tailwind CSS**: 实用优先的CSS框架，快速构建响应式界面
- **Vite**: 现代化构建工具，提供快速的开发体验
- **多重API支持**: 
  - **Claude Artifacts API**: 使用`window.claude.complete`进行AI分析
  - **第三方API**: 支持Claude、OpenAI、Gemini、OpenRouter等多个AI服务提供商
  - **智能降级**: 自动检测环境并使用最佳可用API

### 项目结构
```
src/
├── components/           # React组件
│   ├── visualizations/   # 可视化组件 (D3.js)
│   ├── Header.jsx       # 应用头部
│   ├── VideoInput.jsx   # 视频URL输入
│   ├── AnalysisProgress.jsx # 分析进度显示
│   └── VisualizationDashboard.jsx # 结果展示面板
├── hooks/               # 自定义React Hooks
│   └── useVideoAnalysis.js # 视频分析逻辑
├── services/            # 服务层
│   ├── claudeApiEnhanced.js  # 增强版Claude API封装，支持多重API
│   ├── thirdPartyApi.js      # 第三方API服务集成
│   └── localClaudeProxy.js   # 本地Claude代理服务
├── utils/               # 工具函数
├── App.jsx              # 主应用组件
└── main.jsx            # 应用入口
```

## Key Features

### 4步AI分析链
1. **视频内容提取**: 分析视频元数据、标题、描述等基础信息
2. **情感分析**: 评估观众情绪反应和评论情感倾向
3. **热度分析**: 计算参与度指标和趋势变化
4. **综合洞察**: 生成最终分析报告和可视化数据

### 智能频道分析功能 (Smart Channel Analysis)
- **智能检测**: 在History Reports页面按频道浏览时，自动识别拥有3+视频的频道
- **一键分析**: 为符合条件的频道显示"🧠 Smart Channel Analysis"按钮
- **无缝跳转**: 点击按钮自动跳转到HitClone Channel并加载历史分析数据
- **数据复用**: 利用已有的视频分析结果，避免重复分析消耗

### AI API集成
- **优先级系统**: 第三方API > Claude Artifacts API > 本地模拟
- **第三方API支持**: Claude (Anthropic)、OpenAI、Google Gemini、OpenRouter
- **API Key管理**: 安全的本地存储，支持测试连接
- **自动降级**: 智能检测可用API并自动切换
- **智能prompt工程**: 针对每个分析步骤和API提供商优化

### 可视化组件
- **SentimentTimeline**: D3.js实现的情感时间线图表
- **EngagementChart**: 参与度柱状图和趋势分析
- **InsightsPanel**: 综合洞察和推荐策略展示
- **VideoMetrics**: 视频基础数据卡片

## Development Commands

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## Claude Artifacts优化

### 环境检测
项目会自动检测是否在Claude Artifacts环境中运行：
- 检测`window.claude.complete`是否可用
- 自动降级到模拟数据模式
- 提供完整的开发体验

### 性能优化
- 使用React.memo优化组件渲染
- D3.js图表采用增量更新策略
- Tailwind CSS使用purge优化包体积
- Vite构建优化，支持代码分割

### 用户体验
- 实时分析进度展示
- 交互式数据可视化
- 响应式设计，支持多设备
- 一键分享和导出功能

## API Integration Notes

### 多重API调用优先级
```javascript
// 优先级：第三方API > Claude Artifacts > 本地模拟
async callClaude(prompt, options = {}) {
  // 1. 首先尝试第三方API
  const { default: thirdPartyApi } = await import('./thirdPartyApi.js')
  if (thirdPartyApi.isConfigured()) {
    return await thirdPartyApi.callApi(prompt, options)
  }
  
  // 2. 然后尝试Claude Artifacts API
  if (window.claude?.complete) {
    return await window.claude.complete({ prompt, ...options })
  }
  
  // 3. 最后降级到本地模拟
  return await this.localApiSimulator({ prompt, ...options })
}
```

### 第三方API配置
```javascript
// API配置存储在localStorage中
const apiConfig = {
  provider: 'claude',    // 'claude', 'openai', 'gemini', 'openrouter'
  apiKey: 'your-api-key',
  endpoint: 'https://api.anthropic.com/v1/messages',
  model: 'claude-3-sonnet-20240229',
  enabled: true
}
```

### Prompt工程
- 每个分析步骤使用专门优化的prompt
- 要求JSON格式返回，便于数据处理
- 包含详细的上下文和指令
- 支持中文和英文双语分析

## Deployment for Claude Artifacts

### 构建优化
- 所有依赖打包到单一bundle
- 不依赖外部CDN资源
- 内联关键CSS和JS
- 支持离线运行

### 兼容性
- 支持现代浏览器
- 渐进式功能增强
- 优雅降级处理
- 移动端适配

## Troubleshooting

### 常见问题
1. **Claude API不可用**: 自动降级到模拟数据模式
2. **可视化渲染问题**: 检查D3.js版本兼容性
3. **样式问题**: 确保Tailwind CSS正确配置
4. **构建失败**: 检查依赖版本和Node.js环境

### 调试技巧
- 使用浏览器开发者工具查看Claude API调用
- 检查console.log输出的分析结果
- 使用React DevTools调试组件状态
- 验证D3.js数据绑定是否正确

## Future Enhancements

- 支持更多视频平台（抖音、微博等）
- 添加实时数据更新功能
- 集成更多可视化图表类型
- 支持批量视频分析
- 添加用户偏好设置