import React, { useState } from 'react'

const ApiDebugger = () => {
  const [apiKey, setApiKey] = useState('AIzaSyBmkOUbFgXtZcmeQj7eEXWczvnDyf49GFg')
  const [model, setModel] = useState('gemini-2.5-pro')
  const [response, setResponse] = useState('')
  const [testing, setTesting] = useState(false)

  const testGeminiApi = async () => {
    setTesting(true)
    setResponse('')

    try {
      // 构建API URL
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      
      console.log('测试URL:', apiUrl)
      
      const requestBody = {
        contents: [{
          parts: [{ text: '请回复"测试成功"' }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.1,
          candidateCount: 1
        }
      }
      
      console.log('请求体:', JSON.stringify(requestBody, null, 2))
      
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('响应状态:', fetchResponse.status)
      console.log('响应头:', [...fetchResponse.headers.entries()])
      
      const responseText = await fetchResponse.text()
      console.log('原始响应:', responseText)
      
      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${responseText}`)
      }
      
      const data = JSON.parse(responseText)
      console.log('解析后数据:', data)
      
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0]
        
        // 检查不同的响应格式
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          // 标准格式
          setResponse(`✅ 成功！回复: ${candidate.content.parts[0].text}`)
        } else if (candidate.content && candidate.content.role === 'model') {
          // 新格式：内容可能在其他字段中
          const finishReason = candidate.finishReason || 'UNKNOWN'
          const hasThoughts = data.usageMetadata?.thoughtsTokenCount > 0
          
          setResponse(`⚠️ API响应但内容格式特殊:\n- Finish Reason: ${finishReason}\n- Model Version: ${data.modelVersion}\n- Has Thoughts: ${hasThoughts}\n- 需要调整Token限制或请求格式\n\n完整响应: ${JSON.stringify(data, null, 2)}`)
        } else {
          setResponse(`⚠️ API响应格式异常: ${JSON.stringify(data, null, 2)}`)
        }
      } else {
        setResponse(`❌ 无有效候选响应: ${JSON.stringify(data, null, 2)}`)
      }
      
    } catch (error) {
      console.error('测试失败:', error)
      setResponse(`❌ 测试失败: ${error.message}`)
    }
    
    setTesting(false)
  }

  const testSimpleConnection = async () => {
    setTesting(true)
    setResponse('')

    try {
      // 简单的模型列表请求
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      
      console.log('测试模型列表URL:', listUrl)
      
      const fetchResponse = await fetch(listUrl)
      const responseText = await fetchResponse.text()
      
      console.log('模型列表响应状态:', fetchResponse.status)
      console.log('模型列表响应:', responseText)
      
      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${responseText}`)
      }
      
      const data = JSON.parse(responseText)
      
      // 显示可用的模型名称，特别关注Gemini 2.5 Pro
      const allModels = data.models?.map(m => m.name.replace('models/', '')) || []
      const gemini25Models = allModels.filter(name => name.includes('2.5') || name.includes('pro'))
      const otherModels = allModels.filter(name => !name.includes('2.5')).slice(0, 5)
      
      setResponse(`✅ API Key有效！找到 ${data.models?.length || 0} 个可用模型\n\n🎯 Gemini 2.5 相关模型:\n${gemini25Models.join('\n') || '未找到'}\n\n📋 其他模型(前5个):\n${otherModels.join('\n') || '无'}`)
      
    } catch (error) {
      console.error('简单连接测试失败:', error)
      setResponse(`❌ API Key验证失败: ${error.message}`)
    }
    
    setTesting(false)
  }

  return (
    <div className="hitclone-start fade-in">
      <div className="start-header">
        <h1 className="start-title">🔧 Gemini API 调试器</h1>
        <p className="start-subtitle">专门用于调试Gemini API连接问题</p>
      </div>

      <div className="start-input-section">
        <div className="form-group">
          <label>API Key</label>
          <input
            type="text"
            className="config-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入您的Gemini API Key"
          />
        </div>

        <div className="form-group">
          <label>模型名称</label>
          <input
            type="text"
            className="config-input"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="输入完整的模型名称，如: gemini-2.0-flash-exp"
          />
          <div className="form-help">
            常见模型名称：gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="action-btn test"
            onClick={testSimpleConnection}
            disabled={!apiKey || testing}
          >
            {testing ? '测试中...' : '🔑 验证API Key'}
          </button>
          
          <button 
            className="action-btn save"
            onClick={testGeminiApi}
            disabled={!apiKey || testing}
          >
            {testing ? '测试中...' : '🧪 测试生成内容'}
          </button>
        </div>

        {response && (
          <div className="test-result success">
            <div className="result-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {response}
              </pre>
            </div>
          </div>
        )}

        <div className="api-instructions">
          <h4>📖 调试说明</h4>
          <ol>
            <li>首先点击"验证API Key"确认API密钥有效</li>
            <li>然后点击"测试生成内容"测试实际API调用</li>
            <li>查看浏览器开发者工具的Console获取详细日志</li>
            <li>如果出现CORS错误，这是正常的浏览器安全限制</li>
          </ol>
          
          <div className="security-note">
            <span className="security-icon">💡</span>
            <strong>常见问题：</strong>
            <ul>
              <li>404错误：通常是API端点URL构造错误</li>
              <li>403错误：API Key无效或没有权限</li>
              <li>CORS错误：浏览器跨域限制，需要服务端代理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDebugger