/**
 * Web stub for notifications.
 * Metro will automatically resolve this file instead of notifications.js when compiling for web.
 */

export const requestNotificationPermissions = async () => {
  return false;
};

export const cancelTaskNotification = async (taskId) => {
  // No-op on web
};

export const scheduleTaskNotification = async (task) => {
  // No-op on web
};

export const syncLocalAlarms = async (tasks) => {
  // No-op on web
};

export const setupForegroundHandler = () => {
  // No-op on web
};
