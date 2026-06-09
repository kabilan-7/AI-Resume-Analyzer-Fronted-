import React, { useState } from 'react';
import { screenResume } from './api';
import UploadForm from './components/UploadForm';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

export default function App() {
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fileName, setFileName] = useState('');
  const [tab, setTab]           = useState('screen'); // 'screen' | 'history'
  const [refresh, setRefresh]   = useState(0);

  const handleSubmit = async (file, jobTitle, skills, minExp) => {
    setLoading(true);
    setError('');
    setResult(null);
    setFileName(file.name);

    try {
      const data = await screenResume(file, jobTitle, skills, minExp);
      setResult(data);
      setRefresh(r => r + 1); // refresh history
      setTab('screen');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Background glow */}
      <div className="bg-glow bg-glow--1" />
      <div className="bg-glow bg-glow--2" />

      {/* Header */}
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
              History
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="app-main">

        {tab === 'screen' && (
          <div className="screen-layout">

            {/* Left — upload form */}
            <section className="panel panel--form">
              <div className="panel-header">
                <h2 className="panel-title">New screening</h2>
                <p className="panel-sub">
                  Upload a resume and define job criteria to get an AI-powered assessment.
                </p>
              </div>
              <UploadForm onSubmit={handleSubmit} loading={loading} />
            </section>

            {/* Right — result */}
            <section className="panel panel--result">
              <div className="panel-header">
                <h2 className="panel-title">Result</h2>
                <p className="panel-sub">
                  AI screening result will appear here after analysis.
                </p>
              </div>

              {loading && (
                <div className="result-loading">
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                  <p className="loading-text">Analysing resume with AI…</p>
                  <p className="loading-sub">
                    This usually takes 2–5 seconds
                  </p>
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
              <h2 className="panel-title">Screening history</h2>
              <p className="panel-sub">All past results sorted by score.</p>
            </div>
            <HistoryPanel refresh={refresh} />
          </div>
        )}

      </main>

    </div>
  );
}