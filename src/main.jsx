import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// No code-splitting here today, but this is zero-cost insurance: if that
// ever changes, a tab left open across a deploy won't be stuck on a dead
// chunk reference — see scrapbook's main.tsx for the concrete failure mode.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});
