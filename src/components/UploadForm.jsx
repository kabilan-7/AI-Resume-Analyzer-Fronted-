import React, { useState, useRef } from 'react';
import './UploadForm.css';

export default function UploadForm({ onSubmit, loading }) {
  const [file, setFile]         = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills]     = useState([]);
  const [minExp, setMinExp]     = useState(3);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef();

  const handleFile = f => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf','docx','txt'].includes(ext)) {
      setError('Only PDF, DOCX, or TXT files are supported.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || skills.includes(v)) return;
    setSkills(prev => [...prev, v]);
    setSkillInput('');
  };

  const removeSkill = skill =>
    setSkills(prev => prev.filter(s => s !== skill));

  const handleSubmit = e => {
    e.preventDefault();
    if (!file)            return setError('Please upload a resume.');
    if (!jobTitle.trim()) return setError('Please enter a job title.');
    if (skills.length===0) return setError('Please add at least one skill.');
    setError('');
    onSubmit(file, jobTitle, skills, minExp);
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit} noValidate>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display:'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
        <div className="drop-icon">
          {file ? '✓' : '↑'}
        </div>
        {file ? (
          <div className="drop-info">
            <span className="drop-filename">{file.name}</span>
            <span className="drop-size">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <div className="drop-info">
            <span className="drop-title">Drop resume here</span>
            <span className="drop-sub">PDF, DOCX, TXT — max 10 MB</span>
          </div>
        )}
        {file && (
          <button
            type="button"
            className="drop-clear"
            onClick={e => { e.stopPropagation(); setFile(null); }}
          >×</button>
        )}
      </div>

      {/* Job title + experience row */}
      <div className="form-row">
        <div className="form-group form-group--grow">
          <label className="form-label">Job title</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Senior Java Developer"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />
        </div>
        <div className="form-group form-group--narrow">
          <label className="form-label">Min. years exp.</label>
          <input
            className="form-input"
            type="number"
            min={0}
            max={30}
            value={minExp}
            onChange={e => setMinExp(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="form-group">
        <label className="form-label">Required skills</label>
        <div className="skill-row">
          <input
            className="form-input"
            type="text"
            placeholder="Type a skill and press Enter"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); addSkill(); }}}
          />
          <button type="button" className="add-btn" onClick={addSkill}>+</button>
        </div>
        {skills.length > 0 && (
          <div className="chip-wrap">
            {skills.map(s => (
              <span key={s} className="chip">
                {s}
                <button type="button" onClick={() => removeSkill(s)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <button
        type="submit"
        className={`submit-btn ${loading ? 'loading' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Analysing resume…
          </>
        ) : (
          <>Screen resume →</>
        )}
      </button>

    </form>
  );
}