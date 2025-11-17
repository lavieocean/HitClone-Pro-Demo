#!/usr/bin/env node

/**
 * HitClone Pro 服务器健康检查和自动管理脚本
 * 提供智能端口选择、故障检测和自动恢复功能
 */

import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

class ServerHealthManager {
  constructor(options = {}) {
    this.config = {
      ports: options.ports || [8081, 8082, 8083, 8084, 8085],
      maxRetries: options.maxRetries || 3,
      checkInterval: options.checkInterval || 30000, // 30秒
      timeout: options.timeout || 10000,
      autoRestart: options.autoRestart || false,
      buildBeforeStart: options.buildBeforeStart !== false
    }
    
    this.serverProcess = null
    this.activePort = null
    this.healthCheckInterval = null
    this.failureCount = 0
    this.isShuttingDown = false
    
    // 绑定信号处理
    this.setupSignalHandlers()
  }

  /**
   * 启动服务器健康管理
   */
  async start() {
    console.log('🏥 启动 HitClone Pro 服务器健康管理器')
    console.log(`📊 配置: 端口=${this.config.ports.join(',')} 自动重启=${this.config.autoRestart}`)
    
    try {
      // 步骤1: 检查现有服务器
      const existingPort = await this.findHealthyServer()
      
      if (existingPort) {
        console.log(`✅ 发现健康服务器: http://localhost:${existingPort}/`)
        this.activePort = existingPort
        
        if (this.config.autoRestart) {
          this.startHealthMonitoring()
        }
        
        return { success: true, port: existingPort, action: 'found_existing' }
      }
      
      // 步骤2: 启动新服务器
      console.log('🚀 启动新服务器...')
      const result = await this.startNewServer()
      
      if (result.success) {
        if (this.config.autoRestart) {
          this.startHealthMonitoring()
        }
        
        console.log(`\n🎉 服务器健康管理器就绪!`)
        console.log(`🌐 服务器地址: http://localhost:${result.port}/`)
        console.log(`🔄 健康监控: ${this.config.autoRestart ? '已启用' : '已禁用'}`)
        
        return result
      }
      
      throw new Error('所有端口都无法启动服务器')
      
    } catch (error) {
      console.error('❌ 服务器启动失败:', error.message)
      return { success: false, error: error.message }
    }
  }

  /**
   * 查找现有的健康服务器
   */
  async findHealthyServer() {
    console.log('🔍 扫描现有服务器...')
    
    for (const port of this.config.ports) {
      const isHealthy = await this.checkServerHealth(port)
      if (isHealthy) {
        return port
      }
    }
    
    return null
  }

