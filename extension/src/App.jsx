import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

export default function App() {
  // REACT DEV CONCEPT: Lifting State Up
  // The 'token' and 'email' states are lifted to the very top level (App.jsx) 
  // because multiple child components (Dashboard and Auth) need to share this data.
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isDark, setDark] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const theme = isDark ? 'dark' : 'light';

  // Load auth session and theme from extension storage or fallback to local storage
  useEffect(() => {
    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['token', 'email', 'theme'], (result) => {
        if (result.token) {
          setToken(result.token);
          setEmail(result.email || '');
        }
        if (result.theme) {
          setDark(result.theme === 'dark');
        }
        setInitialized(true);
      });
    } else {
      // Fallback for local web testing
      const storedToken = localStorage.getItem('token');
      const storedEmail = localStorage.getItem('email');
      const storedTheme = localStorage.getItem('theme');
      if (storedToken) {
        setToken(storedToken);
        setEmail(storedEmail || '');
      }
      if (storedTheme) {
        setDark(storedTheme === 'dark');
      }
      setInitialized(true);
    }
  }, []);

  function handleAuthSuccess(newToken, newEmail) {
    setToken(newToken);
    setEmail(newEmail);

    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ token: newToken, email: newEmail });
    } else {
      localStorage.setItem('token', newToken);
      localStorage.setItem('email', newEmail);
    }
  };

  function handleLogout() {
    setToken('');
    setEmail('');

    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(['token', 'email'], () => {
        if (chrome.alarms) {
          chrome.alarms.clearAll();
        }
      });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
    }
  };

  function toggleTheme() {
    setDark(!isDark);
    const nextTheme = !isDark ? 'dark' : 'light';

    if (window.chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: nextTheme });
    } else {
      localStorage.setItem('theme', nextTheme);
    }
  };

  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#9ca3af',
        backgroundColor: '#0a0e17'
      }}>
        Initializing Urgentify...
      </div>
    );
  }

  return (
    <div className={`theme-wrapper ${theme}-theme`}>
      {token ? (
        <Dashboard 
          token={token} 
          email={email} 
          onLogout={handleLogout} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <Auth 
          onAuthSuccess={handleAuthSuccess} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};


