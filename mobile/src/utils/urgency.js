export const computeUrgency = (deadlineStr, severity) => {
  const timeLeftMs = new Date(deadlineStr) - new Date();
  const hoursLeft = timeLeftMs / (1000 * 60 * 60);

  if (hoursLeft <= 0) {
    return {
      bgColor: '#1f2937', // Neutral Gray/Black
      textColor: '#ffffff',
      label: 'Overdue'
    };
  }

  // Critical State (less than 6 hours)
  if (hoursLeft <= 6) {
    return {
      bgColor: '#ef4444', // Red
      textColor: '#ffffff',
      label: 'Critical State'
    };
  }

  // High severity cascades to Red (Critical) at 12 hours remaining.
  if (hoursLeft <= 12 && severity === 'high') {
    return {
      bgColor: '#ef4444',
      textColor: '#ffffff',
      label: 'Critical State (High Severity)'
    };
  }

  // High severity skips Green and is Orange immediately, or any task under 24 hours.
  if (hoursLeft <= 24 || severity === 'high') {
    return {
      bgColor: '#f97316', // Orange
      textColor: '#ffffff',
      label: 'Urgent State'
    };
  }

  // Warning State (24 to 48 hours)
  if (hoursLeft <= 48) {
    return {
      bgColor: '#f59e0b', // Yellow
      textColor: '#1e293b',
      label: 'Warning State'
    };
  }

  // Safe State (more than 48 hours)
  return {
    bgColor: '#10b981', // Green
    textColor: '#ffffff',
    label: 'Safe State'
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
