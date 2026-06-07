import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import './Auth.css';

export default function Auth({ onAuthSuccess, theme, onToggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  // REACT DEV CONCEPT: Controlled Components
  // The email and password inputs are controlled by React State.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Authentication failed');
      }

      if (resData.success && resData.data.token) {
        onAuthSuccess(resData.data.token, resData.data.email);
      } else {
        throw new Error('No token returned from server');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Theme Toggle Button using SVG */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title="Toggle Dark/Light Theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
        </div>

        <div className="auth-header">
          <h1>Urgentify</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Log in to sync your visual urgency board' : 'Create an account to start syncing'}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* REACT DEV CONCEPT: Form Submission Handling */}
        {/* We use onSubmit on the form rather than onClick on the button */}
        {/* so that hitting the "Enter" key automatically triggers the submission. */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}>
            {isLogin ? 'Register' : 'Sign In'}
          </span>
        </div>
      </div>
    </div>
  );
};

