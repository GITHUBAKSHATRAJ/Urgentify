# System Architecture & Design Document

This document outlines the High-Level Design (HLD) and Low-Level Design (LLD) for the Urgentify backend system, ensuring adherence to core Software Development Life Cycle (SDLC) principles.

---

## 1. High-Level Design (HLD)

### 1.1 Architecture Overview
The backend follows a standard **MVC (Model-View-Controller) inspired architectural pattern** (specifically, Route-Controller-Model since the View is handled by external clients). It operates as a stateless RESTful API built on Node.js and Express.

**Key Components:**
- **Clients:** Chrome Extension (PC) and Mobile App (React Native).
- **API Gateway/Server:** Express.js application handling incoming HTTP requests.
- **Database:** MongoDB (via Mongoose) for persistent data storage.

### 1.2 System Interaction Flow
1. **Authentication:** Clients send credentials to the Auth routes. The backend validates against MongoDB and returns a stateless JWT.
2. **Task Management:** Clients send JWT-secured requests to create, update, or fetch tasks. The backend validates the payload, queries MongoDB, and returns JSON.
3. **Background Sync:** The mobile app polls the backend REST API every 15 minutes to fetch missed tasks and schedule local OS-level alarms.

### 1.3 SDLC Core Principles Followed
*   **Separation of Concerns:** Routes define paths, Controllers contain business logic, Models define data schemas, and Middlewares handle cross-cutting concerns (auth, validation, error handling).
*   **Modularity:** The codebase is split into specific domains (`auth`, `task`), making it highly scalable and easy for teams to work on concurrently.
*   **Maintainability:** All core API functions use explicitly **Named Functions** (e.g., `async function getTasks()`) to provide crystal-clear stack traces in production error logs, eliminating the ambiguity of anonymous arrow functions in deep callback chains.

---

## 2. Low-Level Design (LLD)

### 2.1 Database Schemas (Models)

#### User Schema (`User.js`)
- `_id`: ObjectId
- `email`: String (Unique, Required)
- `password`: String (Hashed via bcrypt)
- `createdAt`: Date

#### Task Schema (`Task.js`)
- `_id`: ObjectId
- `userId`: ObjectId (Ref: 'User')
- `title`: String (Required, Max 100 char)
- `description`: String
- `startDate`: Date
- `deadline`: Date (Required)
- `severity`: String (Enum: ['low', 'mid', 'high'])
- `isCompleted`: Boolean (Default: false)
- `alarmAcknowledged`: Boolean (Default: false)
- `mobileSynced`: Boolean (Default: false) - *Used for cross-device sync state*

### 2.2 Core Components

#### Controllers (`src/controllers/`)
*   **`authController.js`**: 
    *   `registerUser(req, res)`: Hashes password, saves user, generates JWT.
    *   `loginUser(req, res)`: Verifies password, generates JWT.
*   **`taskController.js`**: 
    *   `getTasks(req, res)`: Returns sorted tasks for the authenticated user.
    *   `createTask(req, res)`: Inserts new task linked to `req.user._id`.
    *   `acknowledgeAlarm(req, res)`: Sets `alarmAcknowledged` to true.

#### Middleware (`src/middleware/`)
*   **`authMiddleware.js`**: `protect()` validates the JWT and attaches the resolved `User` object to `req.user`.
*   **`validationMiddleware.js`**: Provides declarative payload validation functions (`validateRegister`, `validateTask`) preventing malformed data from reaching the controllers.
*   **`errorMiddleware.js`**: `errorHandler()` acts as a global catch block, parsing Mongoose validation errors, duplicate keys, and JWT errors into unified JSON responses.
