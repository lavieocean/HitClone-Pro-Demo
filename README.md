# HitClone Pro - AI视频分析工具

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.8-orange)](https://d3js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📌 项目概要

HitClone Pro 是一个专为 **Claude Artifacts** 环境设计的 AI 驱动视频分析工具，支持 YouTube 和 Bilibili 视频的深度分析。通过 Claude AI 和 Gemini AI 的强大能力，提供内容理解、情感分析、参与度评估和频道洞察等功能。

**核心特点**：
- 🚀 零配置启动 - 使用 Claude 内建 API
- 🤖 双 AI 引擎 - Claude + Gemini 智能分析
- 📊 10 维度频道分析 - 全方位数据洞察
- 📈 交互式可视化 - D3.js 驱动的动态图表
- 💾 本地历史管理 - 数据持久化和一键恢复
- 📱 响应式设计 - 完美适配桌面和移动端

---

## 🎯 核心功能

### 1️⃣ 视频分析 (4步AI分析链)
- **内容提取** - 标题、描述、标签、字幕自动提取
- **情感分析** - 观众情绪和评论情感深度分析
- **参与度分析** - 互动率、保留率等关键指标计算
- **综合洞察** - 优势分析和改进建议生成

### 2️⃣ 频道深度分析 (Smart Channel Analysis)
10大分析模块：
- **Channel Compass** - 频道导航和总览
- **Content Matrix** - 内容矩阵和分类
- **Audience Pulse** - 受众脉搏监测
- **Hook Leaderboard** - 开场吸引力排行
- **Retention Heatmap** - 留存热力图
- **Thumbnail Hall** - 缩略图效果分析
- **Money Stack** - 收益潜力评估
- **Shorts Mining** - Shorts 内容挖掘
- **Strategy Playbook** - 策略建议手册
- **Data Freshness Log** - 数据新鲜度日志

### 3️⃣ 历史数据管理
- 本地 LocalStorage 数据持久化
- 按视频/按频道双模式浏览
- 一键恢复和深度扫描
- 智能去重和数据清洗

### 4️⃣ 数据可视化
- 情感时间线图表
- 参与度趋势分析
- 视频指标仪表板
- 交互式洞察面板

---

## 🛠️ 技术栈

### 前端框架
- **React 18.2** - 并发特性 + Hooks
- **Vite 4.4** - 快速构建工具
- **Tailwind CSS 3.3** - 实用优先 CSS

### 数据可视化
- **D3.js 7.8** - 交互式图表库
- **Lucide React** - 现代化图标

### AI 集成
- **Claude API** - 内建 API (`window.claude.complete()`)
- **Gemini API** - Google AI 模型支持

### 工具链
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Express** - 开发服务器

---

## 📁 项目结构

```
HitClone-Pro-Demo/
├── hitclone-pro-clean/          # 主项目目录
│   ├── src/                     # 源代码
│   │   ├── components/          # React 组件 (50+)
│   │   │   ├── channel/         # 频道分析模块
│   │   │   │   └── modules/     # 10大分析模块
│   │   │   ├── pages/           # 页面级组件 (11个)
│   │   │   ├── visualizations/  # D3.js 可视化组件 (4个)
│   │   │   ├── layout/          # 布局组件 (5个)
│   │   │   ├── report/          # 报告生成组件 (11个)
│   │   │   └── debug/           # 调试工具 (6个)
│   │   ├── services/            # API 服务层 (14个)
│   │   ├── hooks/               # 自定义 Hooks (1个)
│   │   ├── utils/               # 工具函数 (6个)
│   │   ├── prompts/             # AI 提示词模板 (2个)
│   │   ├── styles/              # 样式文件 (4个)
│   │   └── testing/             # 测试框架
│   ├── scripts/                 # 构建和测试脚本
│   ├── debug/                   # 浏览器调试工具
│   ├── _archive/                # 历史版本存档
│   └── [文档文件]               # 10+ Markdown 文档
└── README.md                    # 本文件
```

---

## 📊 代码分布统计

### 按文件类型
- **JSX/JS 文件**: 91 个
- **样式文件**: 4 个 CSS
- **文档文件**: 15+ Markdown
- **配置文件**: 8 个
- **总代码行数**: ~63,690 行

### 核心模块代码量
| 模块 | 文件数 | 主要功能 |
|------|--------|----------|
| **页面组件** | 11 | 启动页、报告页、设置页、历史页 |
| **频道分析** | 10 | 10维度深度分析模块 |
| **可视化组件** | 4 | D3.js 图表和仪表板 |
| **报告生成** | 11 | 多版本静态报告生成器 |
| **服务层** | 14 | API 调用、数据处理、报告导出 |
| **调试工具** | 6 | 系统健康、数据恢复、诊断面板 |
| **布局组件** | 5 | 应用框架、导航、侧边栏 |
| **工具函数** | 6 | 数据清洗、错误追踪、API 保护 |

### 重点文件
| 文件 | 大小 | 功能 |
|------|------|------|
| `youTubeDataService.js` | 35KB | YouTube 数据抓取 |
| `channelAggregationService.js` | 30KB | 频道数据聚合 |
| `completeReportExporter.js` | 28KB | 完整报告导出 |
| `HistoryReports.jsx` | 47KB | 历史数据管理界面 |
| `HitCloneChannelDashboard.jsx` | 34KB | 频道分析仪表板 |
| `VideoInput.jsx` | 39KB | 视频输入和验证 |

---

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装运行

```bash
# 进入项目目录
cd hitclone-pro-clean

# 安装依赖
npm install

# 启动开发服务器（推荐）
npm run start
# 访问 http://localhost:8081/

# 或使用 Vite 开发模式
npm run dev
# 访问 http://localhost:3000/
```

### 构建生产版本

```bash
npm run build    # 构建
npm run preview  # 预览构建结果
```

### 测试

```bash
npm run test:quick      # 30秒快速检查
npm run test:standard   # 2分钟标准测试
npm run test:analysis   # YouTube 分析测试
npm run test:recovery   # 历史恢复测试
```

---

## 📚 文档

项目包含完整的文档体系：

- **[快速启动指南](hitclone-pro-clean/QUICK_START_GUIDE.md)** - 3种启动方法和功能测试
- **[测试指南](hitclone-pro-clean/TESTING_GUIDE.md)** - 自动化测试系统使用
- **[Claude 部署指南](hitclone-pro-clean/CLAUDE_DEPLOYMENT_GUIDE.md)** - Claude Artifacts 部署
- **[API 使用指南](hitclone-pro-clean/SCRAPING_DOG_API_GUIDE.md)** - ScrapingDog API 配置
- **[移动端测试](hitclone-pro-clean/MOBILE_TEST_GUIDE.md)** - 响应式设计测试
- **[完整 README](hitclone-pro-clean/README.md)** - 项目主文档

---

## 🧪 测试系统

### 自动化测试框架
- **TestRunner.js** - 完整测试引擎
- **4 大测试套件** - Server、API、Analysis、Recovery
- **双环境支持** - CLI + 浏览器内测试
- **100% 核心功能覆盖**

### 测试命令
```bash
npm run test:quick    # ⚡ 30秒快速检查
npm run test:standard # 🔧 2分钟标准测试
npm run test:full     # 📋 完整功能测试
npm run test:server   # 🖥️ 服务器健康检查
```

---

## 🎨 主要特性

### ✅ 智能分析
- AI 驱动的 4 步分析链
- 自动内容提取和理解
- 情感智能分析
- 趋势预测和建议

### ✅ 数据可视化
- D3.js 交互式图表
- 实时数据更新
- 自定义可视化组件
- 支持导出和分享

### ✅ 用户体验
- 响应式设计
- Toast 通知系统
- 加载状态和动画
- 完善的错误处理

### ✅ 开发体验
- 模块化架构
- 完整的类型检查
- 自动化测试
- 详细的文档

---

## 📝 API 配置

### ScrapingDog API (已配置)
- YouTube 字幕抓取
- 视频元数据获取
- API Key: `68660c4306b4f8aafe2d25dd`

### Gemini API (用户配置)
1. 进入应用 → API Settings
2. 选择 Google Gemini 提供商
3. 输入您的 Gemini API Key
4. 测试连接

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发工作流
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📧 联系方式

- 提交 [GitHub Issue](https://github.com/lavieocean/HitClone-Pro-Demo/issues)
- 查看[项目文档](hitclone-pro-clean/)

---

**HitClone Pro** - 让视频分析变得简单而强大 🎬✨
