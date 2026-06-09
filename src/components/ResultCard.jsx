import React from 'react';
import './ResultCard.css';

const LABELS = {
  STRONG_FIT:   'Strong Fit',
  POSSIBLE_FIT: 'Possible Fit',
  NOT_FIT:      'Not a Fit',
};

const SCORE_COLOR = score =>
  score >= 75 ? '#22C97A' : score >= 45 ? '#F5A623' : '#FF5C5C';

export default function ResultCard({ result, fileName }) {
  if (!result) return null;

  const { classification, score, matchedSkills,
          missingSkills, yearsExperience, summary } = result;
  const color = SCORE_COLOR(score);
  const label = LABELS[classification] || classification;

  return (
    <div className={`result-card result-card--${classification.toLowerCase().replace('_','-')}`}
         style={{ '--accent-color': color }}>

      {/* Header */}
      <div className="rc-header">
        <div className="rc-header-left">
          <span className={`rc-badge rc-badge--${classification.toLowerCase().replace('_','-')}`}>
            {label}
          </span>
          {fileName && <span className="rc-filename">{fileName}</span>}
        </div>
        <div className="rc-score-wrap">
          <span className="rc-score" style={{ color }}>
            {score}
          </span>
          <span className="rc-score-max">/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="rc-bar-track">
        <div
          className="rc-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>

      {/* Summary */}
      <p className="rc-summary">{summary}</p>

      {/* Skills grid */}
      <div className="rc-skills-grid">
        <div>
          <p className="rc-skills-label">
            <span className="rc-dot rc-dot--green" />
            Matched skills
          </p>
          <div className="rc-chips">
            {matchedSkills?.length
              ? matchedSkills.map(s => (
                  <span key={s} className="rc-chip rc-chip--match">{s}</span>
                ))
              : <span className="rc-none">None</span>
            }
          </div>
        </div>
        <div>
          <p className="rc-skills-label">
            <span className="rc-dot rc-dot--red" />
            Missing skills
          </p>
          <div className="rc-chips">
            {missingSkills?.length
              ? missingSkills.map(s => (
                  <span key={s} className="rc-chip rc-chip--miss">{s}</span>
                ))
              : <span className="rc-none">None</span>
            }
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="rc-meta">
        <span className="rc-meta-item">
          <span className="rc-meta-icon">◷</span>
          {yearsExperience} year{yearsExperience !== 1 ? 's' : ''} experience detected
        </span>
      </div>

    </div>
  );
}