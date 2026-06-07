import React, { useState, useEffect, useRef } from 'react';
import './OverlapTimeline.css';

export default function OverlapTimeline({ tasks, onEditClick }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const timelineScrollRef = useRef(null);

  // REACT DEV CONCEPT: Derived State vs Native State
  // Notice we don't use useState() for activeTasks or overlap calculations! 
  // Because they can be mathematically derived purely from the 'tasks' prop, 
  // throwing them into state would just create bugs and out-of-sync data.
  const activeTasks = tasks.filter(t => !t.isCompleted);

  // Generate 7 days of the week containing selectedDate
  function getWeekDays(date) {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day); // Sunday
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      week.push(d);
    }
    return week;
  };

  function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    const grid = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      grid.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      grid.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return grid;
  };

  function hasTasksOnDay(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    
    return activeTasks.some(t => {
      const tStart = new Date(t.startDate || t.createdAt);
      const tEnd = new Date(t.deadline);
      return tStart <= end && tEnd >= start;
    });
  };

  function getSelectedMonthName() {
    return viewDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  };

  function handlePrevMonth() {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  function handleNextMonth() {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Sync viewDate when selectedDate is updated
  useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDate]);

  // Gestures for swipe / scroll
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  function handleTouchEnd(e) {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          handlePrevMonth();
        } else {
          handleNextMonth();
        }
      }
    } else {
      if (Math.abs(diffY) > 40) {
        if (diffY > 0) {
          setIsExpanded(false);
        } else {
          setIsExpanded(true);
        }
      }
    }
  };

  function handleWheel(e) {
    if (e.deltaY > 15) {
      setIsExpanded(false);
    } else if (e.deltaY < -15) {
      setIsExpanded(true);
    }
  };

  // Compare two date strings by calendar day
  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Filter tasks that span into the selected date
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const dayTasks = activeTasks.filter(t => {
    const tStart = new Date(t.startDate || t.createdAt);
    const tEnd = new Date(t.deadline);
    return tStart <= endOfDay && tEnd >= startOfDay;
  });

  // Calculate overlaps specifically on the selected day
  const overlaps = {};
  dayTasks.forEach(a => {
    const startA = Math.max(startOfDay.getTime(), new Date(a.startDate || a.createdAt).getTime());
    const endA = Math.min(endOfDay.getTime(), new Date(a.deadline).getTime());

    dayTasks.forEach(b => {
      if (a._id === b._id) return;
      const startB = Math.max(startOfDay.getTime(), new Date(b.startDate || b.createdAt).getTime());
      const endB = Math.min(endOfDay.getTime(), new Date(b.deadline).getTime());

      if (startA < endB && startB < endA) {
        if (!overlaps[a._id]) {
          overlaps[a._id] = [];
        }
        overlaps[a._id].push(b.title);
      }
    });
  });

  // Centering horizontal scroll to the active hour when selectedDate changes
  useEffect(() => {
    if (timelineScrollRef.current) {
      const containerWidth = timelineScrollRef.current.clientWidth;
      const timelineTotalWidth = 840; // width of the inner timeline-grid-scroll
      const hourWidth = timelineTotalWidth / 24;

      let targetHour = 8; // default to 8 AM view
      if (isSameDay(selectedDate, new Date())) {
        targetHour = new Date().getHours();
      } else if (dayTasks.length > 0) {
        // Scroll to the start of the earliest task on this day
        const earliestTask = dayTasks.reduce((earliest, current) => {
          const curStart = new Date(current.startDate || current.createdAt).getHours();
          return curStart < earliest ? curStart : earliest;
        }, 24);
        if (earliestTask < 24) targetHour = earliestTask;
      }

      const scrollPos = targetHour * hourWidth - containerWidth / 2 + hourWidth / 2;
      timelineScrollRef.current.scrollLeft = Math.max(0, scrollPos);
    }
  }, [selectedDate, dayTasks.length]);

  // Format functions
  function formatTimeStr(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getDayDigit = (date) => date.getDate();
  const getDayName = (date) => date.toLocaleDateString([], { weekday: 'short' });

  // Generate vertical hours timeline grid
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate current time line positioning
  const showCurrentTimeLine = isSameDay(selectedDate, new Date());
  const now = new Date();
  const currentHourPercent = ((now.getHours() + now.getMinutes() / 60) / 24) * 100;

  return (
    <div className="calendar-timeline-root" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      
      {/* Month & Calendar Days Selector */}
      <div 
        className="calendar-header-section"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="calendar-month-row">
          <span className="calendar-month-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isExpanded && (
              <button className="month-nav-btn" onClick={handlePrevMonth} title="Previous Month">⟨</button>
            )}
            {getSelectedMonthName()}
            {isExpanded && (
              <button className="month-nav-btn" onClick={handleNextMonth} title="Next Month">⟩</button>
            )}
          </span>
          <span className="calendar-month-dropdown" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
            {isExpanded ? 'Collapse' : 'Expand'} <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px', verticalAlign: 'middle', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>

        {!isExpanded ? (
          <div className="calendar-days-slider">
            {getWeekDays(selectedDate).map((date, idx) => {
              const active = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const hasTasks = hasTasksOnDay(date);
              return (
                <button
                  key={idx}
                  className={`calendar-day-pill ${active ? 'active-pill' : ''} ${isToday ? 'is-today-pill' : ''}`}
                  onClick={() => setSelectedDate(date)}
                  style={{ position: 'relative' }}
                >
                  <span className="day-number">{getDayDigit(date)}</span>
                  <span className="day-name">{getDayName(date)}</span>
                  {hasTasks && !active && (
                    <span 
                      style={{ 
                        width: '4px', 
                        height: '4px', 
                        backgroundColor: isToday ? 'var(--color-accent)' : 'var(--text-secondary)', 
                        borderRadius: '50%', 
                        position: 'absolute', 
                        bottom: '3px' 
                      }} 
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="monthly-calendar-container" style={{ animation: 'scaleIn 0.2s ease-out' }}>
            <div className="weekday-headers">
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>
            <div className="month-grid">
              {getMonthDays(viewDate).map((day, idx) => {
                const active = isSameDay(day.date, selectedDate);
                const isToday = isSameDay(day.date, new Date());
                const hasTasks = hasTasksOnDay(day.date);
                
                return (
                  <button
                    key={idx}
                    className={`month-day-cell ${active ? 'active-cell' : ''} ${isToday ? 'is-today-cell' : ''} ${day.isCurrentMonth ? '' : 'other-month'}`}
                    onClick={() => {
                      setSelectedDate(day.date);
                    }}
                  >
                    <span className="day-number">{day.date.getDate()}</span>
                    {hasTasks && <span className="calendar-dot" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="timeline-scrollable-content" onWheel={handleWheel}>
        {/* Timeline Section Title */}
        <div className="timeline-day-header">
          <h3>Day</h3>
          {dayTasks.length > 0 && Object.keys(overlaps).length > 0 && (
            <span className="overlap-pill-badge">
              ⚠️ {Object.keys(overlaps).length} Overlaps
            </span>
          )}
        </div>

        {/* Horizontal Gantt Scrollable Sheet */}
        <div className="timeline-scroll-wrapper">
          
          {/* Row Labels (Task 1, Task 2, etc.) */}
          <div className="timeline-y-labels">
            <div className="time-corner-label">Time</div>
            {dayTasks.map((t, index) => (
              <div key={t._id} className="y-task-label" onClick={() => onEditClick(t)}>
                Task {index + 1}
              </div>
            ))}
          </div>

          {/* Grid Scroll Area */}
          <div 
            className="timeline-grid-container" 
            ref={timelineScrollRef}
          >
            {/* Scrollable track content */}
            <div className="timeline-grid-scroll">
              
              {/* Time Axis Headers */}
              <div className="timeline-x-axis">
                {hours.map(hour => {
                  const label = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
                  // Show labels every 2 hours to avoid clutter
                  const showLabel = hour % 2 === 0;
                  return (
                    <div key={hour} className="hour-axis-column">
                      <span className="hour-tick-label">{showLabel ? label : ''}</span>
                      <div className="hour-vertical-gridline" />
                    </div>
                  );
                })}
              </div>

              {/* Rows & Bars */}
              <div className="timeline-grid-rows">
                {/* Draw Vertical Current Time Marker Line */}
                {showCurrentTimeLine && (
                  <div 
                    className="current-time-marker-line" 
                    style={{ left: `${currentHourPercent}%` }}
                  >
                    <span className="marker-pulse-node" />
                  </div>
                )}

                {/* Draw empty space if no tasks scheduled */}
                {dayTasks.length === 0 ? (
                  <div className="empty-day-banner">
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>🛋️</div>
                    No tasks scheduled for this day
                  </div>
                ) : (
                  dayTasks.map((t) => {
                    const tStart = new Date(t.startDate || t.createdAt);
                    const tEnd = new Date(t.deadline);

                    // Calculate start/end hours relative to selected date boundaries
                    const startHour = Math.max(0, (tStart.getTime() - startOfDay.getTime()) / 3600000);
                    const endHour = Math.min(24, (tEnd.getTime() - startOfDay.getTime()) / 3600000);

                    const left = (startHour / 24) * 100;
                    const width = ((endHour - startHour) / 24) * 100;

                    const hasConflict = !!overlaps[t._id];

                    return (
                      <div key={t._id} className="timeline-grid-row">
                        <div 
                          className={`gantt-task-pill urgency-${t.severity} ${hasConflict ? 'gantt-pill-conflict' : ''}`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(8, width)}%` // min width to ensure readability
                          }}
                          onClick={() => onEditClick(t)}
                        >
                          <div className="gantt-pill-glow" />
                          <div className="gantt-pill-content">
                            <span className="gantt-pill-title">{t.title}</span>
                            <span className="gantt-pill-time">
                              {formatTimeStr(t.startDate || t.createdAt)} - {formatTimeStr(t.deadline)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Conflicts Alert Footer */}
        {dayTasks.length > 0 && Object.keys(overlaps).length > 0 && (
          <div className="timeline-conflict-list-footer">
            <span className="footer-conflict-heading">Schedule Overlaps Detected:</span>
            <div className="conflict-items-scroll">
              {Object.entries(overlaps).map(([id, titles]) => (
                <div key={id} className="conflict-badge-item">
                  <strong>{dayTasks.find(t => t._id === id)?.title}</strong> overlaps with: {titles.join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

