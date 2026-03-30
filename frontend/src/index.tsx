import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import type { BeforeInstallPromptEvent } from './serviceWorkerRegistration';

if (process.env.NODE_ENV === 'development') {
  window.addEventListener(
    'error',
    (event) => {
      const message = event.message || (event.error as Error | undefined)?.message || '';
      if (
        message.includes('ResizeObserver loop completed with undelivered notifications') ||
        message.includes('ResizeObserver loop limit exceeded')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: () => {},
  onUpdate: (registration) => {
    // Dispatch custom event that can be caught by a component
    const event = new CustomEvent('swUpdated', { detail: registration });
    window.dispatchEvent(event);
  },
});

// Store beforeinstallprompt event for later use
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e as BeforeInstallPromptEvent;

  // Dispatch custom event for install prompt
  const event = new CustomEvent('showInstallPrompt');
  window.dispatchEvent(event);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
