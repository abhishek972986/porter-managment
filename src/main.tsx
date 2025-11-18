import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// MSW disabled - using real backend
async function enableMocking() {
  // Disable MSW since we're using the real backend
  return Promise.resolve();
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

