import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <UIProvider>
                <App />
              </UIProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
