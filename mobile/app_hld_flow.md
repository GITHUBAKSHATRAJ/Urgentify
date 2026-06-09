# Urgentify App - High Level Design (HLD) Workflow

This document outlines the end-to-end architecture and data flow of the Urgentify application, connecting the Mobile App, Web Extension, Backend API, WebSockets, and the Native Android Notification Engine.

## Mermaid Flowchart
You can copy the code block below and paste it directly into [Mermaid Live Editor](https://mermaid.live/) or [Mermaid AI](https://mermaid.ai) to visualize the architecture.

```mermaid
sequenceDiagram
    autonumber
    participant Ext as Web Extension
    participant API as Backend (Express)
    participant DB as MongoDB
    participant Socket as Socket.io Server
    participant Mobile as Mobile App (React Native)
    participant Native as Android Native (Notifee)

    Note over Mobile, Native: Phase 1: Local Setup & Alarm Sync
    Mobile->>API: GET /api/tasks
    API->>DB: Fetch tasks
    DB-->>API: Return tasks
    API-->>Mobile: 200 OK { tasks: [...] }
    Mobile->>Native: Loop through tasks (syncLocalAlarms)
    Native->>Native: Cancel old alarms & schedule new ones
    Native->>Native: Set alarm.wav (5-minute audio)

    Note over Ext, Mobile: Phase 2: Real-time Updates (Cross-Platform)
    Ext->>API: PUT /api/tasks/:id (Mark Completed)
    API->>DB: Update task status
    DB-->>API: Task Updated
    API->>Socket: Emit 'taskUpdated' event
    Socket-->>Mobile: Broadcast 'taskUpdated' to connected client
    
    Note over Mobile, Native: Phase 3: Dynamic Hardware Bridge
    Mobile->>Mobile: React Functional Update (Prevents Race Condition)
    Mobile->>Native: Cancel existing native alarm for task
    Native->>Native: Remove pending trigger from OS
    
    Note over Native, Mobile: Phase 4: Hardware Alarm Trigger & Offline Fallback
    Note right of Native: Exact timestamp reached!
    Native->>Native: Wake Device (Full Screen Intent)
    Native->>Native: Play alarm.wav continuously (5 mins)
    Native-->>Mobile: User taps "Snooze 10m"
    Mobile->>Native: Cancel playing alarm
    Mobile->>API: PUT /api/tasks/:id/snooze
    alt Network Available
        API->>DB: Update snooze time
        API-->>Mobile: 200 OK
    else No Internet
        Mobile->>Mobile: Queue request in AsyncStorage (Offline Sync)
        Mobile->>Native: Re-schedule alarm for 10m later
    end
```

![alt text](<Cloud API Storage-2026-06-08-095013.png>)

## Detailed Workflow Breakdown

### 1. The Cross-Platform Real-Time Sync Loop
1. The **User** interacts with the **Web Extension** on their computer to quickly mark a task as completed.
2. The Web Extension sends a REST API `PUT` request to the **Backend (Node.js)**.
3. The Backend updates **MongoDB** and immediately fires a trigger to the **WebSocket Server (Socket.io)**.
4. The WebSocket Server instantly broadcasts a `taskUpdated` event to all connected clients.
5. The **Mobile App** (which is listening quietly in the background or foreground) catches this event inside `Dashboard.js`.
6. Using **React Functional State Updates** (`setTasks(prev => ...)`), the app updates its local UI instantly without stuttering or encountering race conditions.

### 2. The Native Hardware Notification Bridge
1. Every time the task list is updated (either locally or via WebSockets), the `syncLocalAlarms()` function is called.
2. The logic calculates the exact timestamp the alarm should go off based on the user's custom warning offset (e.g., "15 minutes before deadline").
3. The app communicates across the React Native Bridge to **Notifee**, configuring a custom **Android Notification Channel** designed specifically for alarms (`AndroidCategory.ALARM`, `AndroidImportance.HIGH`).
4. This channel has special permissions to bypass the phone's **Do Not Disturb** mode.
5. When the exact timestamp arrives, the phone wakes up automatically via a Full-Screen Intent.
6. The phone plays the native resource `alarm.wav` (which we generated as a 5-minute continuous loop file) loudly through the alarm audio stream.

### 3. The Offline Fallback Mechanism
1. If the user's phone has no internet connection, and the alarm goes off.
2. The user taps "Acknowledge" or "Snooze".
3. The app attempts to send an HTTP request to the Backend to sync this action.
4. If the request fails due to no network, the app sends the action to the **Offline Sync Engine**, which saves the pending request in `AsyncStorage`.
5. The local Notifee alarm is safely canceled so it stops ringing.
6. Once the phone regains cellular/WiFi connection, the app flushes the offline queue, syncing the Snooze/Acknowledge states back to the database.
