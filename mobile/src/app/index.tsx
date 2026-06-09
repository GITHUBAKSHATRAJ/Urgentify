import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import { getSession, removeSession } from '@/utils/secureStore';
import { setupForegroundHandler } from '@/utils/notifications';

// Handle notifications when the app is running in the foreground on native platforms
setupForegroundHandler();

export default function HomeScreen() {
  const systemScheme = useColorScheme();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to premium dark theme
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (systemScheme === 'light' || systemScheme === 'dark') {
      setTheme(systemScheme);
    }
    
    const loadSession = async () => {
      try {
        const session = await getSession();
        if (session && session.token) {
          setToken(session.token);
          setEmail(session.email || '');
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleAuthSuccess = (newToken: string, newEmail: string) => {
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await removeSession();
      setToken(null);
      setEmail('');
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (loading) {
    const isDark = theme === 'dark';
    return (
      <View style={[styles.center, isDark ? styles.bgDark : styles.bgLight]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const isDark = theme === 'dark';
  return (
    <View style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      {token ? (
        <Dashboard
          token={token}
          email={email}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <Auth 
          onAuthSuccess={handleAuthSuccess} 
          theme={theme} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgDark: {
    backgroundColor: '#05070c',
  },
  bgLight: {
    backgroundColor: '#f4f6fa',
  },
});
