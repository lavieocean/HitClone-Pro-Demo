import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/enhanced-components.css'

// 自动启用演示模式（GitHub Pages 部署时）
if (window.location.hostname.includes('github.io')) {
  console.log('🎬 检测到 GitHub Pages 环境，自动启用演示模式')
  localStorage.setItem('hitclone_demo_mode', 'true')
}

// 检查 URL 参数
const urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('demo') === 'true' || urlParams.has('demo')) {
  console.log('🎬 通过 URL 参数启用演示模式')
  localStorage.setItem('hitclone_demo_mode', 'true')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)