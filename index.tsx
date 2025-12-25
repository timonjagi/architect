import React from 'react';
import ReactDOM from 'react-dom/client';
import RootLayout from './app/layout.tsx';
import Home from './app/page.tsx';

/**
 * Initializes the React application.
 * Using a safer pattern to ensure the DOM is ready and error handling is robust.
 */
const init = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("Critical: Could not find #root element.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <RootLayout>
          <Home />
        </RootLayout>
      </React.StrictMode>
    );
    console.log("Architect application mounted successfully.");
  } catch (err) {
    console.error("React Mounting Failed:", err);
    rootElement.innerHTML = `
      <div style="background: #020617; color: #f87171; padding: 40px; font-family: sans-serif; text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Architect Initialization Error</h1>
        <p style="color: #94a3b8; margin-bottom: 2rem;">The app failed to load. This might be due to a script loading error.</p>
        <pre style="background: #111; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #fff; max-width: 600px; margin: 0 auto; overflow: auto;">
          ${err instanceof Error ? err.stack : String(err)}
        </pre>
      </div>
    `;
  }
};

// Start initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
