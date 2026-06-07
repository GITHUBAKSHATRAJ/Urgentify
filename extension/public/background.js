// Chrome Extension Service Worker

// Listen for alarms and trigger notifications
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log(`Alarm triggered: ${alarm.name}`);
  try {
    const taskInfo = JSON.parse(alarm.name);
    
    chrome.notifications.create(`synctask-${taskInfo.id}-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Task Deadline Imminent!',
      message: `"${taskInfo.title}" requires urgent attention. Deadline: ${new Date(taskInfo.deadline).toLocaleTimeString()}`,
      priority: 2,
      requireInteraction: true // Keep notification visible until dismissed
    });
  } catch (error) {
    // Fallback if the alarm name is not JSON string
    chrome.notifications.create(`synctask-generic-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'SyncTask Urgency Alert',
      message: 'A task deadline is approaching!',
      priority: 2
    });
  }
});

// Clean up alarms on install/update or startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('SyncTask Chrome Extension installed.');
  chrome.alarms.clearAll();
});
