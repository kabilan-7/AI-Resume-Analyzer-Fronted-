import React, { useState, useEffect } from 'react';
import { getCandidates, exportCsv, exportPdf } from '../api';
import './CandidateTable.css';

const SCORE_COLOR = s => s >= 75 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)';

const CLASS_LABEL = { STRONG_FIT: 'Strong', POSSIBLE_FIT: 'Possible', NOT_FIT: 'Not fit' };
const CLASS_CSS   = { STRONG_FIT: 'ct-badge--strong', POSSIBLE_FIT: 'ct-badge--possible', NOT_FIT: 'ct-badge--not' };

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function CandidateTable({ job, refresh }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [filter, setFilter]         = useState('ALL');
  const [search, setSearch]         = useState('');
  const [expanded, setExpanded]     = useState(null);
  const [exporting, setExporting]   = useState('');

  const load = async () => {
    if (!job) return;
    setLoading(true);
    try { setCandidates(await getCandidates(job.id)); }
    catch { setCandidates([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [job?.id, refresh]);

  const filtered = candidates.filter(c => {
    const matchFilter = filter === 'ALL' || c.classification === filter;
    const matchSearch = !search ||
      c.fileName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleExportCsv = async () => {
    setExporting('csv');
    try {
      const res = await exportCsv(job.id);
      downloadBlob(res.data, `${job.title}-candidates.csv`);
    } finally { setExporting(''); }
  };

  const handleExportPdf = async () => {
    setExporting('pdf');
    try {
      const res = await exportPdf(job.id);
      downloadBlob(res.data, `${job.title}-candidates.pdf`);
    } finally { setExporting(''); }
  };

  if (!job) return (
    <div className="ct-empty ct-empty--placeholder">
      <div className="ct-empty-icon">◈</div>
      <p>Select a job opening to view the candidate ranking.</p>
    </div>
  );

  const metrics = {
    total:    candidates.length,
    strong:   candidates.filter(c => c.classification === 'STRONG_FIT').length,
    possible: candidates.filter(c => c.classification === 'POSSIBLE_FIT').length,
    not:      candidates.filter(c => c.classification === 'NOT_FIT').length,
    avgScore: candidates.length
      ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / candidates.length)
      : 0,
  };

  return (
    <div className="ct-wrap">

      {/* Header + export */}
      <div className="ct-header">
        <div>
          <h3 className="ct-title">{job.title}</h3>
          <p className="ct-sub">
            {job.requiredSkills?.join(', ')} · {job.minYearsExperience}+ yrs
          </p>
        </div>
        <div className="ct-export-row">
          <button className="ct-export-btn" onClick={handleExportCsv}
            disabled={!candidates.length || exporting === 'csv'}>
            {exporting === 'csv' ? '…' : '↓ CSV'}
          </button>
          <button className="ct-export-btn" onClick={handleExportPdf}
            disabled={!candidates.length || exporting === 'pdf'}>
            {exporting === 'pdf' ? '…' : '↓ PDF'}
          </button>
          <button className="ct-refresh-btn" onClick={load} title="Refresh">↻</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="ct-metrics">
        {[
          { label: 'Total',    val: metrics.total,    color: 'var(--text)' },
          { label: 'Strong',   val: metrics.strong,   color: 'var(--green)' },
          { label: 'Possible', val: metrics.possible, color: 'var(--amber)' },
          { label: 'Not fit',  val: metrics.not,      color: 'var(--red)' },
          { label: 'Avg score',val: metrics.avgScore, color: SCORE_COLOR(metrics.avgScore) },
        ].map(m => (
          <div key={m.label} className="ct-metric">
            <span className="ct-metric-val" style={{ color: m.color }}>{m.val}</span>
            <span className="ct-metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="ct-controls">
        <div className="ct-filters">
          {['ALL', 'STRONG_FIT', 'POSSIBLE_FIT', 'NOT_FIT'].map(f => (
            <button key={f}
              className={`ct-filter-btn ${filter === f ? 'ct-filter-btn--active' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'All' :
               f === 'STRONG_FIT' ? 'Strong fit' :
               f === 'POSSIBLE_FIT' ? 'Possible fit' : 'Not a fit'}
            </button>
          ))}
        </div>
        <input className="ct-search" placeholder="Search by filename…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="ct-empty">Loading candidates…</div>
      ) : filtered.length === 0 ? (
        <div className="ct-empty">
          {candidates.length === 0
            ? 'No resumes screened yet. Use bulk upload above to start.'
            : 'No candidates match the current filter.'}
        </div>
      ) : (
        <div className="ct-table-wrap">
          <table className="ct-table">
            <thead>
              <tr>
                <th>#</th>
                <th>File</th>
                <th>Score</th>
                <th>Fit</th>
                <th>Yrs exp</th>
                <th>Matched skills</th>
                <th>Missing</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <React.Fragment key={c.id}>
                  <tr className={expanded === c.id ? 'ct-row--expanded' : ''}>
                    <td className="ct-rank">{i + 1}</td>
                    <td className="ct-filename" title={c.fileName}>{c.fileName}</td>
                    <td className="ct-score-cell">
                      <span className="ct-score-num" style={{ color: SCORE_COLOR(c.score) }}>
                        {c.score}
                      </span>
                      <div className="ct-score-bar">
                        <div className="ct-score-fill"
                          style={{ width: `${c.score}%`, background: SCORE_COLOR(c.score) }} />
                      </div>
                    </td>
                    <td>
                      <span className={`ct-badge ${CLASS_CSS[c.classification]}`}>
                        {CLASS_LABEL[c.classification] || c.classification}
                      </span>
                    </td>
                    <td className="ct-yrs">{c.yearsExperience}</td>
                    <td className="ct-skills">
                      {c.matchedSkills?.slice(0, 3).map(s => (
                        <span key={s} className="ct-skill ct-skill--match">{s}</span>
                      ))}
                      {c.matchedSkills?.length > 3 && (
                        <span className="ct-skill-more">+{c.matchedSkills.length - 3}</span>
                      )}
                    </td>
                    <td className="ct-skills">
                      {c.missingSkills?.slice(0, 2).map(s => (
                        <span key={s} className="ct-skill ct-skill--miss">{s}</span>
                      ))}
                      {c.missingSkills?.length > 2 && (
                        <span className="ct-skill-more">+{c.missingSkills.length - 2}</span>
                      )}
                    </td>
                    <td>
                      <button className="ct-expand-btn"
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                        {expanded === c.id ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>

                  {expanded === c.id && (
                    <tr className="ct-detail-row">
                      <td colSpan={8}>
                        <div className="ct-detail">
                          <p className="ct-detail-summary">{c.summary}</p>
                          <div className="ct-detail-skills">
                            <div>
                              <p className="ct-detail-label">All matched skills</p>
                              <div className="ct-skill-row">
                                {c.matchedSkills?.length
                                  ? c.matchedSkills.map(s =>
                                      <span key={s} className="ct-skill ct-skill--match">{s}</span>)
                                  : <span className="ct-none">None</span>}
                              </div>
                            </div>
                            <div>
                              <p className="ct-detail-label">All missing skills</p>
                              <div className="ct-skill-row">
                                {c.missingSkills?.length
                                  ? c.missingSkills.map(s =>
                                      <span key={s} className="ct-skill ct-skill--miss">{s}</span>)
                                  : <span className="ct-none">None</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}