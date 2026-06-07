import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../config';
import TaskCard from '../TaskCard';
import TaskForm from '../TaskForm';
import TaskDetailEdit from '../TaskDetailEdit';
import AboutDeveloper from '../AboutDeveloper';
import OverlapTimeline from '../OverlapTimeline';
import './Dashboard.css';

// REACT DEV CONCEPT: Container Component Pattern (Smart Component)
// Dashboard handles all the heavy lifting (WebSockets, State, API calls),
// while the children just receive data and render the UI.
export default function Dashboard({ token, email, onLogout, theme, onToggleTheme }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Navigation states
  const [editingTask, setEditingTask] = useState(null);
  const [showDeveloper, setShowDeveloper] = useState(false);

  // Filter and Sort states
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('deadline-soon');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'overdue', 'completed', or 'timeline'

  // Sync tasks with Chrome Alarms for background notifications
  function syncAlarms(taskList) {
    if (window.chrome && chrome.alarms) {
      chrome.alarms.clearAll(() => {
        taskList.forEach((task) => {
          if (task.isCompleted) return;

          const deadlineTime = new Date(task.deadline).getTime();
          const now = Date.now();

          if (deadlineTime > now) {
            chrome.alarms.create(
              JSON.stringify({ id: task._id, title: task.title, deadline: task.deadline }),
              { when: deadlineTime }
            );

            let offsetMs = 0;
            let labelRemaining = '';

            if (task.customNotificationUnit && task.customNotificationUnit !== 'none' && task.customNotificationValue > 0) {
              const val = task.customNotificationValue;
              const unit = task.customNotificationUnit;
              
              if (unit === 'minutes') {
                offsetMs = val * 60 * 1000;
              } else if (unit === 'hours') {
                offsetMs = val * 60 * 60 * 1000;
              } else if (unit === 'days') {
                offsetMs = val * 24 * 60 * 60 * 1000;
              }
              
              labelRemaining = `${val} ${val === 1 ? unit.slice(0, -1) : unit}`;
            } else {
              const offsetHours = task.severity === 'high' ? 12 : 6;
              offsetMs = offsetHours * 60 * 60 * 1000;
              labelRemaining = `${offsetHours}h`;
            }

            const warningTime = deadlineTime - offsetMs;
            if (warningTime > now) {
              chrome.alarms.create(
                JSON.stringify({
                  id: `${task._id}-warning`,
                  title: `${task.title} - ${labelRemaining} Remaining`,
                  deadline: task.deadline
                }),
                { when: warningTime }
              );
            }
          }
        });
        console.log('SyncTask: Chrome alarms successfully synchronized.');
      });
    }
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

      setTasks(resData.data || []);
      syncAlarms(resData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchTasks();
    
    // Refresh task timings every minute to update Visual Urgency tags dynamically
    const interval = setInterval(() => {
      setTasks(prevTasks => [...prevTasks]);
    }, 60000);

    const socketUrl = API_BASE_URL.replace('/api', '');
    const socket = io(socketUrl);

    socket.emit('join', token);

    socket.on('taskCreated', (newTask) => {
      setTasks(prev => {
        if (prev.some(t => t._id === newTask._id)) return prev;
        const updated = [...prev, newTask];
        syncAlarms(updated);
        return updated;
      });
    });

    socket.on('taskUpdated', (updatedTask) => {
      setTasks(prev => {
        const updated = prev.map(t => t._id === updatedTask._id ? updatedTask : t);
        syncAlarms(updated);
        return updated;
      });
    });

    socket.on('taskDeleted', (deletedTaskId) => {
      setTasks(prev => {
        const updated = prev.filter(t => t._id !== deletedTaskId);
        syncAlarms(updated);
        return updated;
      });
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [token]);

  async function handleCreateTask(taskPayload) {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskPayload)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to create task');
      }

      const updatedTasks = [...tasks, resData.data];
      setTasks(updatedTasks);
      syncAlarms(updatedTasks);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  async function handleToggleComplete(taskId, isCompleted) {
    setError('');
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
      syncAlarms(updatedTasks);
    } catch (err) {
      setError(err.message);
    }
  };

  // Dedicated save handler for detail edit updates
  async function handleSaveTaskDetails(taskId, updatedPayload) {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPayload)
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to save task changes');
      }

      const updatedTasks = tasks.map(t => t._id === taskId ? resData.data : t);
      setTasks(updatedTasks);
      syncAlarms(updatedTasks);
      setEditingTask(null); // return to dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  async function handleDeleteTask(taskId) {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to delete task');
      }

      const updatedTasks = tasks.filter(t => t._id !== taskId);
      setTasks(updatedTasks);
      syncAlarms(updatedTasks);
      if (editingTask && editingTask._id === taskId) {
        setEditingTask(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  async function handleAckAlarm(taskId) {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/ack`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to acknowledge alarm');
      }

      const updatedTasks = tasks.map(t => t._id === taskId ? resData.data : t);
      setTasks(updatedTasks);
      syncAlarms(updatedTasks);
    } catch (err) {
      setError(err.message);
    }
  };

  // Compute Filtered and Sorted list dynamically on render
  function getFilteredAndSortedTasks() {
    let result = [...tasks];

    // 1. Filter by Completion status based on the active tab
    if (activeTab === 'pending') {
      result = result.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() > 0);
    } else if (activeTab === 'completed') {
      result = result.filter(t => t.isCompleted);
    } else if (activeTab === 'overdue') {
      result = result.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() <= 0);
    }

    // 2. Filter by Severity
    if (filterSeverity !== 'all') {
      result = result.filter(t => t.severity === filterSeverity);
    }

    // 3. Sort tasks
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
  const pendingTasks = tasks.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() > 0).length;
  const overdueTasks = tasks.filter(t => !t.isCompleted && new Date(t.deadline) - new Date() <= 0).length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;

  // Render developer screen if active
  if (showDeveloper) {
    return (
      <AboutDeveloper 
        onBack={() => setShowDeveloper(false)} 
      />
    );
  }

  // Render detail edit screen if active
  // REACT DEV CONCEPT: Direct Parent-to-Child Data Pass
  // This is NOT Prop Drilling. Dashboard directly owns 'editingTask'
  // and passes it straight to its immediate child. Prop Drilling only
  // happens when you pass data through intermediate components that don't need it!
  if (editingTask) {
    return (
      <TaskDetailEdit
        task={editingTask}
        onSave={handleSaveTaskDetails}
        onBack={() => setEditingTask(null)}
      />
    );
  }

  
  return (
    <div className="app-container">
      <div className="dashboard-header">
        <div className="user-profile">
          <h2>Urgentify</h2>
          <span className="user-email" title={email}>{email.split('@')[0]}</span>
        </div>
        <div className="header-actions">
          {/* Developer profile link using SVG */}
          <button 
            className="btn-theme-toggle" 
            onClick={() => setShowDeveloper(true)} 
            title="About Developer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
          
          {/* Theme switcher using SVG */}
          <button 
            className="btn-theme-toggle" 
            onClick={onToggleTheme} 
            title="Toggle Dark/Light Theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
          
          {/* Sign Out using SVG */}
          <button 
            className="btn-theme-toggle btn-logout-icon" 
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                onLogout();
              }
            }}
            title="Sign Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          Pending: <span>{pendingTasks}</span>
        </div>
        <div className="stat-item">
          Overdue: <span>{overdueTasks}</span>
        </div>
        <div className="stat-item">
          Completed: <span>{completedTasks}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Overlap Timeline
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {activeTab !== 'timeline' ? (
        <>
          {/* Filter and Sort Bar */}
          <div className="filter-bar">

            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="filter-select"
              title="Filter by severity level"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="mid">Mid</option>
              <option value="high">High</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
              title="Sort list order"
            >
              <option value="deadline-soon">Soonest</option>
              <option value="deadline-far">Furthest</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

          <div className="tasks-container">
            {loading && tasks.length === 0 ? (
              <div className="no-tasks">Loading tasks...</div>
            ) : displayedTasks.length === 0 ? (
              <div className="no-tasks">
                {tasks.length === 0 
                  ? 'No tasks found. Create one to get started!' 
                  : 'No tasks match selected filter criteria.'}
              </div>
            ) : (
              displayedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  theme={theme}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onAckAlarm={handleAckAlarm}
                  onEditClick={(t) => setEditingTask(t)}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <OverlapTimeline 
          tasks={tasks}
          onEditClick={(t) => setEditingTask(t)}
        />
      )}

      {activeTab !== 'timeline' && (
        <div className="actions-footer">
          <button className="btn-float-add" onClick={() => setShowForm(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Task
          </button>
        </div>
      )}

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