  /**
   * 检查单个端口的服务器健康状态
   */
  async checkServerHealth(port, detailed = false) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), this.config.timeout)
      
      const response = await fetch(`http://localhost:${port}/`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'HitClone-HealthCheck/1.0'
        }
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        if (detailed) console.log(`❌ 端口 ${port}: HTTP ${response.status}`)
        return false
      }
      
      // 检查响应内容
      const content = await response.text()
      const hasReactRoot = content.includes('id="root"')
      const hasHitClone = content.includes('HitClone') || content.includes('hitclone')
      const hasViteApp = content.includes('vite') || content.includes('type="module"')
      
      const isHealthy = hasReactRoot && (hasHitClone || hasViteApp)
      
      if (detailed) {
        console.log(`${isHealthy ? '✅' : '⚠️'} 端口 ${port}: React=${hasReactRoot} HitClone=${hasHitClone} Vite=${hasViteApp}`)
      }
      
      return isHealthy
      
    } catch (error) {
      if (detailed && error.name !== 'AbortError') {
        console.log(`❌ 端口 ${port}: ${error.message}`)
      }
      return false
    }
  }

  /**
   * 启动新服务器
   */
  async startNewServer() {
    // 检查是否需要构建
    if (this.config.buildBeforeStart) {
      const needsBuild = await this.checkBuildStatus()
      
      if (needsBuild) {
        console.log('🔨 构建应用...')
        try {
          const { stdout, stderr } = await execAsync('npm run build', { 
            timeout: 120000,
            cwd: process.cwd()
          })
          
          if (stderr && !stderr.includes('warning')) {
            throw new Error(`构建错误: ${stderr}`)
          }
          
          console.log('✅ 应用构建完成')
        } catch (error) {
          throw new Error(`构建失败: ${error.message}`)
        }
      } else {
        console.log('⏭️ 跳过构建 (dist目录已存在)')
      }
    }
    
    // 尝试在不同端口启动服务器
    for (const port of this.config.ports) {
      try {
        console.log(`🔄 尝试启动服务器在端口 ${port}...`)
        
        const serverResult = await this.launchServerOnPort(port)
        if (serverResult.success) {
          this.activePort = port
          this.serverProcess = serverResult.process
          
          console.log(`✅ 服务器启动成功: http://localhost:${port}/`)
          return { success: true, port, action: 'started_new' }
        }
        
      } catch (error) {
        console.log(`❌ 端口 ${port} 启动失败: ${error.message}`)
      }
    }
    
    return { success: false, error: '所有端口都被占用或无法启动' }
  }

  /**
   * 在指定端口启动服务器
   */
  async launchServerOnPort(port) {
    return new Promise((resolve, reject) => {
      // 使用环境变量指定端口
      const env = { ...process.env, PORT: port.toString() }
      
      const serverProcess = spawn('node', ['server.cjs'], {
        cwd: process.cwd(),
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let isResolved = false
      let startupOutput = ''
      
      // 监听启动输出
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString()
        startupOutput += output
        
        // 检查启动成功标识
        if (output.includes('服务器启动成功') || output.includes(`${port}`)) {
          // 延迟验证服务器真正可访问
          setTimeout(async () => {
            if (!isResolved) {
              const isHealthy = await this.checkServerHealth(port, true)
              if (isHealthy) {
                isResolved = true
                resolve({ success: true, process: serverProcess })
              } else {
                serverProcess.kill()
                reject(new Error('服务器启动但健康检查失败'))
              }
            }
          }, 2000)
        }
      })
      
      serverProcess.stderr.on('data', (data) => {
        const error = data.toString()
        if (error.includes('EADDRINUSE') || error.includes('被占用')) {
          if (!isResolved) {
            isResolved = true
            serverProcess.kill()
            reject(new Error(`端口 ${port} 被占用`))
          }
        } else if (error.includes('EACCES')) {
          if (!isResolved) {
            isResolved = true
            serverProcess.kill()
            reject(new Error(`端口 ${port} 权限被拒绝`))
          }
        }
      })
      
      serverProcess.on('error', (error) => {
        if (!isResolved) {
          isResolved = true
          reject(new Error(`服务器进程错误: ${error.message}`))
        }
      })
      
      serverProcess.on('exit', (code) => {
        if (!isResolved && code !== 0) {
          isResolved = true
          reject(new Error(`服务器退出，代码: ${code}`))
        }
      })
      
      // 超时处理
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          serverProcess.kill()
          reject(new Error(`端口 ${port} 启动超时`))
        }
      }, 15000)
    })
  }

  /**
   * 检查构建状态
   */
  async checkBuildStatus() {
    try {
      const distPath = path.join(process.cwd(), 'dist')
      const indexPath = path.join(distPath, 'index.html')
      
      // 检查dist目录和index.html
      const [distStats, indexStats] = await Promise.all([
        fs.stat(distPath).catch(() => null),
        fs.stat(indexPath).catch(() => null)
      ])
      
      if (!distStats || !indexStats) {
        return true // 需要构建
      }
      
      // 检查index.html大小
      if (indexStats.size < 500) {
        return true // 文件太小，可能构建不完整
      }
      
      // 检查是否有主要资源文件
      const files = await fs.readdir(distPath)
      const hasJs = files.some(f => f.endsWith('.js'))
      const hasCss = files.some(f => f.endsWith('.css'))
      
      return !(hasJs && hasCss) // 如果缺少关键文件，需要重新构建
      
    } catch (error) {
      return true // 检查失败，安全起见重新构建
    }
  }

  /**
   * 启动健康监控
   */
  startHealthMonitoring() {
    console.log(`🔄 启动健康监控 (间隔: ${this.config.checkInterval / 1000}秒)`)
    
    this.healthCheckInterval = setInterval(async () => {
      if (this.isShuttingDown) return
      
      const isHealthy = await this.checkServerHealth(this.activePort)
      
      if (!isHealthy) {
        this.failureCount++
        console.log(`⚠️ 健康检查失败 (${this.failureCount}/${this.config.maxRetries})`)
        
        if (this.failureCount >= this.config.maxRetries) {
          console.log('🔄 触发自动重启...')
          await this.restart()
        }
      } else {
        if (this.failureCount > 0) {
          console.log('✅ 服务器恢复健康')
          this.failureCount = 0
        }
      }
    }, this.config.checkInterval)
  }

  /**
   * 重启服务器
   */
  async restart() {
    console.log('🔄 重启服务器...')
    
    try {
      // 停止当前服务器
      if (this.serverProcess) {
        this.serverProcess.kill('SIGTERM')
        
        // 等待进程退出
        await new Promise(resolve => {
          this.serverProcess.on('exit', resolve)
          setTimeout(resolve, 5000) // 5秒超时
        })
      }
      
      // 启动新服务器
      const result = await this.startNewServer()
      
      if (result.success) {
        console.log('✅ 服务器重启成功')
        this.failureCount = 0
      } else {
        console.error('❌ 服务器重启失败')
      }
      
    } catch (error) {
      console.error('❌ 重启过程出错:', error.message)
    }
  }

  /**
   * 优雅关闭
   */
  async shutdown() {
    if (this.isShuttingDown) return
    
    this.isShuttingDown = true
    console.log('\n🛑 正在关闭服务器健康管理器...')
    
    // 停止健康检查
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    // 停止服务器进程
    if (this.serverProcess) {
      console.log('🔄 正在停止服务器...')
      this.serverProcess.kill('SIGTERM')
      
      // 等待优雅退出
      await new Promise(resolve => {
        this.serverProcess.on('exit', () => {
          console.log('✅ 服务器已关闭')
          resolve()
        })
        
        // 强制关闭超时
        setTimeout(() => {
          if (this.serverProcess) {
            this.serverProcess.kill('SIGKILL')
            console.log('⚡ 强制关闭服务器')
          }
          resolve()
        }, 5000)
      })
    }
    
    console.log('✅ 健康管理器已关闭')
  }

  /**
   * 设置信号处理器
   */
  setupSignalHandlers() {
    const signals = ['SIGINT', 'SIGTERM']
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        await this.shutdown()
        process.exit(0)
      })
    })
    
    process.on('uncaughtException', async (error) => {
      console.error('❌ 未捕获的异常:', error)
      await this.shutdown()
      process.exit(1)
    })
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      activePort: this.activePort,
      serverRunning: !!this.serverProcess,
      healthMonitoring: !!this.healthCheckInterval,
      failureCount: this.failureCount,
      config: this.config
    }
  }
}

