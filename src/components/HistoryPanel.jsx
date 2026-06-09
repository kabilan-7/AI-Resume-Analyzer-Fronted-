import React, { useState, useEffect } from 'react';
import { getResults } from '../api';
import './HistoryPanel.css';

const SCORE_COLOR = s => s >= 75 ? '#22C97A' : s >= 45 ? '#F5A623' : '#FF5C5C';
const BADGE_CLASS = c => ({
  STRONG_FIT: 'strong', POSSIBLE_FIT: 'possible', NOT_FIT: 'not'
})[c] || 'not';
const LABEL = c => ({
  STRONG_FIT: 'Strong', POSSIBLE_FIT: 'Possible', NOT_FIT: 'Not a fit'
})[c] || c;

export default function HistoryPanel({ refresh }) {
  const [records, setRecords]   = useState([]);
  const [filter, setFilter]     = useState('ALL');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getResults(filter === 'ALL' ? null : filter);
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, refresh]);

  const metrics = {
    total:    records.length,
    strong:   records.filter(r => r.classification === 'STRONG_FIT').length,
    possible: records.filter(r => r.classification === 'POSSIBLE_FIT').length,
    not:      records.filter(r => r.classification === 'NOT_FIT').length,
  };

  return (
    <div className="history-panel">

      {/* Metrics */}
      <div className="metrics-row">
        {[
          { label: 'Total',    value: metrics.total,    color: 'var(--text)' },
          { label: 'Strong',   value: metrics.strong,   color: 'var(--green)' },
          { label: 'Possible', value: metrics.possible, color: 'var(--amber)' },
          { label: 'Not fit',  value: metrics.not,      color: 'var(--red)' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <span className="metric-val" style={{ color: m.color }}>{m.value}</span>
            <span className="metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-row">
        {['ALL','STRONG_FIT','POSSIBLE_FIT','NOT_FIT'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' :
             f === 'STRONG_FIT' ? 'Strong fit' :
             f === 'POSSIBLE_FIT' ? 'Possible fit' : 'Not a fit'}
          </button>
        ))}
        <button className="filter-btn refresh-btn" onClick={load} title="Refresh">↻</button>
      </div>

      {/* List */}
      {loading ? (
        <div className="history-loading">
          <span className="spinner" style={{width:18,height:18}} />
          Loading…
        </div>
      ) : records.length === 0 ? (
        <div className="history-empty">
          No screening results yet. Upload a resume to get started.
        </div>
      ) : (
        <div className="history-list">
          {records.map(r => (
            <div key={r.id} className="history-item">
              <div
                className="history-row"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div className="history-avatar"
                  style={{ background: SCORE_COLOR(r.score) + '20',
                           color: SCORE_COLOR(r.score) }}>
                  {r.fileName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="history-info">
                  <span className="history-name">{r.fileName}</span>
                  <span className="history-role">{r.jobTitle}</span>
                </div>
                <span className={`history-badge history-badge--${BADGE_CLASS(r.classification)}`}>
                  {LABEL(r.classification)}
                </span>
                <div className="history-score-wrap">
                  <span className="history-score"
                    style={{ color: SCORE_COLOR(r.score) }}>
                    {r.score}
                  </span>
                  <div className="history-bar">
                    <div className="history-bar-fill"
                      style={{ width:`${r.score}%`,
                               background: SCORE_COLOR(r.score) }} />
                  </div>
                </div>
                <span className="history-chevron">
                  {expanded === r.id ? '▲' : '▼'}
                </span>
              </div>

              {/* Expanded detail */}
              {expanded === r.id && (
                <div className="history-detail">
                  <p className="history-summary">{r.summary}</p>
                  <div className="history-skills-grid">
                    <div>
                      <p className="history-skills-label">Matched</p>
                      <div className="rc-chips">
                        {r.matchedSkills?.length
                          ? r.matchedSkills.map(s =>
                              <span key={s} className="rc-chip rc-chip--match">{s}</span>)
                          : <span className="rc-none">None</span>}
                      </div>
                    </div>
                    <div>
                      <p className="history-skills-label">Missing</p>
                      <div className="rc-chips">
                        {r.missingSkills?.length
                          ? r.missingSkills.map(s =>
                              <span key={s} className="rc-chip rc-chip--miss">{s}</span>)
                          : <span className="rc-none">None</span>}
                      </div>
                    </div>
                  </div>
                  <div className="history-meta">
                    <span>{r.yearsExperience} yrs exp</span>
                    {r.createdAt && (
                      <span>{new Date(r.createdAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}