import notifee, { TriggerType, AndroidImportance, AndroidCategory, AndroidVisibility } from '@notifee/react-native';
import { Platform } from 'react-native';

let channelCreated = false;

// I finally figured out how to set up the notification permissions!
// It took me a few days to learn how Android channels work, but this creates 
// a custom channel so our alarms can bypass Do Not Disturb.
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;

  try {
    const settings = await notifee.requestPermission();
    
    // Make sure we only create the channel once, otherwise it might crash
    if (Platform.OS === 'android' && !channelCreated) {
      await notifee.createChannel({
        id: 'urgentify-alarms',
        name: 'Urgentify Alarms',
        importance: AndroidImportance.HIGH,
        sound: 'alarm',
        vibration: true,
        // Had a bug here where 0 caused a crash, but replacing it with 300 fixed it!
        // It has to be positive numbers only.
        vibrationPattern: [300, 500, 300, 500],
        bypassDnd: true, // This is super cool, it bypasses Do Not Disturb
      });
      channelCreated = true;
    }

    return settings.authorizationStatus >= 1;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Simple function to cancel an alarm if the user deletes the task
export async function cancelTaskNotification(taskId) {
  if (Platform.OS === 'web') return;
  try {
    await notifee.cancelNotification(`${taskId}-alert`);
  } catch (error) {
    console.error(`Failed to cancel notification for task ${taskId}:`, error);
  }
}

// This was the hardest part! Scheduling the actual alarm.
// It calculates the offset based on what the user picked (minutes, hours, days)
export async function scheduleTaskNotification(task, customOffsetMs = null) {
  if (Platform.OS === 'web') return;

  const { _id, title, deadline, isCompleted, customNotificationValue, customNotificationUnit } = task;

  // Always cancel the old alarm first before making a new one to prevent duplicates
  await cancelTaskNotification(_id);

  // If the task is done, we definitely don't need an alarm ringing
  if (isCompleted) {
    return;
  }

  // If there's no custom offset and they didn't pick a warning time, just skip
  if (customOffsetMs === null && (!customNotificationUnit || customNotificationUnit === 'none' || !customNotificationValue)) {
    return;
  }

  const deadlineTime = new Date(deadline).getTime();
  const now = Date.now();

  let warningTime;

  if (customOffsetMs !== null) {
    // I added this part for the Snooze button feature!
    warningTime = now + customOffsetMs;
  } else {
    // I learned how to convert times to milliseconds here
    let offsetMs = 0;
    if (customNotificationUnit === 'minutes') {
      offsetMs = customNotificationValue * 60 * 1000;
    } else if (customNotificationUnit === 'hours') {
      offsetMs = customNotificationValue * 60 * 60 * 1000;
    } else if (customNotificationUnit === 'days') {
      offsetMs = customNotificationValue * 24 * 60 * 60 * 1000;
    }
    warningTime = deadlineTime - offsetMs;
  }

  // Only set the alarm if the warning time hasn't passed yet
  if (warningTime > now) {
    try {
      await notifee.createTriggerNotification(
        {
          id: `${_id}-alert`,
          title: `ALARM: ${title}`,
          body: `Due soon! Open the app to mark this task as complete to turn off the alarm.`,
          data: { taskId: _id },
          android: {
            channelId: 'urgentify-alarms',
            category: AndroidCategory.ALARM,
            visibility: AndroidVisibility.PUBLIC,
            importance: AndroidImportance.HIGH,
            ongoing: true, // This stops the user from just swiping it away! They have to open the app.
            autoCancel: false,
            // Added a snooze action which took a lot of documentation reading
            actions: [
              {
                title: 'Snooze 10 min',
                pressAction: { id: 'snooze' },
              },
            ],
            // This wakes up the phone screen even if it's locked
            fullScreenAction: {
              id: 'default',
            },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: warningTime,
        }
      );
    } catch (error) {
      console.error(`Error scheduling notification for task ${_id}:`, error);
    }
  }
}

// I use this function whenever the task list updates from the web socket
// to make sure all alarms are in sync
export async function syncLocalAlarms(tasks) {
  if (Platform.OS === 'web') return;

  try {
    for (const task of tasks) {
      await scheduleTaskNotification(task);
    }
  } catch (error) {
    console.error('Failed to sync local alarms:', error);
  }
}

// Just an empty function for now, Notifee handles foreground stuff automatically
export function setupForegroundHandler() {
  if (Platform.OS === 'web') return;
}
