import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Global error logger
window.logError = (errorData) => {
  console.error('Logged error:', errorData);
  
  // In production, send to backend logging endpoint
  if (import.meta.env.PROD) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/api/log/error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(err => console.error('Failed to log error:', err));
  }
};

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  window.logError({
    type: 'unhandled_rejection',
    error: event.reason?.toString(),
    timestamp: new Date().toISOString()
  });
});

// Catch global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  window.logError({
    type: 'global_error',
    error: event.error?.toString(),
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString()
  });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
