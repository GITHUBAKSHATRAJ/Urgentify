import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { computeUrgency } from '../../utils/urgency';
import styles from './OverlapTimelineStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// REACT DEV CONCEPT: Derived State
// This component avoids redundant `useState` for its grid logic. 
// The exact timeline blocks are mathematically "derived" directly from the `tasks` prop on every render.
// This guarantees the UI never falls out of sync with the data.
export default function OverlapTimeline({ tasks, onEditClick, theme }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const timelineScrollRef = useRef(null);

  const isDark = theme === 'dark';
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

  // Generate 42 days for the monthly view grid
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

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
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

  // Touch handlers for swipes
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  function handleTouchStart(e) {
    touchStartX.current = e.nativeEvent.locationX;
    touchStartY.current = e.nativeEvent.locationY;
  };

  function handleTouchEnd(e) {
    const diffX = e.nativeEvent.locationX - touchStartX.current;
    const diffY = e.nativeEvent.locationY - touchStartY.current;

    // Detect horizontal vs vertical swipes
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 40) {
        if (diffX > 0) {
          handlePrevMonth(); // swipe right -> prev month
        } else {
          handleNextMonth(); // swipe left -> next month
        }
      }
    } else {
      if (Math.abs(diffY) > 40) {
        if (diffY > 0) {
          setIsExpanded(false); // swipe down -> collapse
        } else {
          setIsExpanded(true); // swipe up -> expand
        }
      }
    }
  };

  // Task Filter and Overlap calculation
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const dayTasks = activeTasks.filter(t => {
    const tStart = new Date(t.startDate || t.createdAt);
    const tEnd = new Date(t.deadline);
    return tStart <= endOfDay && tEnd >= startOfDay;
  });

  const overlaps = {};
  dayTasks.forEach(a => {
    const startA = Math.max(startOfDay.getTime(), new Date(a.startDate || a.createdAt).getTime());
    const endA = Math.min(endOfDay.getTime(), new Date(a.deadline).getTime());

    dayTasks.forEach(b => {
      if (a._id === b._id) return;
      const startB = Math.max(startOfDay.getTime(), new Date(b.startDate || b.createdAt).getTime());
      const endB = Math.min(endOfDay.getTime(), new Date(b.deadline).getTime());

      if (startA < endB && startB < endA) {
        if (!overlaps[a._id]) overlaps[a._id] = [];
        overlaps[a._id].push(b.title);
      }
    });
  });

  // Gantt dimensions
  const timelineTotalWidth = 840;
  const hourWidth = timelineTotalWidth / 24;
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Auto-scroll timeline to target hour on mount / selected date change
  useEffect(() => {
    if (timelineScrollRef.current) {
      let targetHour = 8;
      if (isSameDay(selectedDate, new Date())) {
        targetHour = new Date().getHours();
      } else if (dayTasks.length > 0) {
        const earliestTask = dayTasks.reduce((earliest, current) => {
          const curStart = new Date(current.startDate || current.createdAt).getHours();
          return curStart < earliest ? curStart : earliest;
        }, 24);
        if (earliestTask < 24) targetHour = earliestTask;
      }
      const scrollPos = targetHour * hourWidth - SCREEN_WIDTH / 2 + hourWidth / 2;
      timelineScrollRef.current.scrollTo({ x: Math.max(0, scrollPos), animated: true });
    }
  }, [selectedDate, dayTasks.length]);

  function formatTimeStr(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const showCurrentTimeLine = isSameDay(selectedDate, new Date());
  const now = new Date();
  const currentHourPercent = ((now.getHours() + now.getMinutes() / 60) / 24) * 100;

  return (
    <View style={styles.container}>
      {/* Calendar Area */}
      <View
        style={[styles.calendarHeader, isDark ? styles.borderDark : styles.borderLight]}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.monthRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isExpanded && (
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>⟨</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.monthTitle, isDark ? styles.textLight : styles.textDark]}>
              {getSelectedMonthName()}
            </Text>
            {isExpanded && (
              <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>⟩</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.expandText}>{isExpanded ? 'Collapse ▴' : 'Expand ▾'}</Text>
          </TouchableOpacity>
        </View>

        {!isExpanded ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekSlider}>
            {getWeekDays(selectedDate).map((date, idx) => {
              const active = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const hasTasks = hasTasksOnDay(date);
              
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayPill,
                    active ? styles.dayPillActive : (isToday ? styles.dayPillToday : (isDark ? styles.pillDark : styles.pillLight))
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.dayNum, active ? styles.textWhite : (isDark ? styles.textLight : styles.textDark)]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.dayName, active ? styles.textWhite : { color: '#9ca3af' }]}>
                    {date.toLocaleDateString([], { weekday: 'short' })}
                  </Text>
                  {hasTasks && !active && (
                    <View style={[styles.dot, { backgroundColor: isToday ? '#6366f1' : '#9ca3af' }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.monthlyContainer}>
            <View style={styles.weekdayLabels}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(label => (
                <Text key={label} style={styles.weekdayLabel}>{label}</Text>
              ))}
            </View>
            <View style={styles.monthGrid}>
              {getMonthDays(viewDate).map((day, idx) => {
                const active = isSameDay(day.date, selectedDate);
                const isToday = isSameDay(day.date, new Date());
                const hasTasks = hasTasksOnDay(day.date);
                
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.monthDayCell,
                      active ? styles.activeCell : null,
                      isToday && !active ? styles.todayCell : null
                    ]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <Text style={[
                      styles.monthDayNum,
                      active ? styles.textWhite : (day.isCurrentMonth ? (isDark ? styles.textLight : styles.textDark) : styles.textMuted)
                    ]}>
                      {day.date.getDate()}
                    </Text>
                    {hasTasks && (
                      <View style={[styles.cellDot, active ? { backgroundColor: '#ffffff' } : null]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Timeline Section */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} style={styles.scrollContent}>
        <View style={styles.timelineHeader}>
          <Text style={[styles.sectionTitle, isDark ? styles.textLight : styles.textDark]}>Timeline Grid</Text>
          {dayTasks.length > 0 && Object.keys(overlaps).length > 0 && (
            <View style={styles.overlapAlertBadge}>
              <Text style={styles.overlapAlertText}>⚠️ {Object.keys(overlaps).length} Overlaps</Text>
            </View>
          )}
        </View>

        {/* Gantt Sheet */}
        <View style={[styles.ganttContainer, isDark ? styles.cardDark : styles.cardLight]}>
          {/* Row Labels column */}
          <View style={[styles.yLabelsColumn, isDark ? styles.yBorderDark : styles.yBorderLight]}>
            <View style={[styles.cornerCell, isDark ? styles.bottomBorderDark : styles.bottomBorderLight]}>
              <Text style={styles.cornerText}>Task</Text>
            </View>
            {dayTasks.map((t, index) => (
              <TouchableOpacity key={t._id} style={styles.labelCell} onPress={() => onEditClick(t)}>
                <Text style={styles.labelText} numberOfLines={1}>Task {index + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Horizontal scroll grid area */}
          <ScrollView
            horizontal
            ref={timelineScrollRef}
            showsHorizontalScrollIndicator={false}
            style={styles.gridScroll}
          >
            <View style={{ width: timelineTotalWidth }}>
              {/* X Axis Timeline Headers */}
              <View style={[styles.xAxisRow, isDark ? styles.bottomBorderDark : styles.bottomBorderLight]}>
                {hours.map(hour => {
                  const label = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
                  return (
                    <View key={hour} style={[styles.hourHeaderCell, { width: hourWidth }]}>
                      <Text style={styles.hourText}>{hour % 2 === 0 ? label : ''}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Grid Rows & task bars */}
              <View style={styles.gridContent}>
                {/* Vertical grid lines */}
                {hours.map(hour => (
                  <View
                    key={hour}
                    style={[
                      styles.verticalLine,
                      { left: hour * hourWidth, width: 1, height: '100%' },
                      isDark ? { backgroundColor: 'rgba(255,255,255,0.04)' } : { backgroundColor: 'rgba(0,0,0,0.04)' }
                    ]}
                  />
                ))}

                {/* Current Time marker line */}
                {showCurrentTimeLine && (
                  <View style={[styles.currentTimeMarker, { left: `${currentHourPercent}%` }]} />
                )}

                {dayTasks.length === 0 ? (
                  <View style={styles.emptyDayContainer}>
                    <Text style={styles.emptyDayText}>🛋️ No tasks scheduled for this day</Text>
                  </View>
                ) : (
                  dayTasks.map((t) => {
                    const tStart = new Date(t.startDate || t.createdAt);
                    const tEnd = new Date(t.deadline);
                    const startHour = Math.max(0, (tStart.getTime() - startOfDay.getTime()) / 3600000);
                    const endHour = Math.min(24, (tEnd.getTime() - startOfDay.getTime()) / 3600000);

                    const left = (startHour / 24) * 100;
                    const width = ((endHour - startHour) / 24) * 100;
                    const hasConflict = !!overlaps[t._id];

                    let pillBg = '#10b981'; // green
                    if (t.severity === 'mid') pillBg = '#f97316'; // orange
                    if (t.severity === 'high') pillBg = '#ef4444'; // red

                    return (
                      <View key={t._id} style={styles.gridRow}>
                        <TouchableOpacity
                          style={[
                            styles.ganttPill,
                            { left: `${left}%`, width: `${Math.max(10, width)}%`, backgroundColor: pillBg },
                            hasConflict ? styles.ganttPillConflict : null
                          ]}
                          onPress={() => onEditClick(t)}
                        >
                          <Text style={styles.ganttPillTitle} numberOfLines={1}>{t.title}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Schedule Overlaps Detected Footer */}
        {dayTasks.length > 0 && Object.keys(overlaps).length > 0 && (
          <View style={styles.overlapFooter}>
            <Text style={styles.overlapFooterHeading}>Schedule Overlaps Detected:</Text>
            {Object.entries(overlaps).map(([id, titles]) => (
              <Text key={id} style={styles.overlapFooterItem}>
                • <Text style={styles.boldText}>{dayTasks.find(t => t._id === id)?.title}</Text> overlaps with: {titles.join(', ')}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

