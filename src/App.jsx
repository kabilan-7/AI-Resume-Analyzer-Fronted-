import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { screenResume } from './api';
import Login from './components/Login';
import Register from './components/Register';
import UploadForm from './components/UploadForm';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

function AppContent() {
  const { user, ready, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fileName, setFileName] = useState('');
  const [tab, setTab]           = useState('screen');
  const [refresh, setRefresh]   = useState(0);

  // Wait until we've checked sessionStorage before deciding what to show
  if (!ready) return null;

  // ── Not logged in — show auth screens ────────────────────────
  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const handleSubmit = async (file, jobTitle, skills, minExp) => {
    setLoading(true);
    setError('');
    setResult(null);
    setFileName(file.name);

    try {
      const data = await screenResume(file, jobTitle, skills, minExp);
      setResult(data);
      setRefresh(r => r + 1);
      setTab('screen');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="app">
      <div className="bg-glow bg-glow--1" />
      <div className="bg-glow bg-glow--2" />

      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">AI</span>
            <span className="logo-text">Resume Screener</span>
          </div>

          <nav className="header-nav">
            <button
              className={`nav-btn ${tab === 'screen' ? 'active' : ''}`}
              onClick={() => setTab('screen')}
            >
              Screen
            </button>
            <button
              className={`nav-btn ${tab === 'history' ? 'active' : ''}`}
              onClick={() => setTab('history')}
            >
              {isAdmin ? 'All history' : 'History'}
            </button>
          </nav>

          <div className="user-menu">
            <span className={`role-badge ${isAdmin ? 'role-badge--admin' : 'role-badge--recruiter'}`}>
              {isAdmin ? 'Admin' : 'Recruiter'}
            </span>
            <div className="user-info">
              <span className="user-name">{user.fullName}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="logout-btn" onClick={logout} title="Log out">
              ⏻
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">

        {tab === 'screen' && (
          <div className="screen-layout">

            <section className="panel panel--form">
              <div className="panel-header">
                <h2 className="panel-title">New screening</h2>
                <p className="panel-sub">
                  Upload a resume and define job criteria to get an AI-powered assessment.
                </p>
              </div>
              <UploadForm onSubmit={handleSubmit} loading={loading} />
            </section>

            <section className="panel panel--result">
              <div className="panel-header">
                <h2 className="panel-title">Result</h2>
                <p className="panel-sub">
                  AI screening result will appear here after analysis.
                </p>
              </div>

              {loading && (
                <div className="result-loading">
                  <div className="loading-dots"><span /><span /><span /></div>
                  <p className="loading-text">Analysing resume with AI…</p>
                  <p className="loading-sub">This usually takes 2–5 seconds</p>
                </div>
              )}

              {error && !loading && (
                <div className="result-error">
                  <span className="error-icon">⚠</span>
                  <div>
                    <p className="error-title">Something went wrong</p>
                    <p className="error-msg">{error}</p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <ResultCard result={result} fileName={fileName} />
              )}

              {!result && !loading && !error && (
                <div className="result-empty">
                  <div className="empty-icon">◈</div>
                  <p className="empty-text">
                    Upload a resume and click <strong>Screen resume</strong> to see results here.
                  </p>
                </div>
              )}
            </section>

          </div>
        )}

        {tab === 'history' && (
          <div className="history-layout">
            <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="panel-title">
                {isAdmin ? 'All recruiters — screening history' : 'Your screening history'}
              </h2>
              <p className="panel-sub">
                {isAdmin
                  ? 'Viewing results across every recruiter account.'
                  : 'Only screenings you created are shown here.'}
              </p>
            </div>
            <HistoryPanel refresh={refresh} />
          </div>
        )}

      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}