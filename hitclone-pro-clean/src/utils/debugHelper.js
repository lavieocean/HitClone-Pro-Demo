// 调试工具 - 帮助定位toFixed()错误
export class DebugHelper {
  static logWithStack(message, data) {
    console.group('🔍 调试信息: ' + message);
    console.log('数据:', data);
    console.log('调用栈:', new Error().stack);
    console.groupEnd();
  }

  static safeToFixed(value, digits = 2, context = 'unknown') {
    try {
      if (value === null || value === undefined) {
        console.warn(`⚠️ toFixed()警告: ${context} - 值为null/undefined`, { value, context });
        return '0';
      }
      
      if (typeof value !== 'number') {
        console.warn(`⚠️ toFixed()警告: ${context} - 值不是数字`, { value, type: typeof value, context });
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return '0';
        }
        return numValue.toFixed(digits);
      }
      
      if (!isFinite(value)) {
        console.warn(`⚠️ toFixed()警告: ${context} - 值不是有限数字`, { value, context });
        return '0';
      }
      
      console.log(`✅ toFixed()成功: ${context} - ${value} -> ${value.toFixed(digits)}`);
      return value.toFixed(digits);
    } catch (error) {
      console.error(`❌ toFixed()错误: ${context}`, {
        value,
        error: error.message,
        stack: error.stack,
        context
      });
      return '0';
    }
  }

  static wrapNumberOperations() {
    // 重写toFixed方法以捕获所有调用
    const originalToFixed = Number.prototype.toFixed;
    Number.prototype.toFixed = function(digits) {
      console.log('🔢 toFixed()调用:', {
        value: this,
        digits,
        stack: new Error().stack.split('\n').slice(1, 4)
      });
      
      if (this === null || this === undefined) {
        console.error('❌ toFixed()在null/undefined上调用!', new Error().stack);
        return '0';
      }
      
      return originalToFixed.call(this, digits);
    };
  }

  static checkSRTData(data, label = 'SRT数据') {
    console.group(`🔍 检查${label}:`);
    
    if (!data) {
      console.error('❌ 数据为空:', data);
      console.groupEnd();
      return false;
    }
    
    console.log('✅ 数据存在:', data);
    
    // 检查analysisData
    if (data.analysisData) {
      console.log('📊 分析数据:', data.analysisData);
      
      const fields = ['totalDuration', 'totalWords', 'avgWordsPerMinute', 'totalSubtitles'];
      fields.forEach(field => {
        const value = data.analysisData[field];
        console.log(`   ${field}:`, {
          value,
          type: typeof value,
          isNumber: typeof value === 'number',
          isFinite: Number.isFinite(value)
        });
      });
    }
    
    // 检查subtitles
    if (data.subtitles && Array.isArray(data.subtitles)) {
      console.log('🎬 字幕数组:', data.subtitles.length + ' 条');
      if (data.subtitles.length > 0) {
        const first = data.subtitles[0];
        console.log('   第一条字幕:', {
          startTime: first.startTime,
          endTime: first.endTime,
          duration: first.duration,
          text: first.text?.substring(0, 50) + '...'
        });
      }
    }
    
    console.groupEnd();
    return true;
  }
}

// 自动启用toFixed调试
if (typeof window !== 'undefined') {
  DebugHelper.wrapNumberOperations();
  console.log('🛠️ toFixed()调试已启用');
}