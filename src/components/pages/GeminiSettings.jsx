import React, { useState, useEffect } from 'react'
import geminiApi from '../../services/geminiApi'

const GeminiSettings = () => {
  const [config, setConfig] = useState({
    apiKey: '',
    model: 'gemini-2.5-pro-latest',
    maxTokens: 8000,
    temperature: 0.7
  })
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // 加载现有配置
    const existingConfig = geminiApi.getConfig()
    if (existingConfig) {
      setConfig(existingConfig)
    }
  }, [])

  const handleSave = () => {
    geminiApi.saveConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const result = await geminiApi.testConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        error: error
      })
    } finally {
      setTesting(false)
    }
  }

  const availableModels = geminiApi.getAvailableModels()

  return (
    <div style={{
      padding: '24px',
      maxWidth: '800px',
      margin: '0 auto',
      color: 'white'
    }}>
      <div style={{
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🧠 Gemini 2.5 Settings
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)',
          margin: 0
        }}>
          配置您的Google Gemini 2.5 API访问
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          color: '#DBFC53'
        }}>
          API配置
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.9)'
          }}>
            API Key
          </label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({...config, apiKey: e.target.value})}
            placeholder="输入您的Google AI API Key"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px'
            }}
          />
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '4px'
          }}>
            在 <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" style={{color: '#DBFC53'}}>Google AI Studio</a> 获取您的API Key
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.9)'
          }}>
            模型选择
          </label>
          <select
            value={config.model}
            onChange={(e) => setConfig({...config, model: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px'
            }}
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id} style={{background: '#333', color: 'white'}}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: 'rgba(255,255,255,0.9)'
            }}>
              最大Token数
            </label>
            <input
              type="number"
              value={config.maxTokens}
              onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
              min="1000"
              max="32000"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: 'rgba(255,255,255,0.9)'
            }}>
              温度 (0.0-1.0)
            </label>
            <input
              type="number"
              value={config.temperature}
              onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
              min="0"
              max="1"
              step="0.1"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ 
          display: 'flex',
          gap: '12px',
          marginTop: '24px'
        }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: saved ? '#10B981' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {saved ? '✅ 已保存' : '💾 保存配置'}
          </button>

          <button
            onClick={handleTest}
            disabled={testing || !config.apiKey}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: testing ? '#6B7280' : '#F59E0B',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: testing || !config.apiKey ? 'not-allowed' : 'pointer',
              opacity: testing || !config.apiKey ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {testing ? '🔄 测试中...' : '🧪 测试连接'}
          </button>
        </div>
      </div>

      {testResult && (
        <div style={{
          background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${testResult.success ? '#10B981' : '#EF4444'}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
            color: testResult.success ? '#10B981' : '#EF4444'
          }}>
            {testResult.success ? '✅ 连接测试成功' : '❌ 连接测试失败'}
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            margin: 0,
            fontSize: '14px'
          }}>
            {testResult.message}
          </p>
          {testResult.response && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)'
            }}>
              <strong>API响应:</strong> {testResult.response}
            </div>
          )}
        </div>
      )}

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#DBFC53'
        }}>
          💡 使用说明
        </h3>
        <div style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: '1.6'
        }}>
          <p>1. 在 <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" style={{color: '#DBFC53'}}>Google AI Studio</a> 创建API Key</p>
          <p>2. 选择适合的模型：Pro版本功能更强，Flash版本速度更快</p>
          <p>3. 调整Token数量和温度参数以优化响应质量</p>
          <p>4. 点击"测试连接"验证配置是否正确</p>
          <p>5. 保存配置后即可在HitClone Pro中使用Gemini AI分析</p>
        </div>
      </div>
    </div>
  )
}

export default GeminiSettings