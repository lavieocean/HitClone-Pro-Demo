# 🚀 HitClone Pro 在线部署指南

## 方法一：Vercel 一键部署 (推荐)

### 步骤：

1. **访问 Vercel**
   - 打开 [Vercel](https://vercel.com/)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择导入 GitHub 仓库 `HitClone-Pro-Demo`
   - 选择 `hitclone-pro-clean` 目录作为根目录

3. **配置构建**
   ```
   Framework Preset: Vite
   Root Directory: hitclone-pro-clean
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟完成构建
   - 获得在线访问地址: `https://your-project.vercel.app`

### 一键部署按钮

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lavieocean/HitClone-Pro-Demo&root-directory=hitclone-pro-clean)

---

## 方法二：Netlify 部署

### 步骤：

1. **访问 Netlify**
   - 打开 [Netlify](https://www.netlify.com/)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 GitHub 仓库 `HitClone-Pro-Demo`

3. **配置构建**
   ```
   Base directory: hitclone-pro-clean
   Build command: npm run build
   Publish directory: hitclone-pro-clean/dist
   ```

4. **部署**
   - 点击 "Deploy site"
   - 获得在线访问地址: `https://your-project.netlify.app`

---

## 方法三：GitHub Pages 部署

### 步骤：

1. **修改 vite.config.js**
   ```javascript
   base: '/HitClone-Pro-Demo/'  // 改为你的仓库名
   ```

2. **添加部署脚本**
   在 `hitclone-pro-clean/package.json` 中添加：
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **安装 gh-pages**
   ```bash
   cd hitclone-pro-clean
   npm install --save-dev gh-pages
   ```

4. **部署**
   ```bash
   npm run deploy
   ```

5. **访问地址**
   `https://lavieocean.github.io/HitClone-Pro-Demo/`

---

## 方法四：StackBlitz 在线体验 (无需安装)

### 立即体验：

点击下面的链接在浏览器中直接运行项目：

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/lavieocean/HitClone-Pro-Demo/tree/claude/analyze-hitclone-pro-01Pb6zcUrUm6hvMaBbEgFuXj/hitclone-pro-clean)

**优点**：
- ✅ 无需本地安装
- ✅ 在线 IDE 直接编辑
- ✅ 实时预览
- ✅ 可分享链接

---

## 方法五：CodeSandbox 在线体验

### 立即体验：

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/lavieocean/HitClone-Pro-Demo/tree/claude/analyze-hitclone-pro-01Pb6zcUrUm6hvMaBbEgFuXj/hitclone-pro-clean)

---

## 环境变量配置 (可选)

如果需要配置 API Key，可以在部署平台添加环境变量：

### Vercel/Netlify 环境变量：
```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SCRAPINGDOG_API_KEY=68660c4306b4f8aafe2d25dd
```

---

## 部署后检查清单

- [ ] 页面正常加载
- [ ] 视频输入功能正常
- [ ] API 调用成功
- [ ] 数据可视化显示正常
- [ ] 响应式设计在移动端正常
- [ ] LocalStorage 数据持久化正常

---

## 故障排除

### 构建失败
```bash
# 本地测试构建
cd hitclone-pro-clean
npm install
npm run build
npm run preview
```

### API 调用失败
- 检查 API Key 配置
- 查看浏览器控制台错误信息
- 确认 CORS 设置正确

### 页面空白
- 检查 `vite.config.js` 中的 `base` 配置
- 查看浏览器控制台是否有 JavaScript 错误
- 确认构建产物在正确的目录

---

## 推荐配置

**最佳选择**: **Vercel**
- ✅ 自动 HTTPS
- ✅ CDN 加速
- ✅ 自动部署（push 到 GitHub 自动重新部署）
- ✅ 免费额度充足
- ✅ 部署速度快

**快速体验**: **StackBlitz**
- ✅ 无需注册/登录
- ✅ 即开即用
- ✅ 可在线编辑代码
- ✅ 适合快速演示

---

## 自动部署配置

### GitHub Actions 自动部署到 Vercel

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - working-directory: hitclone-pro-clean
        run: |
          npm install
          npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: hitclone-pro-clean
```

---

**快速开始**: 推荐使用 [Vercel 一键部署](https://vercel.com/new/clone?repository-url=https://github.com/lavieocean/HitClone-Pro-Demo&root-directory=hitclone-pro-clean) 🚀
