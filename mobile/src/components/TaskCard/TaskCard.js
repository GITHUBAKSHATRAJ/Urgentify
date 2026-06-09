import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Trash2, Bell } from 'lucide-react-native';
import { computeUrgency, formatTimeLeft } from '../../utils/urgency';
import styles from './TaskCardStyles';

// REACT DEV CONCEPT: Presentational Component & Inverse Data Flow
// This component has NO complex state. It only renders props it receives.
// When an action occurs (like click or delete), it "bubbles" the event up via `onDelete` (Inverse Data Flow)
// rather than deleting the task from the database itself.
export default function TaskCard({ task, onToggleComplete, onDelete, onEditClick, theme }) {
  const { title, description, deadline, severity, isCompleted, createdAt, _id, customNotificationValue, customNotificationUnit } = task;
  const { bgColor, textColor, label } = computeUrgency(deadline, severity);
  const timeLeftStr = formatTimeLeft(deadline);

  const isDark = theme === 'dark';

  // Format dates helper
  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  function remainingPercent() {
    const total = new Date(deadline) - new Date(createdAt);
    const remaining = new Date(deadline) - new Date();
    if (total <= 0) return 0;
    const pct = (remaining / total) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  };

  const pct = remainingPercent();

  function getProgressBarColor() {
    if (pct > 50) return '#10b981'; // green
    if (pct > 20) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        isCompleted ? styles.completedCard : null
      ]}
      onPress={() => onEditClick(task)}
      activeOpacity={0.7}
    >
      {/* Left Urgency Accent Stripe */}
      <View style={[styles.stripe, { backgroundColor: isCompleted ? '#4b5563' : bgColor }]} />

      {/* Main Details Wrapper */}
      <View style={styles.cardBody}>
        {/* Checkbox & Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.checkbox, isCompleted ? styles.checkboxChecked : styles.checkboxUnchecked]}
            onPress={() => onToggleComplete(_id, !isCompleted)}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              isDark ? styles.textLight : styles.textDark,
              isCompleted ? styles.lineThrough : null
            ]}
          >
            {title}
          </Text>
          
          {/* Bell Alarm Icon */}
          {!isCompleted && customNotificationUnit && customNotificationUnit !== 'none' && (
            <Bell 
              size={11} 
              color={task.alarmTriggered && !task.alarmAcknowledged ? "#ef4444" : "#6366f1"} 
              style={{ marginRight: 6 }} 
            />
          )}
          
          {/* Urgency Badge (Hide when completed) */}
          {!isCompleted && (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
              <Text style={[styles.badgeText, { color: textColor }]}>{timeLeftStr}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {description ? (
          <Text
            numberOfLines={2}
            style={[styles.desc, isCompleted ? styles.lineThrough : null]}
          >
            {description}
          </Text>
        ) : null}

        {/* Battery Style Progress Bar */}
        {!isCompleted && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBar, { width: `${pct}%`, backgroundColor: getProgressBarColor() }]} />
            </View>
            <View style={styles.timeLabelsRow}>
              <Text style={styles.dateLabel}>Created: {formatDate(createdAt)}</Text>
              <Text style={styles.dateLabel}>Due: {formatDate(deadline)}</Text>
            </View>
          </View>
        )}

        {isCompleted && (
          <Text style={styles.completedLabel}>✓ Completed</Text>
        )}
      </View>

      {/* Delete Action button */}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(_id)}>
        <Trash2 size={14} color="#6b7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

