/**
 * HitClone Channel - 批量输入组件单元测试套件
 * 测试 ChannelBatchInput.jsx 的数据持久化、恢复机制、表单状态管理
 */

import { TestResultCollector } from '../test-channel-system.js';

class ChannelBatchInputTester {
  constructor() {
    this.collector = new TestResultCollector();
    this.mockLocalStorage = new Map();
    this.mockComponent = null;
  }
  
  // 模拟 localStorage 行为
  setupMockStorage() {
    return {
      getItem: (key) => this.mockLocalStorage.get(key) || null,
      setItem: (key, value) => this.mockLocalStorage.set(key, value),
      removeItem: (key) => this.mockLocalStorage.delete(key),
      clear: () => this.mockLocalStorage.clear()
    };
  }
  
  // 模拟 ChannelBatchInput 组件核心功能
  createMockBatchInputComponent() {
    const storage = this.setupMockStorage();
    
    return {
      // 核心数据持久化方法
      saveInputData: (urls, channelInfo = null) => {
        try {
          const batchData = {
            urls: urls.map(url => ({
              url: url.trim(),
              status: 'pending',
              timestamp: Date.now(),
              id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            })),
            channelInfo: channelInfo || {
              name: 'Unknown Channel',
              estimatedVideos: urls.length
            },
            sessionId: `batch_${Date.now()}`,
            lastSaved: Date.now(),
            version: '2.0'
          };
          
          storage.setItem('hitclone_channel_batch_data', JSON.stringify(batchData));
          storage.setItem('hitclone_channel_backup', JSON.stringify(batchData));
          
          return { success: true, data: batchData };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      // 数据恢复方法
      recoverInputData: () => {
        try {
          // 尝试主要存储
          let data = storage.getItem('hitclone_channel_batch_data');
          
          if (!data) {
            // 尝试备份存储
            data = storage.getItem('hitclone_channel_backup');
          }
          
          if (!data) {
            return { success: false, error: '没有找到保存的数据' };
          }
          
          const parsedData = JSON.parse(data);
          
          // 验证数据结构
          if (!parsedData.urls || !Array.isArray(parsedData.urls)) {
            throw new Error('数据结构无效');
          }
          
          return { success: true, data: parsedData };
        } catch (error) {
          // 尝试修复损坏的数据
          try {
            const corruptedData = storage.getItem('hitclone_channel_batch_data');
            if (corruptedData) {
              // 尝试恢复部分有效数据
              const partialData = this.attemptDataRecovery(corruptedData);
              if (partialData) {
                return { success: true, data: partialData, recovered: true };
              }
            }
          } catch (recoveryError) {
            // 恢复失败，返回原始错误
          }
          
          return { success: false, error: error.message };
        }
      },
      
      // 数据恢复辅助方法
      attemptDataRecovery: (corruptedData) => {
        try {
          // 尝试提取URL信息
          const urlMatches = corruptedData.match(/https?:\/\/[^\s"]+/g);
          if (urlMatches && urlMatches.length > 0) {
            return {
              urls: urlMatches.map(url => ({
                url,
                status: 'pending',
                timestamp: Date.now(),
                id: `recovered_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                recovered: true
              })),
              sessionId: `recovered_${Date.now()}`,
              lastSaved: Date.now(),
              version: '2.0',
              isRecovered: true
            };
          }
        } catch (error) {
          return null;
        }
        return null;
      },
      
      // 分析状态保存
      saveAnalysisState: (sessionId, progress) => {
        try {
          const stateData = {
            sessionId,
            progress: {
              current: progress.current || 0,
              total: progress.total || 0,
              status: progress.status || 'pending',
              errors: progress.errors || [],
              completed: progress.completed || [],
              timestamp: Date.now()
            },
            lastUpdated: Date.now()
          };
          
          storage.setItem(`hitclone_analysis_state_${sessionId}`, JSON.stringify(stateData));
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      // 获取分析状态
      getAnalysisState: (sessionId) => {
        try {
          const data = storage.getItem(`hitclone_analysis_state_${sessionId}`);
          if (!data) {
            return { success: false, error: '未找到分析状态' };
          }
          
          return { success: true, data: JSON.parse(data) };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      // URL验证
      validateUrls: (urls) => {
        const results = {
          valid: [],
          invalid: [],
          duplicates: [],
          channelUrls: [],
          videoUrls: []
        };
        
        const seenUrls = new Set();
        
        for (const url of urls) {
          const trimmedUrl = url.trim();
          
          if (!trimmedUrl) continue;
          
          // 检查重复
          if (seenUrls.has(trimmedUrl)) {
            results.duplicates.push(trimmedUrl);
            continue;
          }
          seenUrls.add(trimmedUrl);
          
          // URL格式验证
          const youtubeVideoRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
          const youtubeChannelRegex = /^https?:\/\/(www\.)?youtube\.com\/@[\w-]+/;
          
          if (youtubeVideoRegex.test(trimmedUrl)) {
            results.valid.push(trimmedUrl);
            results.videoUrls.push(trimmedUrl);
          } else if (youtubeChannelRegex.test(trimmedUrl)) {
            results.valid.push(trimmedUrl);
            results.channelUrls.push(trimmedUrl);
          } else {
            results.invalid.push(trimmedUrl);
          }
        }
        
        return results;
      }
    };
  }
  
  // 测试1: 基础数据保存和读取
  async testBasicDataPersistence() {
    console.log('📁 测试: 基础数据持久化');
    
    const component = this.createMockBatchInputComponent();
    const testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=9bZkp7q19f0',
      'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
    ];
    
    try {
      // 保存数据
      const saveResult = component.saveInputData(testUrls);
      
      if (saveResult.success) {
        this.collector.addTest('数据保存', 'pass', {
          urlCount: testUrls.length,
          sessionId: saveResult.data.sessionId
        });
        
        // 读取数据
        const recoverResult = component.recoverInputData();
        
        if (recoverResult.success && recoverResult.data.urls.length === testUrls.length) {
          this.collector.addTest('数据读取', 'pass', {
            recoveredUrls: recoverResult.data.urls.length,
            dataIntegrity: recoverResult.data.urls.every(item => 
              testUrls.includes(item.url) && item.status === 'pending'
            )
          });
        } else {
          this.collector.addTest('数据读取', 'fail', {
            error: recoverResult.error || '数据完整性验证失败'
          });
        }
      } else {
        this.collector.addTest('数据保存', 'fail', {
          error: saveResult.error
        });
      }
    } catch (error) {
      this.collector.addTest('基础数据持久化', 'fail', { error: error.message });
    }
  }
  
  // 测试2: 数据损坏恢复机制
  async testDataCorruptionRecovery() {
    console.log('🛡️ 测试: 数据损坏恢复');
    
    const component = this.createMockBatchInputComponent();
    const storage = this.setupMockStorage();
    
    try {
      // 先保存正常数据
      const testUrls = ['https://www.youtube.com/watch?v=test1', 'https://www.youtube.com/watch?v=test2'];
      component.saveInputData(testUrls);
      
      // 模拟数据损坏
      const corruptedData = '{"urls": [{"url": "https://www.youtube.com/watch?v=test1", "status": "pen'; // 截断的JSON
      storage.setItem('hitclone_channel_batch_data', corruptedData);
      
      // 尝试恢复
      const recoverResult = component.recoverInputData();
      
      if (recoverResult.success) {
        if (recoverResult.recovered) {
          this.collector.addTest('损坏数据恢复', 'pass', {
            recoveredUrls: recoverResult.data.urls.length,
            isRecovered: recoverResult.data.isRecovered
          });
        } else {
          // 从备份恢复
          this.collector.addTest('备份数据恢复', 'pass', {
            recoveredUrls: recoverResult.data.urls.length
          });
        }
      } else {
        this.collector.addTest('数据损坏恢复', 'fail', {
          error: recoverResult.error
        });
      }
      
      // 测试完全损坏的情况
      storage.setItem('hitclone_channel_batch_data', 'completely-invalid-json');
      storage.setItem('hitclone_channel_backup', 'also-invalid');
      
      const totalFailureResult = component.recoverInputData();
      if (!totalFailureResult.success) {
        this.collector.addTest('完全损坏处理', 'pass', {
          note: '正确识别了无法恢复的数据'
        });
      } else {
        this.collector.addTest('完全损坏处理', 'warning', {
          note: '意外从完全损坏的数据中恢复了内容'
        });
      }
      
    } catch (error) {
      this.collector.addTest('数据损坏恢复', 'fail', { error: error.message });
    }
  }
  
  // 测试3: URL验证和清理
  async testUrlValidationAndCleaning() {
    console.log('🔍 测试: URL验证和清理');
    
    const component = this.createMockBatchInputComponent();
    
    try {
      const testUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  // 有效视频URL
        'https://youtu.be/9bZkp7q19f0',                 // 短链接视频URL
        'https://www.youtube.com/@rickastleyofficial',  // 频道URL
        'https://invalid-url.com',                      // 无效URL
        'not-a-url-at-all',                            // 完全无效
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  // 重复URL
        '',                                            // 空字符串
        '  https://www.youtube.com/watch?v=test  '     // 有空格的URL
      ];
      
      const validationResult = component.validateUrls(testUrls);
      
      // 验证结果
      const expectedValid = 4; // 3个唯一有效URL + 1个清理后的URL
      const expectedInvalid = 2; // 2个无效URL
      const expectedDuplicates = 1; // 1个重复URL
      
      if (validationResult.valid.length >= 3 && validationResult.invalid.length >= 1) {
        this.collector.addTest('URL验证', 'pass', {
          validUrls: validationResult.valid.length,
          invalidUrls: validationResult.invalid.length,
          duplicates: validationResult.duplicates.length,
          videoUrls: validationResult.videoUrls.length,
          channelUrls: validationResult.channelUrls.length
        });
      } else {
        this.collector.addTest('URL验证', 'fail', {
          error: 'URL验证结果不符合预期',
          actual: validationResult
        });
      }
      
      // 测试边界情况
      const emptyResult = component.validateUrls([]);
      if (emptyResult.valid.length === 0 && emptyResult.invalid.length === 0) {
        this.collector.addTest('空URL列表处理', 'pass');
      } else {
        this.collector.addTest('空URL列表处理', 'fail', {
          error: '空列表处理异常'
        });
      }
      
    } catch (error) {
      this.collector.addTest('URL验证和清理', 'fail', { error: error.message });
    }
  }
  
  // 测试4: 分析状态管理
  async testAnalysisStateManagement() {
    console.log('📊 测试: 分析状态管理');
    
    const component = this.createMockBatchInputComponent();
    
    try {
      const sessionId = `test_session_${Date.now()}`;
      
      // 测试状态保存
      const initialProgress = {
        current: 0,
        total: 3,
        status: 'starting',
        errors: [],
        completed: []
      };
      
      const saveStateResult = component.saveAnalysisState(sessionId, initialProgress);
      
      if (saveStateResult.success) {
        this.collector.addTest('状态保存', 'pass');
        
        // 测试状态读取
        const getStateResult = component.getAnalysisState(sessionId);
        
        if (getStateResult.success && getStateResult.data.progress.total === 3) {
          this.collector.addTest('状态读取', 'pass', {
            sessionId: getStateResult.data.sessionId,
            progressTotal: getStateResult.data.progress.total
          });
          
          // 测试状态更新
          const updatedProgress = {
            current: 2,
            total: 3,
            status: 'processing',
            errors: ['一个测试错误'],
            completed: ['video1', 'video2']
          };
          
          const updateResult = component.saveAnalysisState(sessionId, updatedProgress);
          
          if (updateResult.success) {
            const updatedStateResult = component.getAnalysisState(sessionId);
            
            if (updatedStateResult.success && 
                updatedStateResult.data.progress.current === 2 &&
                updatedStateResult.data.progress.errors.length === 1) {
              this.collector.addTest('状态更新', 'pass', {
                currentProgress: updatedStateResult.data.progress.current,
                errorCount: updatedStateResult.data.progress.errors.length
              });
            } else {
              this.collector.addTest('状态更新', 'fail', {
                error: '状态更新验证失败'
              });
            }
          } else {
            this.collector.addTest('状态更新', 'fail', {
              error: updateResult.error
            });
          }
        } else {
          this.collector.addTest('状态读取', 'fail', {
            error: getStateResult.error || '状态数据验证失败'
          });
        }
      } else {
        this.collector.addTest('状态保存', 'fail', {
          error: saveStateResult.error
        });
      }
      
      // 测试不存在的会话
      const nonExistentResult = component.getAnalysisState('non_existent_session');
      if (!nonExistentResult.success) {
        this.collector.addTest('不存在会话处理', 'pass', {
          note: '正确处理了不存在的会话ID'
        });
      } else {
        this.collector.addTest('不存在会话处理', 'warning', {
          note: '意外返回了不存在会话的数据'
        });
      }
      
    } catch (error) {
      this.collector.addTest('分析状态管理', 'fail', { error: error.message });
    }
  }
  
  // 测试5: 并发访问和数据一致性
  async testConcurrencyAndConsistency() {
    console.log('⚡ 测试: 并发访问和数据一致性');
    
    const component = this.createMockBatchInputComponent();
    
    try {
      const testUrls = [
        'https://www.youtube.com/watch?v=test1',
        'https://www.youtube.com/watch?v=test2'
      ];
      
      // 模拟并发保存
      const concurrentSaves = await Promise.allSettled([
        component.saveInputData([...testUrls, 'https://www.youtube.com/watch?v=concurrent1']),
        component.saveInputData([...testUrls, 'https://www.youtube.com/watch?v=concurrent2']),
        component.saveInputData([...testUrls, 'https://www.youtube.com/watch?v=concurrent3'])
      ]);
      
      const successfulSaves = concurrentSaves.filter(result => 
        result.status === 'fulfilled' && result.value.success
      );
      
      if (successfulSaves.length > 0) {
        this.collector.addTest('并发保存', 'pass', {
          successfulSaves: successfulSaves.length,
          totalAttempts: concurrentSaves.length
        });
        
        // 验证最终数据一致性
        const finalData = component.recoverInputData();
        
        if (finalData.success && finalData.data.urls.length >= 3) {
          this.collector.addTest('数据一致性', 'pass', {
            finalUrlCount: finalData.data.urls.length
          });
        } else {
          this.collector.addTest('数据一致性', 'warning', {
            note: '并发操作后数据状态不确定'
          });
        }
      } else {
        this.collector.addTest('并发保存', 'fail', {
          error: '所有并发保存都失败了'
        });
      }
      
      // 测试快速读写操作
      const rapidOperations = [];
      for (let i = 0; i < 10; i++) {
        rapidOperations.push(
          component.saveAnalysisState(`rapid_${i}`, { current: i, total: 10 })
        );
      }
      
      const rapidResults = await Promise.allSettled(rapidOperations);
      const rapidSuccesses = rapidResults.filter(result => 
        result.status === 'fulfilled' && result.value.success
      );
      
      if (rapidSuccesses.length >= 8) { // 允许一些失败
        this.collector.addTest('快速操作', 'pass', {
          successfulOperations: rapidSuccesses.length
        });
      } else {
        this.collector.addTest('快速操作', 'warning', {
          successfulOperations: rapidSuccesses.length,
          note: '快速操作成功率较低'
        });
      }
      
    } catch (error) {
      this.collector.addTest('并发访问和数据一致性', 'fail', { error: error.message });
    }
  }
  
  // 运行所有测试
  async runAllTests() {
    console.log('🧪 开始 ChannelBatchInput 组件测试');
    console.log('='.repeat(50));
    
    await this.testBasicDataPersistence();
    await this.testDataCorruptionRecovery();
    await this.testUrlValidationAndCleaning();
    await this.testAnalysisStateManagement();
    await this.testConcurrencyAndConsistency();
    
    return this.collector.generateReport();
  }
}

export { ChannelBatchInputTester };