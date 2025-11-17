// SRT字幕文件解析工具
import { DebugHelper } from './debugHelper'

export class SRTParser {
  static parseSRT(content) {
    const blocks = content.trim().split(/\n\s*\n/);
    const subtitles = [];

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;

      const index = parseInt(lines[0]);
      const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      
      if (!timeMatch) continue;

      const startTime = this.timeToSeconds(timeMatch[1]);
      const endTime = this.timeToSeconds(timeMatch[2]);
      const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, ''); // 移除HTML标签

      subtitles.push({
        index,
        startTime,
        endTime,
        duration: endTime - startTime,
        text: text.trim()
      });
    }

    return subtitles;
  }

  static timeToSeconds(timeString) {
    const [time, ms] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + parseInt(ms) / 1000;
  }

  static secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  static getAnalysisData(subtitles) {
    if (!subtitles || subtitles.length === 0) {
      return {
        totalSubtitles: 0,
        totalDuration: 0,
        totalWords: 0,
        avgWordsPerMinute: 0,
        avgSubtitleDuration: 0,
        longestSubtitle: 0,
        sentimentIndicators: { positive: 0, negative: 0, neutral: 0 }
      };
    }

    const endTimes = subtitles.map(s => s.endTime).filter(t => !isNaN(t) && t > 0);
    const totalDuration = endTimes.length > 0 ? Math.max(...endTimes) : 0;
    const totalWords = subtitles.reduce((sum, s) => sum + (s.text ? s.text.split(' ').length : 0), 0);
    const avgWordsPerMinute = totalDuration > 0 ? 
      DebugHelper.safeToFixed(totalWords / (totalDuration / 60), 1, 'SRTParser-avgWordsPerMinute') : 0;

    // 情感关键词分析
    const positiveWords = ['好', '棒', '优秀', '精彩', '喜欢', '爱', 'fantastic', 'great', 'good', 'excellent', 'amazing'];
    const negativeWords = ['差', '糟糕', '不好', '讨厌', '烂', 'bad', 'terrible', 'awful', 'hate', 'worst'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    subtitles.forEach(subtitle => {
      const text = subtitle.text.toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
    });

    const durations = subtitles.map(s => s.duration).filter(d => !isNaN(d) && d > 0);
    const avgSubtitleDuration = durations.length > 0 ? 
      DebugHelper.safeToFixed(durations.reduce((sum, d) => sum + d, 0) / durations.length, 2, 'SRTParser-avgSubtitleDuration') : 0;
    
    const textLengths = subtitles.map(s => s.text ? s.text.length : 0);
    const longestSubtitle = textLengths.length > 0 ? Math.max(...textLengths) : 0;

    return {
      totalSubtitles: subtitles.length,
      totalDuration: totalDuration,
      totalWords: totalWords,
      avgWordsPerMinute: parseFloat(avgWordsPerMinute),
      avgSubtitleDuration: parseFloat(avgSubtitleDuration),
      longestSubtitle: longestSubtitle,
      sentimentIndicators: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: subtitles.length - positiveCount - negativeCount
      }
    };
  }

  static generatePreview(subtitles, maxEntries = 5) {
    if (!subtitles || subtitles.length === 0) {
      return [];
    }
    
    return subtitles.slice(0, maxEntries).map(subtitle => ({
      timeRange: `${this.secondsToTime(subtitle.startTime || 0)} → ${this.secondsToTime(subtitle.endTime || 0)}`,
      text: subtitle.text && subtitle.text.length > 100 ? subtitle.text.substring(0, 100) + '...' : (subtitle.text || ''),
      duration: DebugHelper.safeToFixed(subtitle.duration || 0, 1, 'SRTParser-预览时长') + 's'
    }));
  }
}