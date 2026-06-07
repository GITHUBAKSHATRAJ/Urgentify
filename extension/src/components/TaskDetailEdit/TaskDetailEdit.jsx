import React, { useState } from 'react';
import './TaskDetailEdit.css';

export default function TaskDetailEdit({ task, onSave, onBack }) {
  function formatForDatetimeLocal(isoString) {
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:MM
  };

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [startDate, setStartDate] = useState(formatForDatetimeLocal(task.startDate || task.createdAt));
  const [deadline, setDeadline] = useState(formatForDatetimeLocal(task.deadline));
  const [severity, setSeverity] = useState(task.severity || 'low');
  const [isCompleted, setIsCompleted] = useState(task.isCompleted || false);
  const [error, setError] = useState('');

  const [hasCustomAlert, setHasCustomAlert] = useState(task.customNotificationUnit && task.customNotificationUnit !== 'none');
  const [customValue, setCustomValue] = useState(task.customNotificationValue || 1);
  const [customUnit, setCustomUnit] = useState(task.customNotificationUnit && task.customNotificationUnit !== 'none' ? task.customNotificationUnit : 'hours');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (title.length > 100) {
      setError('Title cannot exceed 100 characters');
      return;
    }
    if (description.length > 500) {
      setError('Description cannot exceed 500 characters');
      return;
    }
    if (!deadline) {
      setError('Deadline is required');
      return;
    }
    if (new Date(startDate) > new Date(deadline)) {
      setError('Start date cannot be after the deadline');
      return;
    }
    if (hasCustomAlert) {
      if (!customValue || Number(customValue) <= 0) {
        setError('Custom notification warning time must be greater than 0');
        return;
      }
    }

    onSave(task._id, {
      title: title.trim(),
      description: description.trim(),
      startDate: new Date(startDate).toISOString(),
      deadline: new Date(deadline).toISOString(),
      severity,
      isCompleted,
      customNotificationValue: hasCustomAlert ? Number(customValue) : null,
      customNotificationUnit: hasCustomAlert ? customUnit : 'none'
    });
  };

  const formattedCreated = new Date(task.createdAt).toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="app-container edit-screen-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-back" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
          </button>
          <h2>Edit Task</h2>
        </div>
      </div>

      <div className="edit-scroll-container">
        {error && <div className="error-banner">{error}</div>}

        <div className="metadata-banner">
          Created: <span>{formattedCreated}</span>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
          <div className="form-group">
            <label htmlFor="edit-title">Title *</label>
            <input
              type="text"
              id="edit-title"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-desc">Description (Optional)</label>
            <textarea
              id="edit-desc"
              className="input-field"
              rows={4}
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-startdate">Start Date & Time *</label>
            <input
              type="datetime-local"
              id="edit-startdate"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-deadline">Deadline *</label>
            <input
              type="datetime-local"
              id="edit-deadline"
              className="input-field"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Severity Level</label>
            <div className="severity-selector">
              <button
                type="button"
                className={`severity-btn ${severity === 'low' ? 'active-low' : ''}`}
                onClick={() => setSeverity('low')}
              >
                Low
              </button>
              <button
                type="button"
                className={`severity-btn ${severity === 'mid' ? 'active-mid' : ''}`}
                onClick={() => setSeverity('mid')}
              >
                Mid
              </button>
              <button
                type="button"
                className={`severity-btn ${severity === 'high' ? 'active-high' : ''}`}
                onClick={() => setSeverity('high')}
              >
                High
              </button>
            </div>
          </div>

          <div className="form-group custom-alert-section">
            <div className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 8px 0' }}>
              <input
                type="checkbox"
                id="edit-custom-alert"
                className="task-checkbox"
                checked={hasCustomAlert}
                onChange={(e) => setHasCustomAlert(e.target.checked)}
              />
              <label htmlFor="edit-custom-alert" style={{ margin: 0, cursor: 'pointer', fontSize: '12px' }}>
                Set custom deadline warning alert
              </label>
            </div>

            {hasCustomAlert && (
              <div className="custom-alert-inputs" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="number"
                  className="input-field"
                  value={customValue}
                  onChange={(e) => setCustomValue(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  style={{ flex: 1, padding: '8px' }}
                />
                <select
                  className="filter-select"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
            <input
              type="checkbox"
              id="edit-completed"
              className="task-checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor="edit-completed" style={{ margin: 0, cursor: 'pointer', fontSize: '13px' }}>
              Mark as Completed
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

