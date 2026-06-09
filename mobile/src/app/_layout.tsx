import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerBackgroundSync } from '../utils/backgroundSync';
import notifee, { EventType } from '@notifee/react-native';
import { scheduleTaskNotification } from '../utils/notifications';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'snooze') {
    if (detail.notification) {
      await notifee.cancelNotification(detail.notification.id);
      
      const taskId = detail.notification.data?.taskId;
      if (taskId) {
        // Reschedule for 10 minutes (600000 ms)
        await scheduleTaskNotification(
          { _id: taskId, title: detail.notification.title?.replace('ALARM: ', '') || 'Task' },
          10 * 60 * 1000
        );
      }
    }
  }
});

export default function RootLayout() {
  useEffect(() => {
    registerBackgroundSync();
  }, []);

  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
}
