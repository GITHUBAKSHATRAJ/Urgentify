import React from 'react';
import { computeUrgency, formatTimeLeft } from '../../utils/urgency';
import './TaskCard.css';

// REACT DEV CONCEPT: Presentational Component (Dumb Component)
// TaskCard holds almost no state and does no API fetching. It simply
// receives props from Dashboard and renders the UI.
export default function TaskCard({ task, onToggleComplete, onDelete, onAckAlarm, onEditClick, theme }) {
  const { title, description, deadline, severity, isCompleted, createdAt, _id, customNotificationValue, customNotificationUnit, alarmTriggered, alarmAcknowledged } = task;
  const { className, label } = computeUrgency(deadline, severity);
  const timeLeftStr = formatTimeLeft(deadline);

  // Format creation date
  const formattedCreated = new Date(createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format deadline date
  const formattedDeadline = new Date(deadline).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate percentage of remaining time relative to total duration
  function calculateRemainingPercentage() {
    const totalDuration = new Date(deadline) - new Date(createdAt);
    const timeRemaining = new Date(deadline) - new Date();

    if (totalDuration <= 0) return 0;
    const pct = (timeRemaining / totalDuration) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  };

  const remainingPct = calculateRemainingPercentage();

  // Get battery color based on remaining percentage
  function getProgressBarColor(pct) {
    if (pct > 50) return 'var(--progress-safe)';
    if (pct > 20) return 'var(--progress-warning)';
    return 'var(--progress-danger)';
  };

  const progressBarColor = getProgressBarColor(remainingPct);

  // Handle card body clicks (ignore checkbox & actions)
  function handleCardClick(e) {
    if (
      e.target.classList.contains('task-checkbox') ||
      e.target.classList.contains('btn-delete') ||
      e.target.closest('.checkbox-container') ||
      e.target.closest('.task-actions') ||
      e.target.closest('.btn-delete')
    ) {
      return;
    }
    onEditClick(task);
  };

  function getCountdownStyle() {
    const isOverdue = timeLeftStr === 'Overdue' || (new Date(deadline) - new Date() <= 0);
    if (isOverdue) {
      return {
        backgroundColor: 'var(--progress-danger)',
        color: '#ffffff',
        border: 'none'
      };
    }
    
    if (remainingPct <= 50 && remainingPct > 20) {
      return {
        backgroundColor: 'var(--progress-warning)',
        color: 'var(--countdown-warning-text)',
        border: 'none'
      };
    }
    
    return {
      backgroundColor: progressBarColor,
      color: '#ffffff',
      border: 'none'
    };
  };

  return (
    <div 
      className={`task-card clickable-card ${className} ${isCompleted ? 'completed-task' : ''}`}
      onClick={handleCardClick}
    >
      <div className="checkbox-container">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={isCompleted}
          onChange={() => onToggleComplete(_id, !isCompleted)}
        />
      </div>

      <div className="task-details">
        {/* Header row: Title on left, countdown pill on right */}
        <div className="task-header-row">
          <div className="task-title" title={title}>{title}</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mobile Alarm Indicator */}
            {!isCompleted && customNotificationUnit && customNotificationUnit !== 'none' && (
              <div 
                className={`mobile-alarm-indicator ${alarmTriggered && !alarmAcknowledged ? 'pulse-alarm-glow' : ''}`} 
                title={
                  alarmTriggered && !alarmAcknowledged 
                    ? "Alarm has triggered! Click to acknowledge" 
                    : `Mobile physical alarm is set for ${customNotificationValue} ${customNotificationUnit} before deadline`
                }
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  color: alarmTriggered && !alarmAcknowledged ? '#ef4444' : '#6366f1', 
                  opacity: 0.9, 
                  cursor: alarmTriggered && !alarmAcknowledged ? 'pointer' : 'help' 
                }}
                onClick={(e) => {
                  if (alarmTriggered && !alarmAcknowledged) {
                    e.stopPropagation();
                    onAckAlarm(_id);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  <path d="M4 2C2.8 3.7 2 5.7 2 8" />
                  <path d="M22 8c0-2.3-.8-4.3-2-6" />
                </svg>
              </div>
            )}

            {!isCompleted && (
              <div 
                className="task-countdown" 
                title={label}
                style={getCountdownStyle()}
              >
                {timeLeftStr}
              </div>
            )}
          </div>
        </div>

        {description && <div className="task-desc">{description}</div>}

        {/* Timeline-style remaining time progress bar with Start/End labels */}
        {!isCompleted && (
          <div className="task-timeline-wrapper">
            <div className="task-battery-container" title={`${remainingPct}% time remaining`}>
              <div 
                className="task-battery-bar" 
                style={{ 
                  width: `${remainingPct}%`, 
                  backgroundColor: progressBarColor 
                }}
              />
            </div>
            <div className="task-timeline-labels">
              <span>Created: {formattedCreated}</span>
              <span className="task-due-label">Due: {formattedDeadline}</span>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="task-completed-label">
            Completed
          </div>
        )}
      </div>

      <div className="task-actions">
        {/* REACT DEV CONCEPT: Inverse Data Flow (Child to Parent) */}
        {/* Notice how the TaskCard doesn't delete the task from the database itself? */}
        {/* It "bubbles" the event up by calling the onDelete() prop, letting the Smart Container (Dashboard) handle the logic! */}
        <button
          className="btn-delete"
          title="Delete Task"
          onClick={() => {
            if (window.confirm('Delete this task?')) {
              onDelete(_id);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    </div>
  );
};

