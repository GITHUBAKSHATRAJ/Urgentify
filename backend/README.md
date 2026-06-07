# SyncTask Backend API (Urgentify)

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

The robust, stateless backend API powering the **SyncTask (Urgentify)** ecosystem. It provides secure authentication and task management capabilities for multiple clients, including the Chrome Extension and the React Native Mobile App.

---

## 🚀 Features

- **Stateless Authentication:** Secure JWT-based login and registration.
- **Task Management:** Full CRUD operations for user-specific urgency tasks.
- **Urgency & Alarms:** Support for task deadlines, severity levels, and alarm acknowledgment.
- **Security:** Password hashing using bcrypt, custom error handling middleware, and route protection.
- **Cross-Platform:** Configured with robust CORS support to seamlessly handle requests from web extensions and mobile platforms.

---

## 🛠 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)
- **Security:** `bcryptjs` for password hashing, `cors` for cross-origin requests.

---

## 📂 Project Structure

```text
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route logic and business rules
│   ├── middleware/      # Express middlewares (Auth, Error, Validation)
│   ├── models/          # Mongoose database schemas (User, Task)
│   ├── routes/          # Express route definitions
│   ├── app.js           # Express app setup and middleware mounting
│   └── server.js        # Entry point and server initialization
├── docsJWT.md           # Deep dive into JWT Architecture
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables (not checked in)
```

---

## 💻 Installation & Local Development

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas URI)

### 2. Clone the repository
```bash
git clone <your-repository-url>
cd backend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
> **Warning:** Never commit your `.env` file to version control.

### 5. Start the Server
Run the application in development mode (with hot-reloading via Nodemon):
```bash
npm run dev
```
The server should now be running at `http://localhost:5000`.

---

## 🌐 API Reference

### Health Check
- `GET /api/health` - Check if the API is up and running.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | ❌ No |
| `POST` | `/login` | Authenticate user & get JWT | ❌ No |

### Tasks (`/api/tasks`)
*All task routes require a valid JWT passed in the `Authorization: Bearer <token>` header.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Fetch all tasks for the logged-in user |
| `POST` | `/` | Create a new task |
| `PUT` | `/:id` | Update an existing task |
| `DELETE` | `/:id` | Delete a task |
| `PATCH` | `/:id/ack` | Acknowledge a task alarm |

---

## 🔐 Authentication Deep Dive

This project utilizes **Stateless JWT Authentication**. The server does not store active session records. Instead, it issues a signed token to verified clients, who store the token locally and attach it manually to the headers of subsequent requests.

For an in-depth explanation of our JWT workflow, cryptographic algorithms, and security precautions, please refer to the comprehensive [JWT Documentation (docsJWT.md)](./docsJWT.md) file.
