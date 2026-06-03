# TaskTic - Backend API

TaskTic is a powerful team collaboration and task management platform. This repository contains the backend Node.js Express server, which powers the RESTful APIs, handles database interactions, and facilitates real-time socket communication.

## Extra Features

- **Authentication & Authorization**: Secure JWT-based authentication combined with Firebase integration. Supports Role-Based Access Control (Admin, Manager, Member).
- **Task Management API**: Full CRUD capabilities with secure validation to prevent unauthorized task reassignment and deletion.
- **AI Task Assistant**: Built-in NLP parsing endpoints allowing users to interact with their tasks using natural language.
- **Activity Logging**: Centralized logging system to track when tasks are created, updated, or re-assigned within a team.
- **Real-Time Communications**: Integrated `socket.io` for live chat features and real-time UI updates.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT & Firebase Admin SDK
- **Real-time**: Socket.io

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory (or in `src/.env` depending on your setup) and provide the following configuration:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/tasktic (or your Atlas URI)
   JWT_SECRET=your_super_secret_jwt_key
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The server will start listening on `http://localhost:4000`.

## Project Structure

- `/src/controllers` - Request handlers for routes (Auth, Tasks, Assistant, etc.)
- `/src/models` - Mongoose schemas defining the database structure.
- `/src/routes` - Express router definitions.
- `/src/middleware` - JWT validation and role-checking middlewares.
- `/src/socket` - WebSocket event handlers for real-time chat.
