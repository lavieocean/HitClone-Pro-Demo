// Gemini 2.5 API专用服务
class GeminiApiService {
  constructor() {
    this.config = null
    this.loadConfig()
  }

  loadConfig() {
    const saved = localStorage.getItem('hitclone-gemini-config')
    if (saved) {
      this.config = JSON.parse(saved)
    } else {
      // 默认配置
      this.config = {
        apiKey: 'AIzaSyBmkOUbFgXtZcmeQj7eEXWczvnDyf49GFg',
        model: 'gemini-1.5-pro-002',
        endpoint: 'https://generativelanguage.googleapis.com/v1/models/',
        maxTokens: 8192,
        temperature: 0.7
      }
    }
  }

  saveConfig(config) {
    this.config = { ...this.config, ...config }
    localStorage.setItem('hitclone-gemini-config', JSON.stringify(this.config))
  }

  isConfigured() {
    this.loadConfig()
    return this.config && this.config.apiKey && this.config.apiKey.length > 0
  }

  getConfig() {
    this.loadConfig()
    return this.config
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      model: this.config?.model || 'gemini-1.5-pro-002',
      ready: this.isConfigured()
    }
  }

  async callApi(prompt, options = {}) {
    this.loadConfig()
    
    if (!this.isConfigured()) {
      throw new Error('Gemini API未配置，请先配置API Key')
    }

    const startTime = Date.now()
    
    console.log('🚀 调用Gemini API:', {
      model: this.config.model,
      promptLength: prompt.length
    })

    try {
      const response = await this.callGeminiApi(prompt, options)
      
      const duration = Date.now() - startTime
      console.log('✅ Gemini API调用成功', `耗时: ${duration}ms`)
      
      return response
    } catch (error) {
      console.error('❌ Gemini API调用失败:', error)
      throw error
    }
  }

  async callGeminiApi(prompt, options) {
    // 构建Gemini API URL
    const apiUrl = `${this.config.endpoint}${this.config.model}:generateContent?key=${this.config.apiKey}`
    
    console.log('🔗 Gemini API URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: Math.min(options.max_tokens || this.config.maxTokens, 4096),
          temperature: options.temperature || this.config.temperature,
          candidateCount: 1,
          topK: 40,
          topP: 0.95
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API详细错误:', error)
      
      // 特殊处理token长度错误
      if (error.includes('long output token length is not enabled')) {
        console.warn('🔧 Token长度限制错误，尝试减少maxOutputTokens重试...')
        // 递归重试，减少token数量
        if ((options.max_tokens || this.config.maxTokens) > 2048) {
          const retryOptions = { 
            ...options, 
            max_tokens: Math.min(2048, (options.max_tokens || this.config.maxTokens) / 2) 
          }
          console.log(`🔄 重试中，减少token至: ${retryOptions.max_tokens}`)
          return await this.callGeminiApi(prompt, retryOptions)
        }
      }
      
      throw new Error(`Gemini API错误: ${response.status} - ${error}`)
    }

    const data = await response.json()
    console.log('Gemini API响应:', data)
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('Gemini API无候选响应:', data)
      throw new Error('Gemini API无候选响应')
    }
    
    const candidate = data.candidates[0]
    
    // 检查是否有完整内容
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      return candidate.content.parts[0].text
    }
    
    // 如果内容格式不完整，检查是否是token限制问题
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.warn('Gemini响应因token限制被截断')
      throw new Error('响应被截断：请求的内容太长，需要增加maxOutputTokens')
    }
    
    console.error('Gemini API响应格式异常:', data)
    throw new Error('Gemini API响应格式异常: ' + JSON.stringify(data, null, 2))
  }

  // 生成视频分析的专用prompt
  generateAnalysisPrompt(input) {
    let basePrompt = ''
    
    if (input.type === 'srt') {
      basePrompt = `请分析以下SRT字幕文件内容，并返回JSON格式的详细分析报告：

文件名: ${input.fileName || '未知'}
字幕内容: ${JSON.stringify(input.data.subtitles?.slice(0, 20) || [])}
总时长: ${input.data.analysisData?.totalDuration || 0}秒
总字数: ${input.data.analysisData?.totalWords || 0}

请从以下维度进行分析：`
    } else if (input.type === 'url') {
      basePrompt = `请分析以下视频内容并返回JSON格式的详细报告：

视频URL: ${input.data}
${input.data?.title ? `标题: ${input.data.title}` : ''}
${input.data?.channel ? `频道: ${input.data.channel}` : ''}

请进行全面的分析，包括：`
    } else {
      basePrompt = `请为视频 "${input.data?.title || '示例视频'}" 生成完整的分析报告。

请进行以下分析：`
    }

    return basePrompt + `

1. 病毒传播潜力分析
   - 开场吸引力评分 (0-100)
   - 好奇心缺口评分 (0-100) 
   - 情感触发强度 (0-100)
   - 分享价值评分 (0-100)
   - 留存力评分 (0-100)

2. 情感曲线分析
   - 按时间线提供情感变化数据
   - 包含情感类型和强度

3. 故事结构评估
   - 英雄之旅各阶段完整度
   - 叙事技巧评分

4. 观看时长优化建议
   - 具体的优化技巧
   - 预期提升效果

5. 黄金片段识别
   - 最具分享价值的片段
   - 时间戳和描述

6. 综合评分和具体建议

请确保返回结构化的JSON格式数据，方便程序解析。`
  }

  // 为Copilot生成对话prompt
  generateCopilotPrompt(question, analysisResults) {
    return `基于以下视频分析结果，请回答用户的问题：

分析结果：
${JSON.stringify(analysisResults, null, 2)}

用户问题：${question}

请提供专业、有针对性的回答，可以引用分析结果中的具体数据。`
  }

  // 测试API连接
  async testConnection() {
    try {
      const testPrompt = '请回复"连接测试成功"'
      const response = await this.callApi(testPrompt, { max_tokens: 10 })
      return {
        success: true,
        message: '连接测试成功',
        response: response
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error
      }
    }
  }

  // 获取可用模型列表
  getAvailableModels() {
    return [
      {
        id: 'gemini-1.5-pro-002',
        name: 'Gemini 1.5 Pro (002)',
        description: '稳定的Gemini 1.5 Pro模型，推荐使用'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: '快速的Gemini 1.5 Flash模型'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: '标准的Gemini 1.5 Pro模型'
      },
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash (实验)',
        description: '实验性的Gemini 2.0 Flash模型'
      }
    ]
  }
}

export default new GeminiApiService()