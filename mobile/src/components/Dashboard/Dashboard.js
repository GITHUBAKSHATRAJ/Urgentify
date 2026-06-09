import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Sun, Moon, LogOut, Plus, Trash2, Calendar, User, BellRing } from 'lucide-react-native';
import { API_BASE_URL } from '../../config';
import TaskCard from '../TaskCard';
import OverlapTimeline from '../OverlapTimeline';
import AboutDeveloper from '../AboutDeveloper';
import TaskForm from '../TaskForm';
import TaskDetailEdit from '../TaskDetailEdit';
import { requestNotificationPermissions, syncLocalAlarms, cancelTaskNotification, scheduleTaskNotification } from '../../utils/notifications';
import { syncPendingAcks, queueAckLocally } from '../../utils/offlineSync';
import styles from './DashboardStyles';

let DateTimePicker = null;
if (Platform.OS !== 'web') {
  try {
    const dtpModule = require('@react-native-community/datetimepicker');
    DateTimePicker = dtpModule.default || dtpModule;
  } catch (e) {
    console.log('DateTimePicker not available');
  }
}

// REACT DEV CONCEPT: Container Component Pattern & Prop Drilling
// This Dashboard acts as the "Smart Container". It manages all state (tasks, WebSockets, modals)
// and handles data fetching. It passes this data down as props to purely "Presentational" children
// (like <TaskCard>). When we pass data down through multiple layers of components, it's called 
// "Prop Drilling". If we passed `theme` down 5 levels deep, it would be heavy Prop Drilling, 
// which is why advanced developers often use React Context instead for deep global variables!
export default function Dashboard({ token, email, onLogout, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([]);
  
  // Notification States
  const [hasCustomAlert, setHasCustomAlert] = useState(false);
  const [formNotificationValue, setFormNotificationValue] = useState('');
  const [formNotificationUnit, setFormNotificationUnit] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Alarm states for modal
  const [activeAlarmTask, setActiveAlarmTask] = useState(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  
  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'overdue', 'completed', 'timeline'
  const [showDeveloper, setShowDeveloper] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters & Sorters
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('deadline-soon');

  const isDark = theme === 'dark';

  function checkActiveAlarms(taskList) {
    if (showAlarmModal || activeAlarmTask) return;

    const now = Date.now();
    const activeAlarm = taskList.find(task => {
      if (task.isCompleted || task.alarmAcknowledged || !task.customNotificationUnit || task.customNotificationUnit === 'none') {
        return false;
      }
      if (task.snoozeUntil && Date.now() < task.snoozeUntil) {
        return false;
      }
      
      const deadlineTime = new Date(task.deadline).getTime();
      let offsetMs = 0;
      if (task.customNotificationUnit === 'minutes') {
        offsetMs = task.customNotificationValue * 60 * 1000;
      } else if (task.customNotificationUnit === 'hours') {
        offsetMs = task.customNotificationValue * 60 * 60 * 1000;
      } else if (task.customNotificationUnit === 'days') {
        offsetMs = task.customNotificationValue * 24 * 60 * 60 * 1000;
      }
      
      const warningTime = deadlineTime - offsetMs;
      return warningTime <= now;
    });

    if (activeAlarm) {
      setActiveAlarmTask(activeAlarm);
      setShowAlarmModal(true);
    }
  };

  async function handleAcknowledgeAlarm(taskId) {
    await cancelTaskNotification(taskId);
    // Instantly update local state so UI is reactive
    const updatedTasks = tasks.map(t => {
      if (t._id === taskId) {
        return { ...t, alarmAcknowledged: true, alarmAcknowledgedAt: new Date().toISOString() };
      }
      return t;
    });
    setTasks(updatedTasks);
    setShowAlarmModal(false);
    setActiveAlarmTask(null);

    // Call API or queue locally if offline
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/ack`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const text = await response.text();
      if (!response.ok) {
        const err = text ? JSON.parse(text).error : 'Server error';
        throw new Error(err);
      }
    } catch (err) {
      console.log('SyncTask: Offline or network failed during acknowledgment, queueing locally...', err.message);
      await queueAckLocally(taskId);
    }
  };

  async function handleSnoozeAlarm(taskId) {
    await cancelTaskNotification(taskId);
    
    // Reschedule Notifee trigger for 10 minutes from now (600,000 ms)
    const taskToSnooze = tasks.find(t => t._id === taskId);
    if (taskToSnooze) {
      await scheduleTaskNotification(taskToSnooze, 10 * 60 * 1000);
    }

    const updatedTasks = tasks.map(t => {
      if (t._id === taskId) {
        return { ...t, snoozeUntil: Date.now() + 10 * 60 * 1000 };
      }
      return t;
    });
    setTasks(updatedTasks);
    setShowAlarmModal(false);
    setActiveAlarmTask(null);
  };

  async function fetchTasks() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to fetch tasks');
      }
      const taskList = resData.data || [];
      setTasks(taskList);
      syncLocalAlarms(taskList);
      checkActiveAlarms(taskList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // REACT DEV CONCEPT: The Effect Hook (useEffect)
  // `useEffect` replaces the old Component Lifecycle methods (componentDidMount, componentWillUnmount).
  // It tells React: "After the component renders on the screen, run this side-effect code."
  // The empty array `[]` or `[token]` at the end is the Dependency Array — it ensures this effect 
  // ONLY runs when the token changes, preventing infinite loops of re-rendering.
  useEffect(() => {
    async function initNotifications() {
      await requestNotificationPermissions();
    };
    initNotifications();
    fetchTasks();
    syncPendingAcks(token);

    // Real-time WebSocket connection
    const socketUrl = API_BASE_URL.replace('/api', '');
    const socket = io(socketUrl);

    socket.emit('join', token);

    socket.on('taskCreated', (newTask) => {
      // REACT DEV CONCEPT: Functional State Updates
      // Instead of writing `setTasks([...tasks, newTask])`, we use `setTasks(prev => ...)`.
      // Since WebSockets can receive many messages at the exact same millisecond, using the `prev` 
      // argument guarantees we are updating the absolute latest state, preventing Race Conditions!
      setTasks(prev => {
        if (prev.some(t => t._id === newTask._id)) return prev;
        const updated = [...prev, newTask];
        syncLocalAlarms(updated);
        return updated;
      });
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks(prev => {
        const updated = prev.map(t => t._id === updatedTask._id ? updatedTask : t);
        syncLocalAlarms(updated);
        return updated;
      });
    });

    socket.on('taskDeleted', async (deletedTaskId) => {
      await cancelTaskNotification(deletedTaskId);
      setTasks(prev => {
        const updated = prev.filter(t => t._id !== deletedTaskId);
        syncLocalAlarms(updated);
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    // Check for triggered alarms every 10 seconds
    const interval = setInterval(() => {
      if (tasks.length > 0) {
        checkActiveAlarms(tasks);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, showAlarmModal]);

  async function handleCreateTask(taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          startDate: taskData.startDate ? new Date(Date.parse(taskData.startDate)).toISOString() : undefined,
          deadline: new Date(Date.parse(taskData.deadline)).toISOString(),
          severity: taskData.severity,
          customNotificationValue: taskData.hasCustomAlert ? Number(taskData.formNotificationValue) : null,
          customNotificationUnit: taskData.hasCustomAlert ? taskData.formNotificationUnit : 'none'
        })
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to create task');
      }
      const updatedTasks = [...tasks, resData.data];
      setTasks(updatedTasks);
      syncLocalAlarms(updatedTasks);
      setShowCreateModal(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  async function handleToggleComplete(taskId, isCompleted) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isCompleted })
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to update task');
      }
      const updatedTasks = tasks.map(t => t._id === taskId ? resData.data : t);
      setTasks(updatedTasks);
      syncLocalAlarms(updatedTasks);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  async function handleSaveTaskDetails(taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          startDate: taskData.startDate ? new Date(Date.parse(taskData.startDate)).toISOString() : undefined,
          deadline: new Date(Date.parse(taskData.deadline)).toISOString(),
          severity: taskData.severity,
          customNotificationValue: taskData.hasCustomAlert ? Number(taskData.formNotificationValue) : null,
          customNotificationUnit: taskData.hasCustomAlert ? taskData.formNotificationUnit : 'none'
        })
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to save changes');
      }
      const updatedTasks = tasks.map(t => t._id === editingTask._id ? resData.data : t);
      setTasks(updatedTasks);
      syncLocalAlarms(updatedTasks);
      setEditingTask(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  function handleDeleteTask(taskId) {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (!response.ok) {
              const resData = await response.json();
              throw new Error(resData.error || 'Failed to delete task');
            }
            await cancelTaskNotification(taskId);
            const updatedTasks = tasks.filter(t => t._id !== taskId);
            setTasks(updatedTasks);
            syncLocalAlarms(updatedTasks);
            if (editingTask && editingTask._id === taskId) {
              setEditingTask(null);
            }
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  function handleEditClick(task) {
    setEditingTask(task);
  };

  function handleLogoutPress() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout }
    ]);
  };

  // Filter & Sort Tasks
  function getFilteredAndSortedTasks() {
    let result = [...tasks];

    // Filter by Completion status (Tab selections)
    if (activeTab === 'pending') {
      result = result.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() > 0);
    } else if (activeTab === 'completed') {
      result = result.filter(t => t.isCompleted);
    } else if (activeTab === 'overdue') {
      result = result.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() <= 0);
    }

    // Filter by Severity
    if (filterSeverity !== 'all') {
      result = result.filter(t => t.severity === filterSeverity);
    }

    // Sort tasks
    result.sort((a, b) => {
      if (sortBy === 'deadline-soon') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'deadline-far') {
        return new Date(b.deadline) - new Date(a.deadline);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  };

  const displayedTasks = getFilteredAndSortedTasks();
  const pendingCount = tasks.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() > 0).length;
  const overdueCount = tasks.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() <= 0).length;
  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.bgDark : styles.bgLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Top Header Row */}
      <View style={[styles.header, isDark ? styles.borderDark : styles.borderLight]}>
        <View>
          <Text style={[styles.headerTitle, isDark ? styles.textLight : styles.textDark]}>Urgentify</Text>
          <Text style={styles.headerUser}>{email.split('@')[0]}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowDeveloper(true)}>
            <User size={18} color={isDark ? '#9ca3af' : '#64748b'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={onToggleTheme}>
            {isDark ? (
              <Sun size={18} color="#9ca3af" />
            ) : (
              <Moon size={18} color="#64748b" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleLogoutPress}>
            <LogOut size={18} color={isDark ? '#9ca3af' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Counter Bar */}
      <View style={[styles.statsBar, isDark ? styles.cardDark : styles.cardLight]}>
        <Text style={styles.statText}>Pending: <Text style={styles.statNum}>{pendingCount}</Text></Text>
        <Text style={styles.statText}>Overdue: <Text style={[styles.statNum, { color: '#ef4444' }]}>{overdueCount}</Text></Text>
        <Text style={styles.statText}>Completed: <Text style={styles.statNum}>{completedCount}</Text></Text>
      </View>

      {/* Navigation Tabs */}
      <View style={[styles.tabsContainer, isDark ? styles.inputDark : styles.inputLight]}>
        {['pending', 'overdue', 'completed', 'timeline'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab ? styles.tabBtnActive : null]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab ? styles.tabTextActive : null,
              !isDark && activeTab !== tab ? { color: '#64748b' } : null
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Tab Views */}
      {activeTab !== 'timeline' ? (
        <View style={{ flex: 1 }}>
          {/* Quick Filters */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {/* Severity Filter buttons */}
              {['all', 'low', 'mid', 'high'].map(sev => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.pillBtn, filterSeverity === sev ? styles.pillBtnActive : (isDark ? styles.pillDark : styles.pillLight)]}
                  onPress={() => setFilterSeverity(sev)}
                >
                  <Text style={[styles.pillText, filterSeverity === sev ? styles.pillTextActive : null]}>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <View style={styles.divider} />
              
              {/* Sort keys */}
              {[
                { key: 'deadline-soon', label: 'Soonest' },
                { key: 'deadline-far', label: 'Furthest' },
                { key: 'newest', label: 'Newest' }
              ].map(sOption => (
                <TouchableOpacity
                  key={sOption.key}
                  style={[styles.pillBtn, sortBy === sOption.key ? styles.pillBtnActive : (isDark ? styles.pillDark : styles.pillLight)]}
                  onPress={() => setSortBy(sOption.key)}
                >
                  <Text style={[styles.pillText, sortBy === sOption.key ? styles.pillTextActive : null]}>
                    {sOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tasks FlatList */}
          {loading && tasks.length === 0 ? (
            <ActivityIndicator style={styles.loader} size="large" color="#6366f1" />
          ) : displayedTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {tasks.length === 0 ? 'No tasks found. Create one to begin!' : 'No tasks match filter criteria.'}
              </Text>
            </View>
          ) : (
            // REACT NATIVE CONCEPT: FlatList vs ScrollView (Virtualization)
            // We use <FlatList> instead of <ScrollView> for lists. If you had 1,000 tasks, 
            // ScrollView would try to render all 1,000 components at once and crash the phone.
            // FlatList uses "Virtualization" — it only renders the 5 or 6 items currently visible on 
            // the screen, instantly deleting off-screen items to save RAM and Battery!
            <FlatList
              data={displayedTasks}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TaskCard
                  task={item}
                  theme={theme}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onEditClick={handleEditClick}
                />
              )}
            />
          )}

          {/* Floating Create Button */}
          <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
            <Plus color="#ffffff" size={24} />
          </TouchableOpacity>
        </View>
      ) : (
        <OverlapTimeline
          tasks={tasks}
          onEditClick={handleEditClick}
        />
      )}

      {/* Extracted Components */}
      {showDeveloper && (
        <AboutDeveloper theme={theme} onClose={() => setShowDeveloper(false)} />
      )}
      
      <TaskForm 
        visible={showCreateModal} 
        theme={theme} 
        onSubmit={handleCreateTask} 
        onCancel={() => setShowCreateModal(false)} 
      />

      <TaskDetailEdit 
        visible={!!editingTask} 
        theme={theme} 
        task={editingTask}
        onSubmit={handleSaveTaskDetails} 
        onCancel={() => setEditingTask(null)} 
      />

      {/* Alarm Triggered Modal */}
      <Modal visible={showAlarmModal && !!activeAlarmTask} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.alarmCard, isDark ? styles.cardDark : { backgroundColor: '#ffffff' }]}>
            <View style={styles.alarmHeader}>
              <BellRing size={40} color="#ef4444" />
              <Text style={[styles.alarmTitle, isDark ? styles.textLight : styles.textDark]}>
                Deadline Alert!
              </Text>
            </View>
            
            <View style={styles.alarmBody}>
              <Text style={[styles.alarmTaskTitle, isDark ? styles.textLight : styles.textDark]}>
                {activeAlarmTask?.title}
              </Text>
              {activeAlarmTask?.description ? (
                <Text style={[styles.alarmTaskDesc, { color: isDark ? '#9ca3af' : '#4b5563' }]}>
                  {activeAlarmTask?.description}
                </Text>
              ) : null}
              <Text style={[styles.alarmWarningText, { color: '#ef4444' }]}>
                Scheduled warning time reached: {activeAlarmTask?.customNotificationValue} {activeAlarmTask?.customNotificationUnit} remaining!
              </Text>
            </View>

            <View style={{ gap: 8, width: '100%' }}>
              <TouchableOpacity 
                style={styles.btnAcknowledge} 
                onPress={() => handleAcknowledgeAlarm(activeAlarmTask?._id)}
              >
                <Text style={styles.btnText}>Acknowledge Alarm</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btnAcknowledge, { backgroundColor: isDark ? '#374151' : '#e2e8f0', marginTop: 0 }]} 
                onPress={() => handleSnoozeAlarm(activeAlarmTask?._id)}
              >
                <Text style={[styles.btnText, { color: isDark ? '#ffffff' : '#4b5563' }]}>Snooze for 5 minutes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

