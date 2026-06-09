import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'auth_email';

/**
 * Persist authentication session
 */
export const saveSession = async (token, email) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EMAIL_KEY, email);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(EMAIL_KEY, email);
    }
  } catch (error) {
    console.error('Error saving session to storage:', error);
  }
};

/**
 * Retrieve saved session
 */
export const getSession = async () => {
  try {
    if (Platform.OS === 'web') {
      const token = localStorage.getItem(TOKEN_KEY);
      const email = localStorage.getItem(EMAIL_KEY);
      return { token, email };
    } else {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const email = await SecureStore.getItemAsync(EMAIL_KEY);
      return { token, email };
    }
  } catch (error) {
    console.error('Error loading session from storage:', error);
    return { token: null, email: null };
  }
};

/**
 * Remove session on sign out
 */
export const removeSession = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(EMAIL_KEY);
    }
  } catch (error) {
    console.error('Error deleting session from storage:', error);
  }
};
