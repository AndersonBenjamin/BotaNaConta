import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
// Fonte Archivo servida pelo próprio app (a CSP não permite fontes externas).
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/600.css';
import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/archivo/400-italic.css';
import '@fontsource/archivo/500-italic.css';
import '@fontsource/archivo/600-italic.css';
import '@fontsource/archivo/700-italic.css';
import '@fontsource/archivo/800-italic.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
