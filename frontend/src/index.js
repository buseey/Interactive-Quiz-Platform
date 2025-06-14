import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

// Create a root to render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component wrapped with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
