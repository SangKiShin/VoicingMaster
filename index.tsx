
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Could not find root element to mount to");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render the app:", error);
    // 렌더링 실패 시 사용자에게 알림 표시 (선택 사항)
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #e11d48; text-align: center; padding: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Application Error</h1>
        <p style="color: #64748b;">The application failed to load. Please try refreshing the page.</p>
        <pre style="margin-top: 20px; font-size: 12px; background: #f1f5f9; padding: 10px; border-radius: 8px; max-width: 100%; overflow: auto;">${error}</pre>
      </div>
    `;
  }
};

// DOM이 완전히 로드된 후 실행되도록 보장
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
