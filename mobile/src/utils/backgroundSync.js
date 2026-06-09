import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getSession } from './secureStore';
import { syncLocalAlarms } from './notifications';
import { API_BASE_URL } from '../config';
import { Platform } from 'react-native';

const BACKGROUND_SYNC_TASK = 'background-task-sync';

// Define the background task logic (only on native)
if (Platform.OS !== 'web') {
  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      const { token } = await getSession();
      if (!token) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Fetch the latest tasks from the server
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }

      const resData = await response.json();
      const serverTasks = resData.data || [];

      // Create a Set of active task IDs that should have alarms
      const activeTaskIds = new Set(
        serverTasks
          .filter(t => !t.isCompleted && !t.alarmAcknowledged && t.customNotificationUnit && t.customNotificationUnit !== 'none')
          .map(t => t._id)
      );

      // Get all locally scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      let alarmsChanged = false;

      // Check each local notification against the server tasks
      for (const notification of scheduledNotifications) {
        const identifier = notification.identifier;
        // Notifications are registered with identifier `${taskId}-alert`
        if (identifier && identifier.endsWith('-alert')) {
          const taskId = identifier.replace('-alert', '');

          // If the server no longer has this task as an active alarm target
          if (!activeTaskIds.has(taskId)) {
            await Notifications.cancelScheduledNotificationAsync(identifier);
            alarmsChanged = true;
            console.log(`[Background Sync] Cancelled obsolete alarm for task ${taskId}`);
          }
        }
      }

      // Sync and schedule any NEW alarms that were created while the app was closed
      await syncLocalAlarms(serverTasks);
      alarmsChanged = true;

      return alarmsChanged 
        ? BackgroundFetch.BackgroundFetchResult.NewData 
        : BackgroundFetch.BackgroundFetchResult.NoData;

    } catch (error) {
      console.error('Background Sync Task failed:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

// Helper function to register the background task
export const registerBackgroundSync = async () => {
  if (Platform.OS === 'web') return;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 14 * 60, // 14 minutes
        stopOnTerminate: false, // Continue running after app is killed
        startOnBoot: true, // Start automatically when the device boots
      });
      console.log('Background Sync task registered successfully');
    }
  } catch (error) {
    console.error('Failed to register Background Sync task:', error);
  }
};
