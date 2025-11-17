# HitClone Pro Claude API 集成指南

## 🎯 概述

HitClone Pro 已完全集成 Claude API，支持在不同环境中无缝切换，确保用户获得最佳的AI分析体验。

## 🌍 三种运行环境

### 1. ✅ Claude Artifacts 环境（推荐）
- **API状态**: 真实 Claude API
- **分析质量**: 最高，使用真实AI模型
- **使用方法**: 在 Claude 对话中部署此应用
- **识别标志**: API状态指示器显示绿色 "Claude Artifacts环境"

### 2. 🏠 本地开发环境
- **API状态**: 智能模拟模式
- **分析质量**: 高质量模拟，基于真实AI逻辑
- **使用方法**: `npm run dev` 本地运行
- **识别标志**: API状态指示器显示蓝色 "本地增强模拟模式"

### 3. 🌐 生产部署环境
- **API状态**: 基础模拟模式
- **分析质量**: 标准模拟数据
- **使用方法**: 部署到生产服务器
- **识别标志**: API状态指示器显示橙色 "生产模拟模式"

## 🔧 API 调用流程

```javascript
// 自动环境检测和API调用
const claudeApi = await import('./services/claudeApiEnhanced')
const response = await claudeApi.callClaude(prompt, options)
```

### 实现逻辑：
1. **环境检测**: 自动识别 `window.claude.complete` 是否可用
2. **智能降级**: 无API时使用高质量模拟数据
3. **透明切换**: 用户界面保持一致，无需手动配置

## 📊 API 状态监控

应用右上角的状态指示器实时显示：
- **绿色圆点**: `window.claude` 对象存在
- **红色圆点**: Claude API 组件不可用
- **状态文字**: 当前运行模式说明

## 🧪 测试功能

访问 **API Test** 页面可以：
- 检测当前 API 环境
- 测试 Claude API 调用
- 下载详细测试报告
- 查看完整响应数据

## 🚀 部署指南

### Claude Artifacts 部署
1. 在 Claude 对话中粘贴构建后的单文件 HTML
2. 自动获得真实 Claude API 访问权限
3. 享受最高质量的AI分析结果

### 本地开发
```bash
npm install
npm run dev
# 访问 http://localhost:8081
```

### 生产部署
```bash
npm run build
# 部署 dist/ 目录到您的服务器
```

## 💡 智能特性

### 数据结构标准化
无论使用哪种API模式，都返回一致的数据结构：
```json
{
  "contentInfo": {
    "title": "视频标题",
    "channel": "频道名称",
    "views": "观看量"
  },
  "insights": {
    "viralFactors": {
      "hookStrength": 85,
      "curiosityGap": 78,
      "emotionalTrigger": 92
    }
  },
  "emotions": {
    "timeline": [...]
  }
}
```

### 错误处理
- 自动重试机制
- 优雅降级到模拟数据
- 详细错误日志和用户提示

### 性能优化
- 动态导入减少初始加载时间
- 缓存机制提升响应速度
- 智能prompt工程获得更好的AI结果

## 📈 分析维度

HitClone Pro 提供 6 个专业分析维度：

1. **🧬 Viral DNA**: 病毒式传播要素分析
2. **🎢 Emotional Rollercoaster**: 情感曲线时间线
3. **🏔️ Hero's Journey**: 英雄之旅故事结构
4. **⏱️ Watch Time Hacks**: 观看时长优化技巧
5. **💰 Money Shots**: 黄金片段识别
6. **📋 Full Report**: 综合报告和竞争分析

## 🔒 隐私与安全

- 在 Claude Artifacts 环境中，数据通过安全的内建 API 处理
- 本地开发环境中，所有数据仅在浏览器本地处理
- 不会向第三方服务器发送任何用户数据

## 🆘 故障排除

### 常见问题：
1. **API状态显示异常**: 刷新页面重新检测环境
2. **分析结果不符合预期**: 检查输入数据格式和质量
3. **加载速度慢**: 确保网络连接稳定

### 调试工具：
- 打开浏览器控制台查看详细日志
- 使用 API Test 页面诊断API状态
- 下载测试报告进行深度分析

## 📞 技术支持

如遇问题，请提供：
- API 状态指示器截图
- 浏览器控制台错误信息
- API 测试页面的测试报告

---

🎉 **享受 HitClone Pro 带来的强大AI视频分析体验！**