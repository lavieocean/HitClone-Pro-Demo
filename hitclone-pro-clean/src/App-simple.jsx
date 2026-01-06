import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-white">HitClone </span>
          <span style={{ color: '#DBFC53' }}>Pro</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          AI驱动的视频内容分析平台
        </p>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md">
          <p className="text-gray-300 mb-4">应用正在加载...</p>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 rounded-full animate-pulse" 
              style={{ 
                background: 'linear-gradient(to right, #DBFC53, #c7e847)',
                width: '75%' 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App