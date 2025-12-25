
import React from 'react';
import ReactDOM from 'react-dom/client';
import RootLayout from './app/layout.tsx';
import Home from './app/page.tsx';

// Ensure the application doesn't completely crash the browser session 
// and provides a clear error in the console.
const init = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("Critical: Could not find root element to mount to");
      return;
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <RootLayout>
          <Home />
        </RootLayout>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Application failed to mount:", error);
    // Fallback UI could be injected here if needed
  }
};

// Start the app
init();
