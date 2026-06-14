import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

window.onerror = function(message, source, lineno, colno, error) {
  document.body.innerHTML = '<div style="color:red; padding:20px; font-family:sans-serif;"><h1>JS Error:</h1><pre>' + message + '</pre></div>';
  return false;
};

createRoot(document.getElementById('root')!).render(
    <Router>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Router>
)
