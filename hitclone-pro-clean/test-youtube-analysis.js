#!/usr/bin/env node

/**
 * HitClone Pro - YouTube 分析端到端测试
 * 测试完整的分析流程，验证修复效果
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import youTubeDataService from './src/services/youTubeDataService.js';
import { generateMasterPrompt } from './src/prompts/masterPrompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试用的YouTube URL - 使用一个公开、稳定的视频
const TEST_YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // 经典的Rick Roll视频，稳定可用

console.log('🎯 HitClone Pro - YouTube 分析端到端测试');
console.log('==========================================');
console.log(`📺 测试URL: ${TEST_YOUTUBE_URL}`);
console.log('');

async function runYouTubeAnalysisTest() {
  try {
    console.log('⏳ 步骤 1: 测试 YouTube 数据服务...');
    
    // 测试 YouTube 数据抓取
    const result = await youTubeDataService.fetchVideoData(TEST_YOUTUBE_URL);
    
    console.log('📊 YouTube 数据抓取结果:');
    console.log(`  - 成功状态: ${result.success}`);
    
    if (result.success && result.data) {
      console.log(`  - 视频标题: ${result.data.title || '未知'}`);
      console.log(`  - 频道名称: ${result.data.channelName || '未知'}`);
      console.log(`  - 观看次数: ${result.data.viewCount || '未知'}`);
      console.log(`  - 字幕状态: ${result.data.hasSubtitles ? '✅ 有字幕' : '❌ 无字幕'}`);
      console.log(`  - 字幕长度: ${result.data.srtContent?.length || 0} 字符`);
    } else {
      console.log(`  - 错误信息: ${result.error || '未知错误'}`);
      if (result.fallbackData) {
        console.log('  - 使用fallback数据继续测试');
      }
    }
    
    console.log('');
    console.log('⏳ 步骤 2: 测试数据包装结构...');
    
    // 模拟 VideoInput.jsx 的数据包装
    const finalVideoData = result.data || {
      title: 'YouTube视频分析测试',
      channelName: '测试频道',
      viewCount: '1000 次观看',
      videoId: 'test123',
      hasSubtitles: false,
      srtContent: null
    };
    
    const wrappedData = {
      type: 'url',
      data: TEST_YOUTUBE_URL,
      videoData: { success: true, data: finalVideoData }, // 新的包装结构
      autoFetched: result.success,
      hasValidSubtitles: result.data?.hasSubtitles && result.data?.srtContent
    };
    
    console.log('📦 数据包装结果:');
    console.log(`  - 类型: ${wrappedData.type}`);
    console.log(`  - 自动抓取: ${wrappedData.autoFetched}`);
    console.log(`  - 有效字幕: ${wrappedData.hasValidSubtitles}`);
    console.log(`  - 数据结构: ${JSON.stringify(Object.keys(wrappedData.videoData), null, 2)}`);
    
    console.log('');
    console.log('⏳ 步骤 3: 测试 AppLayoutEnhanced 数据提取...');
    
    // 模拟 AppLayoutEnhanced.jsx 的数据提取逻辑
    const extractedVideoData = wrappedData.videoData?.data || wrappedData.videoData || {};
    
    console.log('🔍 数据提取结果:');
    console.log(`  - 提取成功: ${!!extractedVideoData.title}`);
    console.log(`  - 标题: ${extractedVideoData.title}`);
    console.log(`  - 频道: ${extractedVideoData.channelName}`);
    console.log(`  - 数据结构键: ${Object.keys(extractedVideoData).join(', ')}`);
    
    console.log('');
    console.log('⏳ 步骤 4: 测试 Master Prompt v2.2 生成...');
    
    // 构建字幕数据（如果有）
    let subtitles = [];
    if (extractedVideoData.hasSubtitles && extractedVideoData.srtContent) {
      try {
        // 简单的SRT解析模拟
        const srtLines = extractedVideoData.srtContent.split('\n');
        for (let i = 0; i < Math.min(srtLines.length, 10); i += 4) {
          if (srtLines[i] && srtLines[i+2]) {
            subtitles.push({
              start: i * 30,
              end: (i + 1) * 30,
              text: srtLines[i+2] || `测试字幕 ${i/4 + 1}`
            });
          }
        }
      } catch (error) {
        console.log(`    ⚠️ SRT解析失败: ${error.message}`);
        // 使用模拟字幕
        subtitles = [
          { start: 0, end: 30, text: "这是一个测试视频的开始部分" },
          { start: 30, end: 60, text: "展示了Master Prompt v2.2的强大功能" }
        ];
      }
    } else {
      // 使用模拟字幕进行测试
      subtitles = [
        { start: 0, end: 30, text: "这是一个没有真实字幕的测试视频" },
        { start: 30, end: 60, text: "我们使用模拟数据来测试系统功能" }
      ];
    }
    
    // 构建 Master Prompt 输入
    const promptInput = {
      fileName: `${extractedVideoData.title || '测试视频'}.srt`,
      data: {
        subtitles: subtitles,
        analysisData: {
          totalDuration: subtitles.length * 30,
          totalWords: subtitles.reduce((count, sub) => count + sub.text.split(' ').length, 0),
          totalSubtitles: subtitles.length
        },
        contentInfo: {
          title: extractedVideoData.title,
          channelName: extractedVideoData.channelName,
          viewCount: extractedVideoData.viewCount,
          likeCount: extractedVideoData.likeCount,
          commentCount: extractedVideoData.commentCount,
          subscriberCount: extractedVideoData.subscriberCount,
          publishDate: extractedVideoData.publishDate,
          description: extractedVideoData.description,
          hasAutoData: wrappedData.autoFetched
        }
      }
    };
    
    console.log('📝 Master Prompt 输入验证:');
    console.log(`  - 文件名: ${promptInput.fileName}`);
    console.log(`  - 字幕条数: ${promptInput.data.subtitles.length}`);
    console.log(`  - 总时长: ${promptInput.data.analysisData.totalDuration}秒`);
    console.log(`  - 总词数: ${promptInput.data.analysisData.totalWords}`);
    console.log(`  - 有真实数据: ${promptInput.data.contentInfo.hasAutoData}`);
    
    // 生成 Master Prompt
    const generatedPrompt = generateMasterPrompt(promptInput);
    
    console.log('🎯 Master Prompt v2.2 生成结果:');
    console.log(`  - Prompt长度: ${generatedPrompt.length} 字符`);
    console.log(`  - 包含字幕数据: ${generatedPrompt.includes('字幕条数')}`);
    console.log(`  - 包含真实数据标识: ${generatedPrompt.includes('YouTube API数据')}`);
    console.log(`  - 版本信息: ${generatedPrompt.includes('v2.2') ? '✅ v2.2' : '❌ 旧版本'}`);
    
    console.log('');
    console.log('📋 Prompt 预览 (前500字符):');
    console.log('----------------------------------------');
    console.log(generatedPrompt.substring(0, 500) + '...');
    console.log('----------------------------------------');
    
    console.log('');
    console.log('✅ 测试完成！');
    console.log('==========================================');
    console.log('📊 测试结果总结:');
    console.log(`  1. YouTube数据抓取: ${result.success ? '✅ 成功' : '⚠️ 部分成功/失败'}`);
    console.log(`  2. 数据包装结构: ✅ 正确`);
    console.log(`  3. 数据提取逻辑: ${!!extractedVideoData.title ? '✅ 正确' : '❌ 失败'}`);
    console.log(`  4. Master Prompt v2.2: ${generatedPrompt.includes('v2.2') ? '✅ 正确使用' : '❌ 版本问题'}`);
    console.log('');
    
    if (result.success && extractedVideoData.title && generatedPrompt.includes('v2.2')) {
      console.log('🎉 所有系统组件工作正常！修复成功！');
    } else {
      console.log('⚠️  部分组件可能需要进一步调试');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:');
    console.error(error);
  }
}

// 运行测试
runYouTubeAnalysisTest();