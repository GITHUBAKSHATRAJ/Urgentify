import React, { useState } from 'react';
import './TaskForm.css';

export default function TaskForm({ onSubmit, onClose }) {
  function getDefaultDeadline() {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default to tomorrow
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:MM
  };

  function getDefaultStartDate() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  // REACT DEV CONCEPT: Controlled Components
  // These inputs are "controlled" because their values are strictly driven
  // by React state, rather than the DOM managing its own input value.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [severity, setSeverity] = useState('low');
  const [error, setError] = useState('');

  const [hasCustomAlert, setHasCustomAlert] = useState(false);
  const [customValue, setCustomValue] = useState(1);
  const [customUnit, setCustomUnit] = useState('hours');

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

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      startDate: new Date(startDate).toISOString(),
      deadline: new Date(deadline).toISOString(),
      severity,
      customNotificationValue: hasCustomAlert ? Number(customValue) : null,
      customNotificationUnit: hasCustomAlert ? customUnit : 'none'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              type="text"
              id="task-title"
              className="input-field"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description (Optional)</label>
            <textarea
              id="task-desc"
              className="input-field"
              rows={3}
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-startdate">Start Date & Time *</label>
            <input
              type="datetime-local"
              id="task-startdate"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-deadline">Deadline *</label>
            <input
              type="datetime-local"
              id="task-deadline"
              className="input-field"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Severity Matrix</label>
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
            <div className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
              <input
                type="checkbox"
                id="task-custom-alert"
                className="task-checkbox"
                checked={hasCustomAlert}
                onChange={(e) => setHasCustomAlert(e.target.checked)}
              />
              <label htmlFor="task-custom-alert" style={{ margin: 0, cursor: 'pointer', fontSize: '12px' }}>
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

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

