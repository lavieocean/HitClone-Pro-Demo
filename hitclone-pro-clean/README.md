# HitClone Pro - Claude Artifacts视频分析工具

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.8-orange)](https://d3js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-38bdf8)](https://tailwindcss.com/)
[![Claude API](https://img.shields.io/badge/Claude%20API-Built--in-9f7ae0)](https://claude.ai/)

一个专为Claude Artifacts环境设计的AI驱动视频分析工具，使用Claude内建API提供强大的视频内容分析和可视化功能。

## ✨ 核心优势

- 🚀 **零配置启动**: 使用Claude内建API，无需额外API密钥
- 💰 **成本可控**: 使用您自己的Claude订阅额度
- 🔄 **4步分析链**: 内容提取 → 情感分析 → 热度分析 → 综合洞察
- 📊 **交互式可视化**: D3.js驱动的动态图表和数据展示
- 📱 **响应式设计**: 完美适配桌面和移动端
- 📤 **一键分享**: 支持结果分享和数据导出

## 🎯 功能特色

### AI分析引擎
- **视频内容理解**: 自动提取标题、描述、标签等元数据
- **情感智能分析**: 深度分析观众情绪反应和评论情感
- **参与度计算**: 精确计算互动率、保留率等关键指标  
- **趋势预测**: 基于数据预测内容传播潜力和改进方向

### 可视化仪表板
- **情感时间线**: 展示视频播放过程中的情感变化曲线
- **参与度图表**: 直观显示观众参与度和流失点
- **洞察报告**: 自动生成优势分析和改进建议
- **数据导出**: 支持JSON格式的完整数据导出

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装运行

```bash
# 克隆项目
git clone <repository-url>
cd hitclone-pro

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 在Claude Artifacts中使用

1. 将构建后的代码复制到Claude Artifacts中
2. 直接运行，无需额外配置
3. 输入YouTube或Bilibili视频链接开始分析

## 🛠️ 技术架构

### 前端技术
- **React 18**: 采用最新的Concurrent特性和Hooks
- **Vite**: 快速的开发构建工具
- **Tailwind CSS**: 实用优先的CSS框架

### 数据可视化
- **D3.js**: 创建交互式和动态的数据图表
- **自定义组件**: 针对视频分析场景优化的可视化组件

### AI集成
- **Claude API**: 使用`window.claude.complete()`调用内建API
- **智能降级**: 开发环境自动使用模拟数据
- **Prompt工程**: 专门优化的分析提示词

## 📊 分析流程

```mermaid
graph LR
    A[输入视频URL] --> B[步骤1: 内容提取]
    B --> C[步骤2: 情感分析]
    C --> D[步骤3: 参与度分析]
    D --> E[步骤4: 综合洞察]
    E --> F[可视化展示]
```

每个步骤都使用专门训练的AI模型进行分析，确保结果的准确性和实用性。

## 🎨 界面预览

- **输入界面**: 简洁的视频链接输入，支持YouTube和Bilibili
- **分析进度**: 实时显示4步分析的进展状态
- **结果仪表板**: 多标签页展示不同维度的分析结果
- **数据可视化**: 交互式图表，支持hover详情和数据导出

## 🔧 开发指南

### 项目结构
```
src/
├── components/          # React组件
│   ├── visualizations/ # D3.js可视化组件
│   └── *.jsx           # 页面组件
├── hooks/              # 自定义Hooks
├── services/           # API服务层
└── utils/              # 工具函数
```

### 核心文件
- `src/services/claudeApi.js`: Claude API集成和调用逻辑
- `src/hooks/useVideoAnalysis.js`: 视频分析状态管理
- `src/components/visualizations/`: D3.js可视化组件库

### 开发命令
```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览构建结果
npm run lint       # 代码检查
npm run format     # 代码格式化
```

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进项目！

## 📞 支持

如果您在使用过程中遇到问题，请通过以下方式获取帮助：
- 提交GitHub Issue
- 查看项目文档
- 联系开发团队

---

**HitClone Pro** - 让视频分析变得简单而强大 🎬✨