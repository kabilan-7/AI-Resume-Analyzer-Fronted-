import React, { useState } from 'react';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

export default function Register({ onSwitchToLogin }) {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!email.trim())    return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const data = await registerUser(fullName.trim(), email.trim(), password);
      login(data);
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.response?.status === 409 ? 'An account with this email already exists.' : 'Something went wrong.');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start screening resumes with AI</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Kabilan M"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin}>Log in</button>
        </p>

        <p className="auth-note">
          New accounts are created with the <strong>Recruiter</strong> role.
        </p>

      </div>
    </div>
  );
}