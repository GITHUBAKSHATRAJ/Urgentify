export const computeUrgency = (deadlineStr, severity) => {
  const timeLeftMs = new Date(deadlineStr) - new Date();
  const hoursLeft = timeLeftMs / (1000 * 60 * 60);

  if (hoursLeft <= 0) {
    return {
      className: 'urgency-overdue',
      label: 'Overdue',
      hoursLeft
    };
  }

  // Critical State (less than 6 hours)
  if (hoursLeft <= 6) {
    return {
      className: 'urgency-critical',
      label: 'Critical State',
      hoursLeft
    };
  }

  // High severity automatically overrides/upgrades warnings:
  // Cascades to Red (Critical) at 12 hours remaining.
  if (hoursLeft <= 12 && severity === 'high') {
    return {
      className: 'urgency-critical',
      label: 'Critical State (High Severity)',
      hoursLeft
    };
  }

  // High severity skips Green and is Orange immediately, or any task under 24 hours.
  if (hoursLeft <= 24 || severity === 'high') {
    return {
      className: 'urgency-high',
      label: 'Urgent State',
      hoursLeft
    };
  }

  // Warning State (24 to 48 hours)
  if (hoursLeft <= 48) {
    return {
      className: 'urgency-warning',
      label: 'Warning State',
      hoursLeft
    };
  }

  // Safe State (more than 48 hours)
  return {
    className: 'urgency-safe',
    label: 'Safe State',
    hoursLeft
  };
};

export const formatTimeLeft = (deadlineStr) => {
  const timeLeftMs = new Date(deadlineStr) - new Date();
  const hoursLeft = timeLeftMs / (1000 * 60 * 60);

  if (hoursLeft <= 0) {
    const overdueMs = Math.abs(timeLeftMs);
    const totalHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const minutes = Math.floor((overdueMs / (1000 * 60)) % 60);

    if (totalHours === 0) {
      return `${minutes}m overdue`;
    }
    if (totalHours < 24) {
      return `${totalHours}h ${minutes}m overdue`;
    }
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    return `${days}d ${remainingHours}h overdue`;
  }

  const hours = Math.floor(hoursLeft);
  const minutes = Math.floor((hoursLeft - hours) * 60);

  if (hours === 0) {
    return `${minutes}m remaining`;
  }
  if (hours < 24) {
    return `${hours}h ${minutes}m remaining`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h remaining`;
};
