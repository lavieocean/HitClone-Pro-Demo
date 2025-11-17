import React from 'react'
import HitCloneStart from '../pages/HitCloneStart'
import HitCloneReport from '../pages/HitCloneReport'
import HistoryReports from '../pages/HistoryReports'
import GeminiSettings from '../pages/GeminiSettings'
import ChannelAnalysisPage from '../pages/ChannelAnalysisPage'
import HitCloneChannelDashboard from '../pages/HitCloneChannelDashboard'

const MainContent = ({ currentPage, onPageChange, onAnalyze, analysisResults, currentInput }) => {
  const renderPage = () => {
    switch (currentPage) {
      case 'start':
        return <HitCloneStart onAnalyze={onAnalyze} />
      case 'channel':
      case 'hitclone-channel':
        return <HitCloneChannelDashboard onBackToStart={() => onPageChange('start')} />
      case 'report':
        return (
          <HitCloneReport 
            analysisResults={analysisResults}
            currentInput={currentInput}
            onBackToStart={() => onPageChange('start')}
          />
        )
      case 'history':
      case 'favorites':
        return <HistoryReports currentPage={currentPage} onLoadReport={onAnalyze} onPageChange={onPageChange} />
      case 'gemini-settings':
        return <GeminiSettings />
      case 'channel-analysis':
        return (
          <ChannelAnalysisPage 
            channel={currentInput?.data}
            onBack={() => onPageChange('start')}
          />
        )
      default:
        return <HitCloneStart onAnalyze={onAnalyze} />
    }
  }

  return (
    <div className="main-content">
      {renderPage()}
    </div>
  )
}

export default MainContent