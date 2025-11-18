#!/usr/bin/env node

/**
 * 开发前清理脚本 - 实现 o3 Pro 建议的端口清理和环境准备
 */

import { spawn, exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

class PredevCleanup {
  constructor() {
    this.targetPorts = [8081, 8082, 8083, 8084, 8085]
    this.isWin = process.platform === 'win32'
    this.isMac = process.platform === 'darwin'
  }

  async run() {
    console.log('🧹 开始开发环境清理...\n')
    
    try {
      // 步骤1: 清理端口占用
      await this.cleanupPorts()
      
      // 步骤2: 检查内存使用
      await this.checkMemoryUsage()
      
      // 步骤3: 清理临时文件
      await this.cleanupTempFiles()
      
      // 步骤4: 验证环境
      await this.verifyEnvironment()
      
      console.log('✅ 开发环境清理完成!\n')
      
    } catch (error) {
      console.error('❌ 清理过程出错:', error.message)
      process.exit(1)
    }
  }

  /**
   * 清理端口占用
   */
  async cleanupPorts() {
    console.log('🔌 清理端口占用...')
    
    for (const port of this.targetPorts) {
      try {
        console.log(`📡 检查端口 ${port}...`)
        
        if (this.isWin) {
          await this.killPortWindows(port)
        } else {
          await this.killPortUnix(port)
        }
        
      } catch (error) {
        console.log(`⚠️ 端口 ${port} 清理失败: ${error.message}`)
      }
    }
    
    console.log('✅ 端口清理完成\n')
  }

  /**
   * Unix/Mac 端口清理
   */
  async killPortUnix(port) {
    try {
      // 查找占用端口的进程
      const { stdout } = await execAsync(`lsof -ti:${port}`)
      const pids = stdout.trim().split('\n').filter(pid => pid)
      
      if (pids.length > 0) {
        console.log(`🔫 发现端口 ${port} 被进程占用: ${pids.join(', ')}`)
        
        // 强制杀死进程
        for (const pid of pids) {
          await execAsync(`kill -9 ${pid}`)
          console.log(`💀 已杀死进程 ${pid}`)
        }
      } else {
        console.log(`✅ 端口 ${port} 空闲`)
      }
    } catch (error) {
      // lsof 没有输出说明端口空闲
      if (error.message.includes('Command failed')) {
        console.log(`✅ 端口 ${port} 空闲`)
      } else {
        throw error
      }
    }
  }

  /**
   * Windows 端口清理
   */
  async killPortWindows(port) {
    try {
      // 查找占用端口的进程
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      const lines = stdout.trim().split('\n')
      
      const pids = new Set()
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1]
          if (pid && pid !== '0') {
            pids.add(pid)
          }
        }
      }
      
      if (pids.size > 0) {
        console.log(`🔫 发现端口 ${port} 被进程占用: ${Array.from(pids).join(', ')}`)
        
        // 强制杀死进程
        for (const pid of pids) {
          await execAsync(`taskkill /PID ${pid} /F`)
          console.log(`💀 已杀死进程 ${pid}`)
        }
      } else {
        console.log(`✅ 端口 ${port} 空闲`)
      }
    } catch (error) {
      // netstat 没有输出说明端口空闲
      if (error.message.includes('Command failed')) {
        console.log(`✅ 端口 ${port} 空闲`)
      } else {
        throw error
      }
    }
  }

  /**
   * 检查内存使用情况
   */
  async checkMemoryUsage() {
    console.log('🧠 检查内存使用情况...')
    
    try {
      if (this.isWin) {
        const { stdout } = await execAsync('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value')
        console.log('💾 内存状态 (Windows):', stdout)
      } else if (this.isMac) {
        const { stdout } = await execAsync('vm_stat')
        const memInfo = stdout.split('\n').slice(0, 5).join('\n')
        console.log('💾 内存状态 (macOS):\n', memInfo)
        
        // 检查是否需要设置 Node.js 内存限制
        const nodeOptions = process.env.NODE_OPTIONS || ''
        if (!nodeOptions.includes('--max-old-space-size')) {
          console.log('💡 建议设置 NODE_OPTIONS="--max-old-space-size=4096" 提升性能')
        }
      } else {
        const { stdout } = await execAsync('free -h')
        console.log('💾 内存状态 (Linux):\n', stdout)
      }
    } catch (error) {
      console.warn('⚠️ 无法获取内存信息:', error.message)
    }
    
    console.log('✅ 内存检查完成\n')
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles() {
    console.log('🗑️ 清理临时文件...')
    
    const cleanupPaths = [
      'node_modules/.vite',
      'node_modules/.cache',
      'dist',
      '.vite',
      'coverage'
    ]
    
    for (const path of cleanupPaths) {
      try {
        if (this.isWin) {
          await execAsync(`if exist "${path}" rmdir /s /q "${path}"`)
        } else {
          await execAsync(`rm -rf "${path}"`)
        }
        console.log(`🗑️ 已清理: ${path}`)
      } catch (error) {
        // 文件不存在或已被清理
        console.log(`✅ ${path} 已清理或不存在`)
      }
    }
    
    console.log('✅ 临时文件清理完成\n')
  }

  /**
   * 验证开发环境
   */
  async verifyEnvironment() {
    console.log('🔍 验证开发环境...')
    
    // 检查 Node.js 版本
    try {
      const { stdout } = await execAsync('node --version')
      console.log(`📦 Node.js 版本: ${stdout.trim()}`)
    } catch (error) {
      throw new Error('Node.js 未安装或不可用')
    }
    
    // 检查 npm 版本
    try {
      const { stdout } = await execAsync('npm --version')
      console.log(`📦 npm 版本: ${stdout.trim()}`)
    } catch (error) {
      throw new Error('npm 未安装或不可用')
    }
    
    // 检查项目依赖
    try {
      const fs = await import('fs')
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      console.log(`📦 项目: ${packageJson.name} v${packageJson.version}`)
    } catch (error) {
      console.warn('⚠️ 无法读取 package.json')
    }
    
    console.log('✅ 环境验证完成\n')
  }
}

// 运行清理脚本
const cleanup = new PredevCleanup()
cleanup.run().catch(error => {
  console.error('💥 清理脚本失败:', error)
  process.exit(1)
})