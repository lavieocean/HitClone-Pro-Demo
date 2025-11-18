import React from 'react'
import AppLayoutEnhanced from './components/layout/AppLayoutEnhanced'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/hitclone-design.css'
import './styles/responsive-fixes.css'

function App() {
  return (
    <ErrorBoundary>
      <AppLayoutEnhanced />
    </ErrorBoundary>
  )
}

export default App