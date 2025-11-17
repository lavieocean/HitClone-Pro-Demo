#!/usr/bin/env node

/**
 * HitClone Pro - 系统健康检查测试
 * 验证修复后的系统稳定性
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import youTubeDataService from './src/services/youTubeDataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试用的不同YouTube URL
const TEST_URLS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - 经典稳定视频
  'https://youtu.be/5uiVjkG0mW8?si=15z853wnFwYufnp3', // 科技视频
  'https://www.youtube.com/watch?v=invalid123' // 无效URL测试
];

console.log('🩺 HitClone Pro - 系统健康检查');
console.log('========================================');
console.log('🎯 测试目标: 验证修复后的系统稳定性');
console.log('📋 测试项目:');
console.log('  1. API调用去重机制');
console.log('  2. 缓存机制有效性');
console.log('  3. 错误处理稳定性');
console.log('  4. 重复操作防护');
console.log('');

async function testAPIDuplicationPrevention() {
  console.log('🔧 测试 1: API调用去重机制');
  console.log('----------------------------------------');
  
  const testUrl = TEST_URLS[0];
  console.log(`📺 测试URL: ${testUrl}`);
  
  try {
    console.log('🎯 第一次调用...');
    const startTime1 = Date.now();
    const result1 = await youTubeDataService.fetchVideoData(testUrl);
    const duration1 = Date.now() - startTime1;
    
    console.log(`  ✅ 完成时间: ${duration1}ms`);
    console.log(`  📊 结果: ${result1.success ? '成功' : '失败'}`);
    console.log(`  📝 标题: ${result1.data?.title || '未知'}`);
    console.log(`  🎬 字幕: ${result1.data?.hasSubtitles ? '有' : '无'}`);
    
    console.log('');
    console.log('🎯 第二次调用（应该使用缓存）...');
    const startTime2 = Date.now();
    const result2 = await youTubeDataService.fetchVideoData(testUrl);
    const duration2 = Date.now() - startTime2;
    
    console.log(`  ✅ 完成时间: ${duration2}ms`);
    console.log(`  📊 结果: ${result2.success ? '成功' : '失败'}`);
    console.log(`  🔄 缓存效果: ${duration2 < duration1 * 0.1 ? '✅ 有效' : '⚠️ 可能未使用缓存'}`);
    
    console.log('');
    console.log('🎯 快速连续调用测试...');
    const promises = Array(3).fill().map((_, i) => {
      console.log(`  🚀 发起第${i+1}个并发请求`);
      return youTubeDataService.fetchVideoData(testUrl);
    });
    
    const concurrentResults = await Promise.all(promises);
    const allSuccessful = concurrentResults.every(r => r.success);
    
    console.log(`  📊 并发调用结果: ${allSuccessful ? '✅ 全部成功' : '⚠️ 部分失败'}`);
    console.log(`  🔄 数据一致性: ${concurrentResults.every(r => r.data?.videoId === concurrentResults[0].data?.videoId) ? '✅ 一致' : '❌ 不一致'}`);
    
  } catch (error) {
    console.error('❌ API去重测试失败:', error.message);
  }
  
  console.log('');
}

async function testErrorHandling() {
  console.log('🔧 测试 2: 错误处理机制');
  console.log('----------------------------------------');
  
  const invalidUrl = TEST_URLS[2];
  console.log(`📺 测试无效URL: ${invalidUrl}`);
  
  try {
    const result = await youTubeDataService.fetchVideoData(invalidUrl);
    console.log(`  📊 处理结果: ${result.success ? '意外成功' : '正确处理失败'}`);
    console.log(`  📝 错误信息: ${result.error || '无'}`);
    console.log(`  🔄 Fallback数据: ${result.fallbackData ? '✅ 有' : '❌ 无'}`);
    
    if (result.fallbackData) {
      console.log(`  📋 Fallback标题: ${result.fallbackData.title || '未知'}`);
      console.log(`  🆔 Fallback ID: ${result.fallbackData.videoId || '未知'}`);
    }
    
  } catch (error) {
    console.error('❌ 错误处理测试失败:', error.message);
  }
  
  console.log('');
}

async function testCacheManagement() {
  console.log('🔧 测试 3: 缓存管理机制');
  console.log('----------------------------------------');
  
  const testUrl = TEST_URLS[1];
  console.log(`📺 测试URL: ${testUrl}`);
  
  try {
    // 清除缓存
    const videoId = testUrl.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (videoId) {
      youTubeDataService.clearCache(videoId);
      console.log('  🧹 缓存已清除');
    }
    
    // 第一次调用
    console.log('🎯 清除缓存后的第一次调用...');
    const startTime1 = Date.now();
    const result1 = await youTubeDataService.fetchVideoData(testUrl);
    const duration1 = Date.now() - startTime1;
    
    console.log(`  ✅ 完成时间: ${duration1}ms`);
    console.log(`  📊 结果: ${result1.success ? '成功' : '失败'}`);
    
    // 立即第二次调用
    console.log('🎯 立即第二次调用（测试缓存）...');
    const startTime2 = Date.now();
    const result2 = await youTubeDataService.fetchVideoData(testUrl);
    const duration2 = Date.now() - startTime2;
    
    console.log(`  ✅ 完成时间: ${duration2}ms`);
    console.log(`  🚀 速度提升: ${Math.round((duration1 - duration2) / duration1 * 100)}%`);
    console.log(`  🔄 缓存命中: ${duration2 < 100 ? '✅ 是' : '⚠️ 可能否'}`);
    
  } catch (error) {
    console.error('❌ 缓存管理测试失败:', error.message);
  }
  
  console.log('');
}

async function testSystemMemory() {
  console.log('🔧 测试 4: 系统内存使用');
  console.log('----------------------------------------');
  
  const memBefore = process.memoryUsage();
  console.log('📊 测试前内存使用:');
  console.log(`  🧠 RSS: ${Math.round(memBefore.rss / 1024 / 1024)}MB`);
  console.log(`  💾 Heap Used: ${Math.round(memBefore.heapUsed / 1024 / 1024)}MB`);
  console.log(`  📈 Heap Total: ${Math.round(memBefore.heapTotal / 1024 / 1024)}MB`);
  
  try {
    // 执行多次API调用测试内存泄漏
    console.log('🎯 执行10次API调用测试...');
    for (let i = 0; i < 10; i++) {
      const testUrl = TEST_URLS[i % TEST_URLS.length];
      await youTubeDataService.fetchVideoData(testUrl);
      if (i % 3 === 0) {
        process.stdout.write(`  📊 完成 ${i + 1}/10... `);
      }
    }
    console.log('✅ 完成');
    
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
      console.log('  🗑️ 执行垃圾回收');
    }
    
    const memAfter = process.memoryUsage();
    console.log('📊 测试后内存使用:');
    console.log(`  🧠 RSS: ${Math.round(memAfter.rss / 1024 / 1024)}MB`);
    console.log(`  💾 Heap Used: ${Math.round(memAfter.heapUsed / 1024 / 1024)}MB`);
    console.log(`  📈 Heap Total: ${Math.round(memAfter.heapTotal / 1024 / 1024)}MB`);
    
    const memDiff = memAfter.heapUsed - memBefore.heapUsed;
    console.log(`  📈 内存变化: ${memDiff > 0 ? '+' : ''}${Math.round(memDiff / 1024 / 1024)}MB`);
    console.log(`  🩺 内存健康: ${Math.abs(memDiff) < 50 * 1024 * 1024 ? '✅ 正常' : '⚠️ 可能有泄漏'}`);
    
  } catch (error) {
    console.error('❌ 内存测试失败:', error.message);
  }
  
  console.log('');
}

async function runSystemHealthCheck() {
  const startTime = Date.now();
  
  try {
    await testAPIDuplicationPrevention();
    await testErrorHandling();
    await testCacheManagement();
    await testSystemMemory();
    
    const totalTime = Date.now() - startTime;
    
    console.log('🎉 系统健康检查完成！');
    console.log('========================================');
    console.log(`⏱️  总耗时: ${Math.round(totalTime / 1000)}秒`);
    console.log('📋 检查摘要:');
    console.log('  ✅ API调用去重机制测试完成');
    console.log('  ✅ 错误处理机制测试完成');
    console.log('  ✅ 缓存管理机制测试完成');
    console.log('  ✅ 系统内存使用测试完成');
    console.log('');
    console.log('🎯 建议: 如果所有测试都显示"✅"，说明系统修复成功！');
    console.log('⚠️  如果出现"⚠️"或"❌"，可能需要进一步优化。');
    
  } catch (error) {
    console.error('❌ 系统健康检查失败:', error);
  }
}

// 运行健康检查
runSystemHealthCheck();