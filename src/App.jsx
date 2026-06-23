import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { screenResume } from './api';
import Login from './components/Login';
import Register from './components/Register';
import UploadForm from './components/UploadForm';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import JobList from './components/JobList';
import BulkUpload from './components/BulkUpload';
import CandidateTable from './components/CandidateTable';
import './App.css';

function AppContent() {
  const { user, ready, logout } = useAuth();
  const [authView, setAuthView] = useState('login');

  // Screen tab state
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fileName, setFileName] = useState('');

  // Jobs tab state
  const [selectedJob, setSelectedJob]       = useState(null);
  const [candidateRefresh, setCandidateRefresh] = useState(0);

  const [tab, setTab]     = useState('screen');
  const [refresh, setRefresh] = useState(0);

  if (!ready) return null;

  if (!user) {
    return authView === 'login'
      ? <Login onSwitchToRegister={() => setAuthView('register')} />
      : <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  const handleSubmit = async (file, jobTitle, skills, minExp) => {
    setLoading(true); setError(''); setResult(null); setFileName(file.name);
    try {
      const data = await screenResume(file, jobTitle, skills, minExp);
      setResult(data);
      setRefresh(r => r + 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally { setLoading(false); }
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
            {['screen', 'jobs', 'history'].map(t => (
              <button key={t}
                className={`nav-btn ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}>
                {t === 'screen' ? 'Screen'
                  : t === 'jobs' ? 'Jobs'
                  : isAdmin ? 'All history' : 'History'}
              </button>
            ))}
          </nav>

          <div className="user-menu">
            <span className={`role-badge ${isAdmin ? 'role-badge--admin' : 'role-badge--recruiter'}`}>
              {isAdmin ? 'Admin' : 'Recruiter'}
            </span>
            <div className="user-info">
              <span className="user-name">{user.fullName}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="logout-btn" onClick={logout} title="Log out">⏻</button>
          </div>
        </div>
      </header>

      <main className="app-main">

        {/* ── Screen tab ───────────────────────────────────── */}
        {tab === 'screen' && (
          <div className="screen-layout">
            <section className="panel panel--form">
              <div className="panel-header">
                <h2 className="panel-title">New screening</h2>
                <p className="panel-sub">Single resume, quick result.</p>
              </div>
              <UploadForm onSubmit={handleSubmit} loading={loading} />
            </section>

            <section className="panel panel--result">
              <div className="panel-header">
                <h2 className="panel-title">Result</h2>
                <p className="panel-sub">AI assessment appears here.</p>
              </div>

              {loading && (
                <div className="result-loading">
                  <div className="loading-dots"><span /><span /><span /></div>
                  <p className="loading-text">Analysing resume with AI…</p>
                  <p className="loading-sub">Usually 2–5 seconds</p>
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
              {result && !loading && <ResultCard result={result} fileName={fileName} />}
              {!result && !loading && !error && (
                <div className="result-empty">
                  <div className="empty-icon">◈</div>
                  <p className="empty-text">
                    Upload a resume and click <strong>Screen resume</strong>.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Jobs tab ─────────────────────────────────────── */}
        {tab === 'jobs' && (
          <div className="jobs-layout">

            {/* Left column — job list */}
            <div className="jobs-sidebar">
              <JobList
                onSelectJob={job => { setSelectedJob(job); setCandidateRefresh(0); }}
                selectedJobId={selectedJob?.id}
              />
              {selectedJob && (
                <div className="panel" style={{ marginTop: '1rem' }}>
                  <BulkUpload
                    job={selectedJob}
                    onComplete={() => setCandidateRefresh(r => r + 1)}
                  />
                </div>
              )}
            </div>

            {/* Right column — ranked table */}
            <div className="jobs-main panel">
              <CandidateTable job={selectedJob} refresh={candidateRefresh} />
            </div>

          </div>
        )}

        {/* ── History tab ───────────────────────────────────── */}
        {tab === 'history' && (
          <div className="history-layout">
            <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
              <h2 className="panel-title">
                {isAdmin ? 'All recruiters — history' : 'Your screening history'}
              </h2>
              <p className="panel-sub">
                {isAdmin
                  ? 'Viewing results across every recruiter.'
                  : 'Only your screenings are shown.'}
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
  return <AuthProvider><AppContent /></AuthProvider>;
}