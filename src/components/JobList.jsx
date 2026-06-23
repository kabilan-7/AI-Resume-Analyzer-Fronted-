import React, { useState, useEffect } from 'react';
import { getJobs, createJob, deleteJob } from '../api';
import './JobList.css';

export default function JobList({ onSelectJob, selectedJobId }) {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [title, setTitle]         = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills]       = useState([]);
  const [minExp, setMinExp]       = useState(2);
  const [description, setDescription] = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = async () => {
  setLoading(true);
  try {
    const data = await getJobs();

    console.log("Jobs Response:", data);
    console.log("Is Array?", Array.isArray(data));

    setJobs(data);
  } catch (err) {
    console.log(err);
    setJobs([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, []);

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || skills.includes(v)) return;
    setSkills(p => [...p, v]);
    setSkillInput('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim())    return setError('Job title is required.');
    if (!skills.length)   return setError('Add at least one required skill.');
    setError('');
    setSaving(true);
    try {
      await createJob({ title, requiredSkills: skills, minYearsExperience: minExp, description });
      setTitle(''); setSkills([]); setDescription(''); setMinExp(2); setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create job.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this job and all its screenings?')) return;
    await deleteJob(id);
    await load();
    if (selectedJobId === id) onSelectJob(null);
  };

  return (
    <div className="jl-wrap">
      <div className="jl-header">
        <h2 className="jl-title">Job openings</h2>
        <button className="jl-new-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New job'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form className="jl-form" onSubmit={handleCreate} noValidate>
          <div className="jl-form-row">
            <div className="jl-form-group jl-grow">
              <label className="jl-label">Job title</label>
              <input className="jl-input" value={title}
                placeholder="e.g. Senior Java Developer"
                onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="jl-form-group jl-narrow">
              <label className="jl-label">Min. years</label>
              <input className="jl-input" type="number" min={0} max={30}
                value={minExp} onChange={e => setMinExp(Number(e.target.value))} />
            </div>
          </div>

          <div className="jl-form-group">
            <label className="jl-label">Required skills</label>
            <div className="jl-skill-row">
              <input className="jl-input" value={skillInput}
                placeholder="Type skill, press Enter"
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}} />
              <button type="button" className="jl-add-btn" onClick={addSkill}>+</button>
            </div>
            {skills.length > 0 && (
              <div className="jl-chips">
                {skills.map(s => (
                  <span key={s} className="jl-chip">
                    {s}
                    <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="jl-form-group">
            <label className="jl-label">Description (optional)</label>
            <textarea className="jl-textarea" rows={2} value={description}
              placeholder="Brief description of the role"
              onChange={e => setDescription(e.target.value)} />
          </div>

          {error && <div className="jl-error">{error}</div>}

          <button type="submit" className="jl-submit-btn" disabled={saving}>
            {saving ? 'Creating…' : 'Create job opening →'}
          </button>
        </form>
      )}

      {/* Job list */}
      {loading ? (
        <div className="jl-empty">Loading…</div>
      ) : jobs.length === 0 ? (
        <div className="jl-empty">No job openings yet. Create one above.</div>
      ) : (
        <div className="jl-list">
          {jobs.map(job => (
            <div
              key={job.id}
              className={`jl-item ${selectedJobId === job.id ? 'jl-item--active' : ''}`}
              onClick={() => onSelectJob(job)}
            >
              <div className="jl-item-left">
                <div className="jl-item-dot" />
                <div>
                  <div className="jl-item-title">{job.title}</div>
                  <div className="jl-item-meta">
                    {job.requiredSkills?.join(', ')} · {job.minYearsExperience}+ yrs
                  </div>
                </div>
              </div>
              <div className="jl-item-right">
                <span className={`jl-status jl-status--${job.status?.toLowerCase()}`}>
                  {job.status}
                </span>
                <button className="jl-del-btn"
                  onClick={e => handleDelete(job.id, e)}
                  title="Delete job">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}