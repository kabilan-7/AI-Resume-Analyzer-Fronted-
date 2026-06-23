import React, { useState, useRef } from 'react';
import { bulkScreen } from '../api';
import './BulkUpload.css';

const MAX_FILES = 25;

export default function BulkUpload({ job, onComplete }) {
  const [files, setFiles]       = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState('');
  const [summary, setSummary]   = useState(null);
  const fileRef = useRef();

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf', 'docx', 'txt'].includes(ext);
    });
    setFiles(prev => {
      const combined = [...prev, ...valid];
      return combined.slice(0, MAX_FILES);
    });
  };

  const removeFile = (idx) =>
    setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!files.length) return setError('Please add at least one resume.');
    setError('');
    setLoading(true);
    setProgress(0);
    setSummary(null);

    try {
      const result = await bulkScreen(job.id, files, (evt) => {
        if (evt.total) setProgress(Math.round(evt.loaded / evt.total * 100));
      });
      setSummary(result);
      setFiles([]);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk screening failed.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) =>
    s >= 75 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="bu-wrap">
      <div className="bu-header">
        <h3 className="bu-title">Bulk screening</h3>
        <span className="bu-job-badge">{job.title}</span>
      </div>

      {/* Drop zone */}
      {!summary && (
        <>
          <div
            className={`bu-drop ${dragOver ? 'bu-drop--over' : ''} ${files.length ? 'bu-drop--has' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input ref={fileRef} type="file" multiple
              accept=".pdf,.docx,.txt" style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)} />
            <div className="bu-drop-icon">⬆</div>
            <div className="bu-drop-text">
              Drop up to {MAX_FILES} resumes here or click to browse
            </div>
            <div className="bu-drop-sub">PDF, DOCX, TXT</div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="bu-file-list">
              <div className="bu-file-list-header">
                <span>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
                <button className="bu-clear-all" onClick={() => setFiles([])}>
                  Clear all
                </button>
              </div>
              {files.map((f, i) => (
                <div key={i} className="bu-file-item">
                  <span className="bu-file-icon">📄</span>
                  <span className="bu-file-name">{f.name}</span>
                  <span className="bu-file-size">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                  <button className="bu-file-remove"
                    onClick={() => removeFile(i)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Loading progress */}
          {loading && (
            <div className="bu-progress-wrap">
              <div className="bu-progress-bar">
                <div className="bu-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="bu-progress-text">
                {progress < 100
                  ? `Uploading… ${progress}%`
                  : 'AI is screening all resumes in parallel…'}
              </span>
            </div>
          )}

          {error && <div className="bu-error">{error}</div>}

          <button
            className={`bu-submit ${loading ? 'bu-submit--loading' : ''}`}
            disabled={loading || !files.length}
            onClick={handleSubmit}
          >
            {loading
              ? <><span className="bu-spinner" /> Screening {files.length} resumes…</>
              : `Screen ${files.length || ''} resume${files.length !== 1 ? 's' : ''} →`}
          </button>
        </>
      )}

      {/* Summary after completion */}
      {summary && (
        <div className="bu-summary" style={{ animation: 'fadeUp .3s ease' }}>
          <div className="bu-summary-metrics">
            <div className="bu-metric">
              <span className="bu-metric-val">{summary.totalSubmitted}</span>
              <span className="bu-metric-label">Submitted</span>
            </div>
            <div className="bu-metric">
              <span className="bu-metric-val" style={{ color: 'var(--green)' }}>
                {summary.successCount}
              </span>
              <span className="bu-metric-label">Succeeded</span>
            </div>
            <div className="bu-metric">
              <span className="bu-metric-val" style={{ color: 'var(--red)' }}>
                {summary.failureCount}
              </span>
              <span className="bu-metric-label">Failed</span>
            </div>
          </div>

          <div className="bu-result-list">
            {summary.items.map((item, i) => (
              <div key={i} className={`bu-result-item ${!item.success ? 'bu-result-item--err' : ''}`}>
                <span className="bu-result-icon">{item.success ? '✓' : '✕'}</span>
                <span className="bu-result-name">{item.fileName}</span>
                {item.success && (
                  <>
                    <span className="bu-result-score"
                      style={{ color: scoreColor(item.result.score) }}>
                      {item.result.score}
                    </span>
                    <span className="bu-result-class">
                      {item.result.classification === 'STRONG_FIT' ? 'Strong' :
                       item.result.classification === 'POSSIBLE_FIT' ? 'Possible' : 'Not fit'}
                    </span>
                  </>
                )}
                {!item.success && (
                  <span className="bu-result-err">{item.errorMessage}</span>
                )}
              </div>
            ))}
          </div>

          <button className="bu-again-btn"
            onClick={() => { setSummary(null); setFiles([]); }}>
            Screen more resumes
          </button>
        </div>
      )}
    </div>
  );
}