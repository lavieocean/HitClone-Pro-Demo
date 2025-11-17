# 🔒 API Key 安全指南

## ⚠️ 重要提醒

**永远不要将 API Key 直接提交到 Git 仓库！**

本项目已经配置了环境变量系统来保护您的 API Key。

---

## 📋 已修复的安全问题

### ✅ 修复内容

1. **移除硬编码的 API Key**
   - 从 `src/services/youTubeDataService.js` 移除
   - 从文档中移除敏感信息

2. **添加环境变量支持**
   - 创建 `.env.example` 模板文件
   - 更新代码使用 `import.meta.env.VITE_SCRAPINGDOG_API_KEY`
   - `.env` 文件已加入 `.gitignore`

3. **GitHub Actions 安全配置**
   - 使用 GitHub Secrets 存储 API Key
   - 部署时通过环境变量注入

---

## 🛡️ 本地开发配置

### 步骤 1: 创建 .env 文件

```bash
cd hitclone-pro-clean
cp .env.example .env
```

### 步骤 2: 填写 API Key

编辑 `.env` 文件：

```env
# ScrapingDog API Key (必需)
VITE_SCRAPINGDOG_API_KEY=your_actual_api_key_here

# Gemini API Key (可选)
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### 步骤 3: 验证配置

```bash
npm run dev
```

打开应用后，检查控制台是否有 API Key 相关错误。

---

## 🌐 GitHub Pages 部署配置

### 步骤 1: 添加 GitHub Secret

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. Name: `VITE_SCRAPINGDOG_API_KEY`
4. Secret: 粘贴您的 API Key
5. 点击 **Add secret**

### 步骤 2: 启用 GitHub Pages

1. 进入 **Settings** → **Pages**
2. Source 选择 **GitHub Actions**
3. 保存设置

### 步骤 3: 触发部署

推送代码到 main 或 master 分支：

```bash
git push origin main
```

部署完成后，访问:
```
https://your-username.github.io/HitClone-Pro-Demo/
```

---

## 🔍 如何获取 API Key

### ScrapingDog API

1. 访问 [ScrapingDog](https://www.scrapingdog.com/)
2. 注册账号
3. 在 Dashboard 复制 API Key
4. 免费套餐：1000 次/月请求

### Google Gemini API

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账号
3. 创建 API Key
4. 免费套餐：60 次/分钟请求

---

## 📝 检查清单

在提交代码前，请确认：

- [ ] `.env` 文件未被添加到 git（已在 `.gitignore` 中）
- [ ] 代码中没有硬编码的 API Key
- [ ] `.env.example` 文件只包含占位符，不含真实 Key
- [ ] 文档中没有暴露真实的 API Key
- [ ] GitHub Secrets 已正确配置（部署时）

---

## 🚨 如果 API Key 已泄露

### 立即行动：

1. **撤销泄露的 Key**
   - ScrapingDog: Dashboard → API Keys → Regenerate
   - Gemini: Google Cloud Console → Revoke Key

2. **生成新的 Key**
   - 创建新的 API Key
   - 更新本地 `.env` 文件
   - 更新 GitHub Secrets

3. **清理 Git 历史（可选）**
   ```bash
   # 使用 git-filter-repo 清理敏感信息
   # 警告：这会改写历史，谨慎使用
   ```

---

## 💡 最佳实践

1. **使用环境变量**
   - 所有敏感信息都通过环境变量配置
   - 不同环境使用不同的配置

2. **分离配置文件**
   - `.env` - 本地开发，不提交
   - `.env.example` - 模板文件，可以提交
   - GitHub Secrets - 生产环境

3. **定期轮换 Key**
   - 每 3-6 个月更换一次 API Key
   - 及时撤销不再使用的 Key

4. **监控使用情况**
   - 定期检查 API 使用量
   - 设置用量告警
   - 异常情况立即调查

---

## 📞 需要帮助？

如果您在配置过程中遇到问题：

1. 查看 [README.md](README.md) 的 API 配置章节
2. 检查 [DEPLOYMENT.md](DEPLOYMENT.md) 部署指南
3. 提交 [GitHub Issue](https://github.com/lavieocean/HitClone-Pro-Demo/issues)

---

**安全第一！保护好您的 API Key** 🔒
