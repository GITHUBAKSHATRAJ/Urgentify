# Urgentify Chrome Extension

This is the official Chrome Extension client for the Urgentify ecosystem. It serves as a visual urgency dashboard that directly replaces the "New Tab" page in Chrome, leveraging dynamic color-shifting and WebSockets to combat "deadline blindness".

## 🚀 Tech Stack

- **Frontend Library:** React 18
- **Bundler:** Vite (configured for Manifest V3)
- **Real-Time Engine:** Socket.io-client
- **Styling:** Modular Vanilla CSS
- **Architecture:** Folder-per-Component (Enterprise Standard)

## 📁 Architecture & React Concepts

This project strictly adheres to Enterprise React standards, utilizing the **Folder-per-Component** pattern. Every component lives in its own isolated directory containing its UI logic, CSS styles, and an `index.jsx` barrel export.

Key React patterns utilized in this codebase:
- **Container vs Presentational Components:** `Dashboard.jsx` acts as the "Smart Container" handling WebSockets and state, while children like `TaskCard.jsx` are purely "Presentational".
- **Controlled Components:** All inputs and forms (e.g., `Auth.jsx`, `TaskForm.jsx`) are strictly controlled by React state.
- **Inverse Data Flow:** Children bubble events up to parents rather than handling complex logic themselves.
- **Derived State:** Mathematical data (like the Overlap Timeline grid) is derived on the fly from props to prevent redundant `useState` bugs.

## 🛠️ How to Build & Install

Because this is a Manifest V3 Chrome Extension, you cannot just run a standard web server to view it. It must be built and loaded into Chrome.

### 1. Build the Extension
Whenever you make a change to the code, you must build the production bundle:
```bash
cd extension
npm run build
```
This will compile all your React code and output it into the `dist/` directory.

### 2. Load into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in the top right corner).
3. Click **Load unpacked** in the top left.
4. Select the `dist/` folder located inside the `extension/` directory (`Urgentify/extension/dist`).

### 3. Updating During Development
When you write new code, simply run `npm run build` again, then go back to `chrome://extensions/` and click the circular **Reload** (↻) button on the Urgentify extension card to see your changes!
