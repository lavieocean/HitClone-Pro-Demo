import React, { useState } from 'react'

const App = () => {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (!url.trim()) return
    setLoading(true)

    try {
      // 检测Claude API
      const isArtifacts = !!(window?.claude?.complete)
      
      if (isArtifacts) {
        const response = await window.claude.complete({
          prompt: `请分析视频: ${url}，返回JSON格式结果包含：病毒传播潜力评分(0-100)、情感分析、优化建议`,
          max_tokens: 800
        })
        setResult({ ai: true, data: response })
      } else {
        setResult({ ai: false, data: '模拟分析：该视频具有85%的病毒传播潜力' })
      }
    } catch (error) {
      setResult({ ai: false, data: '分析失败，请重试' })
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      {/* API状态 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '8px 16px',
        background: window?.claude?.complete ? '#10b981' : '#3b82f6',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        {window?.claude?.complete ? '✅ Claude API' : '🏠 模拟模式'}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '60px' }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            color: '#DBFC53',
            margin: '0 0 16px 0',
            textShadow: '0 0 30px rgba(219,252,83,0.5)'
          }}>
            HitClone Pro
          </h1>
          <p style={{ fontSize: '18px', color: '#aaa', margin: 0 }}>
            AI驱动的视频分析工具
          </p>
        </div>

        {/* 输入区 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="粘贴YouTube视频链接..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                flex: 1,
                padding: '16px 20px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button
              onClick={analyze}
              disabled={loading || !url.trim()}
              style={{
                padding: '16px 32px',
                background: loading ? '#666' : 'linear-gradient(135deg, #DBFC53, #A8E063)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {loading ? '分析中...' : '🚀 开始分析'}
            </button>
          </div>
          <p style={{ fontSize: '14px', color: '#888', textAlign: 'center', margin: 0 }}>
            支持YouTube视频URL · {window?.claude?.complete ? '真实AI分析' : '智能模拟模式'}
          </p>
        </div>

        {/* 结果区 */}
        {result && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                color: '#DBFC53', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📊</span>
                分析结果
              </h2>
              <span style={{
                padding: '4px 12px',
                background: result.ai ? '#10b981' : '#3b82f6',
                borderRadius: '16px',
                fontSize: '12px'
              }}>
                {result.ai ? '真实AI分析' : '模拟数据'}
              </span>
            </div>
            
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <pre style={{
                color: '#fff',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-wrap',
                fontFamily: 'system-ui, sans-serif'
              }}>
                {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
              </pre>
            </div>

            {result.ai && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(219,252,83,0.1)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#DBFC53' }}>
                  ✨ 这是通过真实Claude API生成的分析结果！您可以询问更多关于这个视频的问题。
                </p>
              </div>
            )}
          </div>
        )}

        {/* 说明 */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#DBFC53', marginBottom: '16px' }}>🔥 功能特色</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>智能AI分析</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#aaa' }}>
                {window?.claude?.complete ? '真实Claude API' : '高质量模拟'}
              </p>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧬</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>病毒传播分析</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#aaa' }}>评估内容传播潜力</p>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>即时反馈</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#aaa' }}>快速获得分析结果</p>
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: '#666' }}>
            在Claude Artifacts环境中部署可获得真实AI分析能力
          </p>
        </div>
      </div>
    </div>
  )
}

export default App