import React, { useState } from 'react';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email.trim(), password);
      login(data);
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.response?.status === 401 ? 'Invalid email or password.' : 'Something went wrong.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">

        <div className="auth-logo">
          <span className="logo-mark">AI</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to your recruiter account</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Log in →'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister}>Sign up</button>
        </p>

      </div>
    </div>
  );
}