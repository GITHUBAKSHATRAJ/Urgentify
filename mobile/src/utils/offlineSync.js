import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config';

const PENDING_ACKS_KEY = 'pending_alarm_acks';

// Get local pending acks list
export const getPendingAcks = async () => {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem(PENDING_ACKS_KEY);
      return data ? JSON.parse(data) : [];
    } else {
      const data = await SecureStore.getItemAsync(PENDING_ACKS_KEY);
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Error loading pending acks:', error);
    return [];
  }
};

// Queue an ack locally
export const queueAckLocally = async (taskId) => {
  try {
    const list = await getPendingAcks();
    if (!list.includes(taskId)) {
      list.push(taskId);
      const str = JSON.stringify(list);
      if (Platform.OS === 'web') {
        localStorage.setItem(PENDING_ACKS_KEY, str);
      } else {
        await SecureStore.setItemAsync(PENDING_ACKS_KEY, str);
      }
    }
  } catch (error) {
    console.error('Error queueing pending ack:', error);
  }
};

// Remove a successful ack from the queue
export const dequeueAck = async (taskId) => {
  try {
    const list = await getPendingAcks();
    const filtered = list.filter(id => id !== taskId);
    const str = JSON.stringify(filtered);
    if (Platform.OS === 'web') {
      localStorage.setItem(PENDING_ACKS_KEY, str);
    } else {
      await SecureStore.setItemAsync(PENDING_ACKS_KEY, str);
    }
  } catch (error) {
    console.error('Error dequeuing ack:', error);
  }
};

// Sync all pending acks with the backend
export const syncPendingAcks = async (token) => {
  if (!token) return;
  
  const pending = await getPendingAcks();
  if (pending.length === 0) return;

  console.log(`SyncTask: Found ${pending.length} pending offline alarm acknowledgments to sync...`);

  for (const taskId of pending) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/ack`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        await dequeueAck(taskId);
        console.log(`SyncTask: Successfully synced offline alarm ack for task ${taskId}`);
      }
    } catch (err) {
      console.warn(`SyncTask: Failed to sync offline ack for ${taskId}, will retry later:`, err.message);
      break; // Stop loop if connection fails again
    }
  }
};
