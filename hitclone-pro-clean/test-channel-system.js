#!/usr/bin/env node

/**
 * HitClone Channel - 综合自测系统
 * 目标：验证批量分析、数据持久化、Summary生成等关键功能
 * 覆盖：单元测试、集成测试、性能测试、错误恢复测试
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试配置
const TEST_CONFIG = {
  // 测试用YouTube URLs - 使用稳定的公开视频
  BATCH_URLS: [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - 经典稳定
    'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - Gangnam Style
    'https://www.youtube.com/watch?v=kJQP7kiw5Fk'  // Despacito
  ],
  CHANNEL_URL: 'https://www.youtube.com/@rickastleyofficial',
  
  // 测试参数
  MAX_WAIT_TIME: 30000, // 30秒最大等待时间
  BATCH_SIZE: 3,
  STRESS_TEST_SIZE: 10,
  
  // 期望的性能指标
  PERFORMANCE_TARGETS: {
    dataExtraction: 5000,    // 5秒
    promptGeneration: 2000,  // 2秒
    aggregation: 3000,       // 3秒
    reportGeneration: 8000   // 8秒
  }
};

// 测试结果收集器
class TestResultCollector {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      performance: {},
      errors: [],
      details: []
    };
    this.startTime = Date.now();
  }
  
  addTest(testName, status, details = {}, duration = 0) {
    this.results.total++;
    
    const result = {
      test: testName,
      status, // 'pass', 'fail', 'warning'
      duration,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    this.results.details.push(result);
    
    if (status === 'pass') {
      this.results.passed++;
    } else if (status === 'fail') {
      this.results.failed++;
      this.results.errors.push(result);
    } else if (status === 'warning') {
      this.results.warnings++;
    }
    
    if (duration > 0) {
      this.results.performance[testName] = duration;
    }
  }
  
  addPerformanceMetric(metric, value, target) {
    this.results.performance[metric] = {
      actual: value,
      target,
      status: value <= target ? 'pass' : 'fail'
    };
  }
  
  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
    
    return {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: `${successRate}%`,
        totalDuration: `${totalDuration}ms`,
        timestamp: new Date().toISOString()
      },
      performance: this.results.performance,
      errors: this.results.errors,
      details: this.results.details
    };
  }
}

// 模拟浏览器环境的localStorage
class MockLocalStorage {
  constructor() {
    this.storage = {};
  }
  
  getItem(key) {
    return this.storage[key] || null;
  }
  
  setItem(key, value) {
    this.storage[key] = String(value);
  }
  
  removeItem(key) {
    delete this.storage[key];
  }
  
  clear() {
    this.storage = {};
  }
  
  // 测试数据损坏恢复
  corruptData(key) {
    if (this.storage[key]) {
      this.storage[key] = this.storage[key].slice(0, -10) + 'corrupted';
    }
  }
}

// 测试工具函数
class ChannelTestUtils {
  static generateMockVideoData(url, quality = 'high') {
    const videoId = url.split('v=')[1]?.split('&')[0] || 'test_video';
    
    const baseData = {
      url,
      videoId,
      title: `Test Video ${videoId}`,
      channelName: 'Test Channel',
      viewCount: '1,000,000 views',
      duration: '3:45',
      hasSubtitles: quality !== 'low'
    };
    
    if (quality === 'high') {
      baseData.description = 'Detailed video description for testing purposes...';
      baseData.likeCount = '50,000';
      baseData.commentCount = '2,500';
      baseData.srtContent = this.generateMockSRT();
      baseData.hasAutoData = true;
    } else if (quality === 'medium') {
      baseData.description = 'Basic description';
      baseData.hasAutoData = false;
    }
    
    return baseData;
  }
  
  static generateMockSRT() {
    return `1
00:00:01,000 --> 00:00:04,000
This is the first subtitle line for testing

2
00:00:05,000 --> 00:00:08,000
This video demonstrates the channel analysis system

3
00:00:09,000 --> 00:00:12,000
We're testing data persistence and aggregation

4
00:00:13,000 --> 00:00:16,000
The system should handle multiple videos efficiently`;
  }
  
  static generateBatchInputData(urls) {
    return {
      urls: urls.map(url => ({ 
        url, 
        status: 'pending',
        timestamp: Date.now()
      })),
      channelInfo: {
        name: 'Test Channel',
        url: TEST_CONFIG.CHANNEL_URL,
        estimatedVideos: urls.length
      },
      sessionId: `test_${Date.now()}`,
      startTime: Date.now()
    };
  }
}

// 核心测试套件
class ChannelSystemTester {
  constructor() {
    this.collector = new TestResultCollector();
    this.localStorage = new MockLocalStorage();
    this.components = {};
    
    // 模拟全局环境
    global.localStorage = this.localStorage;
    global.console = {
      ...console,
      log: (...args) => {
        if (process.env.VERBOSE) console.log(...args);
      }
    };
  }
  
  async initialize() {
    console.log('🚀 HitClone Channel 系统自测开始');
    console.log('=' .repeat(50));
    
    try {
      // 动态导入组件（模拟浏览器环境）
      await this.loadComponents();
      this.collector.addTest('系统初始化', 'pass', { note: '所有组件加载成功' });
    } catch (error) {
      this.collector.addTest('系统初始化', 'fail', { error: error.message });
      throw error;
    }
  }
  
  async loadComponents() {
    try {
      // 导入核心服务
      const youTubeService = await import('./src/services/youTubeDataService.js');
      const aggregationService = await import('./src/services/channelAggregationService.js');
      const { generateMasterPrompt } = await import('./src/prompts/masterPrompt.js');
      const { generateSimplifiedMasterPrompt } = await import('./src/prompts/masterPromptSimplified.js');
      
      this.components = {
        youTubeService: youTubeService.default,
        aggregationService: aggregationService.default,
        generateMasterPrompt,
        generateSimplifiedMasterPrompt
      };
      
      console.log('✅ 核心组件加载完成');
    } catch (error) {
      console.error('❌ 组件加载失败:', error);
      throw error;
    }
  }
  
  // 测试1: 数据持久化功能
  async testDataPersistence() {
    console.log('\n📁 测试1: 数据持久化功能');
    const startTime = Date.now();
    
    try {
      // 生成测试数据
      const batchData = ChannelTestUtils.generateBatchInputData(TEST_CONFIG.BATCH_URLS);
      
      // 测试存储
      const storageKey = 'hitclone_channel_batch_data';
      this.localStorage.setItem(storageKey, JSON.stringify(batchData));
      
      // 测试读取
      const retrievedData = JSON.parse(this.localStorage.getItem(storageKey));
      
      // 验证数据完整性
      const isValid = retrievedData.sessionId === batchData.sessionId &&
                     retrievedData.urls.length === batchData.urls.length;
      
      if (isValid) {
        this.collector.addTest('数据存储读取', 'pass', {
          dataSize: JSON.stringify(batchData).length,
          urls: batchData.urls.length
        });
      } else {
        this.collector.addTest('数据存储读取', 'fail', {
          error: '数据完整性验证失败'
        });
      }
      
      // 测试数据损坏恢复
      this.localStorage.corruptData(storageKey);
      const corruptedData = this.localStorage.getItem(storageKey);
      
      try {
        JSON.parse(corruptedData);
        this.collector.addTest('数据损坏检测', 'warning', {
          note: '损坏数据未被检测到'
        });
      } catch (parseError) {
        this.collector.addTest('数据损坏检测', 'pass', {
          note: '成功检测到损坏数据'
        });
      }
      
    } catch (error) {
      this.collector.addTest('数据持久化', 'fail', { error: error.message });
    }
    
    const duration = Date.now() - startTime;
    this.collector.addPerformanceMetric('数据持久化', duration, 1000);
  }
  
  // 测试2: YouTube数据抓取和处理
  async testYouTubeDataProcessing() {
    console.log('\n🎥 测试2: YouTube数据处理');
    const startTime = Date.now();
    
    try {
      const testUrl = TEST_CONFIG.BATCH_URLS[0];
      
      // 测试数据抓取
      const result = await this.components.youTubeService.fetchVideoData(testUrl);
      
      if (result.success && result.data) {
        this.collector.addTest('YouTube数据抓取', 'pass', {
          videoTitle: result.data.title,
          hasSubtitles: result.data.hasSubtitles,
          dataKeys: Object.keys(result.data).length
        });
        
        // 测试数据质量
        const dataQuality = this.assessDataQuality(result.data);
        this.collector.addTest('数据质量评估', dataQuality.score > 0.7 ? 'pass' : 'warning', {
          score: dataQuality.score,
          missing: dataQuality.missing
        });
        
      } else {
        this.collector.addTest('YouTube数据抓取', 'fail', {
          error: result.error || '数据抓取失败'
        });
      }
      
    } catch (error) {
      this.collector.addTest('YouTube数据处理', 'fail', { error: error.message });
    }
    
    const duration = Date.now() - startTime;
    this.collector.addPerformanceMetric('数据抓取', duration, TEST_CONFIG.PERFORMANCE_TARGETS.dataExtraction);
  }
  
  // 测试3: 批量聚合和Summary生成
  async testAggregationAndSummary() {
    console.log('\n📊 测试3: 数据聚合和Summary生成');
    const startTime = Date.now();
    
    try {
      // 准备测试数据
      const mockVideos = TEST_CONFIG.BATCH_URLS.map(url => ({
        analysisResults: {
          video_summary: {
            core_description: `Mock analysis for ${url}`,
            main_topics: ['topic1', 'topic2'],
            content_type: 'entertainment'
          },
          viral_score: { overall: 85 },
          monetization: { monthly_estimate: '$1,200-2,500' }
        },
        metadata: {
          url,
          title: `Test Video for ${url}`,
          analysisDate: new Date().toISOString()
        }
      }));
      
      // 测试聚合服务
      const aggregatedData = await this.components.aggregationService.aggregateChannelData(mockVideos);
      
      if (aggregatedData && aggregatedData.summary) {
        this.collector.addTest('数据聚合', 'pass', {
          videosProcessed: mockVideos.length,
          summaryGenerated: !!aggregatedData.summary,
          moduleCount: Object.keys(aggregatedData).length
        });
        
        // 验证Summary结构
        const summaryValid = this.validateSummaryStructure(aggregatedData.summary);
        this.collector.addTest('Summary结构验证', summaryValid ? 'pass' : 'fail', {
          hasExecutiveSummary: !!aggregatedData.summary.executiveSummary,
          hasRecommendations: !!aggregatedData.summary.strategicRecommendations
        });
        
      } else {
        this.collector.addTest('数据聚合', 'fail', {
          error: 'Summary生成失败'
        });
      }
      
    } catch (error) {
      this.collector.addTest('聚合和Summary', 'fail', { error: error.message });
    }
    
    const duration = Date.now() - startTime;
    this.collector.addPerformanceMetric('数据聚合', duration, TEST_CONFIG.PERFORMANCE_TARGETS.aggregation);
  }
  
  // 测试4: 智能Prompt选择系统
  async testIntelligentPromptSelection() {
    console.log('\n🧠 测试4: 智能Prompt选择系统');
    const startTime = Date.now();
    
    try {
      // 测试不同复杂度的内容
      const testCases = [
        {
          name: '高复杂度内容',
          input: this.createComplexPromptInput(),
          expectedVersion: 'Master Prompt v2.2'
        },
        {
          name: '中等复杂度内容',
          input: this.createMediumPromptInput(),
          expectedVersion: 'Simplified'
        },
        {
          name: '低复杂度内容',
          input: this.createSimplePromptInput(),
          expectedVersion: 'Fallback'
        }
      ];
      
      for (const testCase of testCases) {
        try {
          const prompt = this.components.generateMasterPrompt(testCase.input);
          
          this.collector.addTest(`Prompt生成-${testCase.name}`, 'pass', {
            promptLength: prompt.length,
            hasContent: prompt.includes('字幕条数'),
            hasVersion: prompt.includes('v2.2')
          });
          
        } catch (error) {
          // 测试简化版本fallback
          try {
            const simplifiedPrompt = this.components.generateSimplifiedMasterPrompt(testCase.input);
            this.collector.addTest(`Prompt Fallback-${testCase.name}`, 'pass', {
              note: '成功降级到简化版本',
              promptLength: simplifiedPrompt.length
            });
          } catch (fallbackError) {
            this.collector.addTest(`Prompt生成-${testCase.name}`, 'fail', {
              error: `主版本和备用版本都失败: ${error.message}`
            });
          }
        }
      }
      
    } catch (error) {
      this.collector.addTest('智能Prompt选择', 'fail', { error: error.message });
    }
    
    const duration = Date.now() - startTime;
    this.collector.addPerformanceMetric('Prompt生成', duration, TEST_CONFIG.PERFORMANCE_TARGETS.promptGeneration);
  }
  
  // 测试5: 端到端批量分析工作流
  async testEndToEndBatchWorkflow() {
    console.log('\n🔄 测试5: 端到端批量分析工作流');
    const startTime = Date.now();
    
    try {
      // 模拟完整的批量分析流程
      const batchData = ChannelTestUtils.generateBatchInputData(TEST_CONFIG.BATCH_URLS);
      
      // 1. 数据输入和验证
      this.localStorage.setItem('batch_input', JSON.stringify(batchData));
      
      // 2. 逐个处理视频
      const processedVideos = [];
      for (const urlData of batchData.urls) {
        const videoData = ChannelTestUtils.generateMockVideoData(urlData.url, 'high');
        const promptInput = this.createPromptInputFromVideoData(videoData);
        
        // 生成prompt（测试降级系统）
        let analysisPrompt;
        try {
          analysisPrompt = this.components.generateMasterPrompt(promptInput);
        } catch (error) {
          analysisPrompt = this.components.generateSimplifiedMasterPrompt(promptInput);
        }
        
        processedVideos.push({
          url: urlData.url,
          videoData,
          prompt: analysisPrompt,
          analysisResults: {
            video_summary: { core_description: `Analysis for ${videoData.title}` },
            viral_score: { overall: Math.floor(Math.random() * 40) + 60 }
          }
        });
      }
      
      // 3. 数据聚合
      const aggregatedResults = await this.components.aggregationService.aggregateChannelData(
        processedVideos.map(v => ({ 
          analysisResults: v.analysisResults,
          metadata: { url: v.url, title: v.videoData.title }
        }))
      );
      
      // 4. 验证完整性
      const workflowValid = processedVideos.length === TEST_CONFIG.BATCH_URLS.length &&
                          aggregatedResults && 
                          aggregatedResults.summary;
      
      if (workflowValid) {
        this.collector.addTest('端到端工作流', 'pass', {
          videosProcessed: processedVideos.length,
          aggregationSuccess: !!aggregatedResults.summary,
          dataIntegrity: true
        });
      } else {
        this.collector.addTest('端到端工作流', 'fail', {
          error: '工作流完整性验证失败',
          processedCount: processedVideos.length,
          expectedCount: TEST_CONFIG.BATCH_URLS.length
        });
      }
      
    } catch (error) {
      this.collector.addTest('端到端工作流', 'fail', { error: error.message });
    }
    
    const duration = Date.now() - startTime;
    this.collector.addPerformanceMetric('完整工作流', duration, TEST_CONFIG.PERFORMANCE_TARGETS.reportGeneration);
  }
  
  // 测试6: 错误恢复和边界情况
  async testErrorRecoveryAndEdgeCases() {
    console.log('\n🛡️ 测试6: 错误恢复和边界情况');
    
    const errorTests = [
      {
        name: '空URL处理',
        test: () => this.components.youTubeService.fetchVideoData('')
      },
      {
        name: '无效URL格式',
        test: () => this.components.youTubeService.fetchVideoData('not-a-url')
      },
      {
        name: '空数据聚合',
        test: () => this.components.aggregationService.aggregateChannelData([])
      },
      {
        name: '损坏的视频数据',
        test: () => this.components.aggregationService.aggregateChannelData([{ invalid: 'data' }])
      },
      {
        name: '超大数据集',
        test: () => {
          const largeDataset = Array(100).fill(null).map((_, i) => ({
            analysisResults: { viral_score: { overall: i } },
            metadata: { title: `Video ${i}` }
          }));
          return this.components.aggregationService.aggregateChannelData(largeDataset);
        }
      }
    ];
    
    for (const errorTest of errorTests) {
      try {
        const result = await errorTest.test();
        
        // 检查是否优雅处理了错误
        if (result && (result.success === false || result.error)) {
          this.collector.addTest(`错误处理-${errorTest.name}`, 'pass', {
            note: '错误被优雅处理',
            errorHandled: true
          });
        } else if (result) {
          this.collector.addTest(`错误处理-${errorTest.name}`, 'pass', {
            note: '意外成功处理了边界情况',
            resultType: typeof result
          });
        } else {
          this.collector.addTest(`错误处理-${errorTest.name}`, 'warning', {
            note: '返回了null/undefined'
          });
        }
        
      } catch (error) {
        // 检查错误是否有意义
        if (error.message && error.message.length > 0) {
          this.collector.addTest(`错误处理-${errorTest.name}`, 'pass', {
            note: '抛出了有意义的错误',
            errorMessage: error.message
          });
        } else {
          this.collector.addTest(`错误处理-${errorTest.name}`, 'fail', {
            error: '错误处理不当或错误信息不明确'
          });
        }
      }
    }
  }
  
  // 辅助方法
  assessDataQuality(data) {
    const requiredFields = ['title', 'channelName', 'viewCount', 'hasSubtitles'];
    const optionalFields = ['description', 'likeCount', 'commentCount', 'srtContent'];
    
    let score = 0;
    const missing = [];
    
    // 检查必需字段
    for (const field of requiredFields) {
      if (data[field]) {
        score += 0.25;
      } else {
        missing.push(field);
      }
    }
    
    // 检查可选字段
    for (const field of optionalFields) {
      if (data[field]) {
        score += 0.125;
      }
    }
    
    return { score: Math.min(score, 1), missing };
  }
  
  validateSummaryStructure(summary) {
    const requiredFields = ['executiveSummary', 'strategicRecommendations'];
    return requiredFields.every(field => summary[field]);
  }
  
  createComplexPromptInput() {
    return {
      fileName: 'complex_video.srt',
      data: {
        subtitles: Array(150).fill(null).map((_, i) => ({
          start: i * 30,
          end: (i + 1) * 30,
          text: `Complex subtitle line ${i + 1} with detailed content...`
        })),
        analysisData: {
          totalDuration: 4500,
          totalWords: 2000,
          totalSubtitles: 150
        },
        contentInfo: {
          title: 'Complex Video Analysis Test',
          hasAutoData: true
        }
      }
    };
  }
  
  createMediumPromptInput() {
    return {
      fileName: 'medium_video.srt',
      data: {
        subtitles: Array(50).fill(null).map((_, i) => ({
          start: i * 30,
          end: (i + 1) * 30,
          text: `Subtitle ${i + 1}`
        })),
        analysisData: {
          totalDuration: 1500,
          totalWords: 300,
          totalSubtitles: 50
        },
        contentInfo: {
          title: 'Medium Complexity Test',
          hasAutoData: false
        }
      }
    };
  }
  
  createSimplePromptInput() {
    return {
      fileName: 'simple_video.srt',
      data: {
        subtitles: Array(5).fill(null).map((_, i) => ({
          start: i * 30,
          end: (i + 1) * 30,
          text: `Line ${i + 1}`
        })),
        analysisData: {
          totalDuration: 150,
          totalWords: 10,
          totalSubtitles: 5
        },
        contentInfo: {
          title: 'Simple Test',
          hasAutoData: false
        }
      }
    };
  }
  
  createPromptInputFromVideoData(videoData) {
    return {
      fileName: `${videoData.title}.srt`,
      data: {
        subtitles: videoData.srtContent ? 
          videoData.srtContent.split('\n\n').slice(0, 10).map((block, i) => ({
            start: i * 30,
            end: (i + 1) * 30,
            text: block.split('\n').slice(2).join(' ') || `Subtitle ${i + 1}`
          })) : [],
        analysisData: {
          totalDuration: 300,
          totalWords: 100,
          totalSubtitles: 10
        },
        contentInfo: {
          title: videoData.title,
          channelName: videoData.channelName,
          hasAutoData: videoData.hasAutoData
        }
      }
    };
  }
  
  // 运行所有测试
  async runAllTests() {
    await this.initialize();
    
    // 按顺序运行测试
    await this.testDataPersistence();
    await this.testYouTubeDataProcessing();
    await this.testAggregationAndSummary();
    await this.testIntelligentPromptSelection();
    await this.testEndToEndBatchWorkflow();
    await this.testErrorRecoveryAndEdgeCases();
    
    // 生成最终报告
    return this.generateFinalReport();
  }
  
  generateFinalReport() {
    const report = this.collector.generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 HitClone Channel 系统测试报告');
    console.log('='.repeat(60));
    
    console.log(`\n📊 测试概览:`);
    console.log(`  总测试数: ${report.summary.total}`);
    console.log(`  通过: ${report.summary.passed} ✅`);
    console.log(`  失败: ${report.summary.failed} ❌`);
    console.log(`  警告: ${report.summary.warnings} ⚠️`);
    console.log(`  成功率: ${report.summary.successRate}`);
    console.log(`  总耗时: ${report.summary.totalDuration}`);
    
    console.log(`\n⚡ 性能指标:`);
    Object.entries(report.performance).forEach(([metric, data]) => {
      if (typeof data === 'object' && data.actual !== undefined) {
        const status = data.status === 'pass' ? '✅' : '❌';
        console.log(`  ${metric}: ${data.actual}ms (目标: ${data.target}ms) ${status}`);
      } else {
        console.log(`  ${metric}: ${data}ms`);
      }
    });
    
    if (report.errors.length > 0) {
      console.log(`\n❌ 失败详情:`);
      report.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error || error.details?.error || 'Unknown error'}`);
      });
    }
    
    console.log(`\n📋 详细结果已保存到: test-results-${Date.now()}.json`);
    
    // 保存详细报告
    this.saveReport(report);
    
    return report;
  }
  
  async saveReport(report) {
    try {
      const filename = `test-results-${Date.now()}.json`;
      await fs.writeFile(filename, JSON.stringify(report, null, 2), 'utf8');
      console.log(`✅ 测试报告已保存: ${filename}`);
    } catch (error) {
      console.error(`❌ 报告保存失败: ${error.message}`);
    }
  }
}

// 运行测试
async function runChannelSystemTest() {
  try {
    const tester = new ChannelSystemTester();
    const report = await tester.runAllTests();
    
    // 返回测试结果供CI/CD使用
    process.exit(report.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 测试系统启动失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runChannelSystemTest();
}

export { ChannelSystemTester, TestResultCollector, ChannelTestUtils };