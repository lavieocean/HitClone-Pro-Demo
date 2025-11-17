#!/usr/bin/env node

/**
 * HitClone Pro 独立测试执行器
 * 提供命令行接口和完整的测试执行功能
 */

import TestRunner from '../src/testing/TestRunner.js'
import ServerHealthManager from './server-health.js'

async function main() {
  const args = process.argv.slice(2)
  
  // 解析命令行参数
  const options = {
    mode: 'standard',
    suites: [],
    headless: true,
    autoServer: true,
    verbose: false,
    timeout: 30000
  }
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--mode':
        options.mode = args[++i]
        break
      case '--suite':
        options.suites.push(args[++i])
        break
      case '--suites':
        options.suites = args[++i]?.split(',') || []
        break
      case '--headless':
        options.headless = args[++i] !== 'false'
        break
      case '--no-server':
        options.autoServer = false
        break
      case '--verbose':
        options.verbose = true
        break
      case '--timeout':
        options.timeout = parseInt(args[++i]) * 1000
        break
      case '--help':
        showHelp()
        process.exit(0)
        break
    }
  }
  
  console.log('🧪 HitClone Pro 测试执行器')
  console.log(`📋 模式: ${options.mode}`)
  console.log(`🎯 套件: ${options.suites.length > 0 ? options.suites.join(', ') : '默认'}`)
  console.log()
  
  try {
    let serverManager = null
    
    // 如果启用自动服务器管理，先确保服务器运行
    if (options.autoServer) {
      console.log('🔧 检查服务器状态...')
      serverManager = new ServerHealthManager({
        buildBeforeStart: true,
        autoRestart: false
      })
      
      const serverResult = await serverManager.start()
      if (!serverResult.success) {
        throw new Error(`服务器启动失败: ${serverResult.error}`)
      }
      
      console.log(`✅ 服务器就绪: http://localhost:${serverResult.port}/\n`)
    }
    
    // 创建并运行测试
    const testRunner = new TestRunner({
      mode: options.mode,
      headless: options.headless,
      timeout: options.timeout,
      serverPorts: serverManager ? [serverManager.activePort] : undefined
    })
    
    const result = await testRunner.runTests(options.suites)
    
    // 显示最终结果
    console.log()
    if (result.success) {
      console.log('🎉 所有测试通过!')
      if (result.serverUrl) {
        console.log(`🌐 应用地址: ${result.serverUrl}`)
      }
      process.exit(0)
    } else {
      console.log('❌ 测试失败，请查看上述详细信息')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ 测试执行出错:', error.message)
    if (options.verbose && error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
HitClone Pro 测试执行器

用法: node scripts/test-runner.js [选项]

模式选项:
  --mode <mode>         测试模式 (quick|standard|full)
  --suite <suite>       执行单个测试套件
  --suites <suites>     执行多个测试套件 (逗号分隔)

执行选项:
  --headless <bool>     浏览器无头模式 (默认: true)
  --no-server          跳过自动服务器管理
  --timeout <seconds>   测试超时时间 (默认: 30)
  --verbose            显示详细错误信息

测试模式:
  quick     - 快速检查 (服务器 + API)
  standard  - 标准测试 (服务器 + API + 核心功能)
  full      - 完整测试 (包含UI和浏览器测试)

测试套件:
  server      - 服务器健康检查
  api         - API功能测试
  analysis    - YouTube分析功能测试
  recovery    - 历史数据恢复测试
  ui          - 用户界面测试
  responsive  - 响应式设计测试

示例:
  # 快速测试
  node scripts/test-runner.js --mode quick
  
  # 标准测试
  node scripts/test-runner.js --mode standard
  
  # 只测试分析功能
  node scripts/test-runner.js --suite analysis
  
  # 测试多个套件
  node scripts/test-runner.js --suites server,api,analysis
  
  # 完整测试（包含浏览器）
  node scripts/test-runner.js --mode full --headless false
`)
}

// 仅在直接运行时执行
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as runTests }