// CLI 入口
async function main() {
  const args = process.argv.slice(2)
  const options = {}
  
  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--auto-restart':
        options.autoRestart = true
        break
      case '--no-build':
        options.buildBeforeStart = false
        break
      case '--port':
        const ports = args[++i]?.split(',').map(p => parseInt(p))
        if (ports) options.ports = ports
        break
      case '--interval':
        options.checkInterval = parseInt(args[++i]) * 1000
        break
      case '--help':
        console.log(`
HitClone Pro 服务器健康管理器

用法: node scripts/server-health.js [选项]

选项:
  --auto-restart    启用自动重启功能
  --no-build        跳过构建步骤
  --port <ports>    指定端口列表 (例: 8081,8082,8083)
  --interval <sec>  健康检查间隔秒数 (默认: 30)
  --help           显示帮助信息

示例:
  node scripts/server-health.js --auto-restart
  node scripts/server-health.js --port 8081,8090 --interval 15
`)
        process.exit(0)
        break
    }
  }
  
  const manager = new ServerHealthManager(options)
  const result = await manager.start()
  
  if (!result.success) {
    process.exit(1)
  }
  
  // 如果没有启用自动重启，显示状态并退出
  if (!options.autoRestart) {
    console.log('\n💡 提示: 使用 --auto-restart 启用持续监控')
  }
}

// 仅在直接运行时执行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ 启动失败:', error.message)
    process.exit(1)
  })
}

export default ServerHealthManager