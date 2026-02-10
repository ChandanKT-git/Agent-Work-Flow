# AgentFlow — Agent Task Distribution App

A full-stack **MERN** application that allows an admin to log in, manage agents, upload CSV/XLSX files, and distribute list items equally among agents.

---

## Features

- **Admin Login** — JWT-based authentication with email & password
- **Agent Management** — Create, read, update, and delete agents (name, email, mobile with country code, password)
- **CSV/XLSX Upload & Distribution** — Upload a file, validate its format, and distribute items equally among all agents
- **Responsive UI** — Modern dark-themed interface with animations and glassmorphism

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React 18, Vite, React Router  |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB (Mongoose ODM)        |
| Auth       | JSON Web Tokens (JWT)         |
| File Parse | xlsx (SheetJS)                |
| Styling    | Vanilla CSS (dark theme)      |

---

## Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** running locally (or a MongoDB Atlas connection string)

---

## Project Structure

```
Assignment/
├── server/                 # Express backend
│   ├── models/             # Mongoose schemas (User, Agent, ListItem)
│   ├── routes/             # API routes (auth, agents, lists)
│   ├── middleware/          # JWT auth & Multer upload
│   ├── server.js           # Entry point
│   ├── seed.js             # Seed default admin user
│   └── .env                # Environment variables
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, ProtectedRoute
│   │   ├── context/        # AuthContext (JWT state)
│   │   ├── pages/          # Login, Dashboard, Agents, UploadList
│   │   └── index.css       # Global styles
│   └── index.html
└── README.md
```

---

## Setup & Run

### 1. Clone the repository

```bash
git clone <repo-url>
cd Assignment
```

### 2. Configure environment variables

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/agent-distribution
JWT_SECRET=my_super_secret_jwt_key_2024
```

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Seed the admin user

```bash
cd server
npm run seed
```

This creates a default admin:
- **Email:** `admin@example.com`
- **Password:** `admin123`

### 5. Start the application

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm start

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

### 6. Open in browser

Navigate to **http://localhost:5173** and log in with the default credentials.

---

## API Endpoints

| Method | Endpoint              | Description                    | Auth     |
|--------|-----------------------|-------------------------------|----------|
| POST   | `/api/auth/login`     | Login and receive JWT          | Public   |
| GET    | `/api/agents`         | List all agents                | Required |
| POST   | `/api/agents`         | Create a new agent             | Required |
| PUT    | `/api/agents/:id`     | Update an agent                | Required |
| DELETE | `/api/agents/:id`     | Delete an agent                | Required |
| POST   | `/api/lists/upload`   | Upload & distribute a file     | Required |
| GET    | `/api/lists`          | Get distributed items          | Required |
| GET    | `/api/health`         | Health check                   | Public   |

---

## CSV File Format

The uploaded file must contain these columns:

| Column      | Type   | Required |
|-------------|--------|----------|
| FirstName   | Text   | Yes      |
| Phone       | Number | Yes      |
| Notes       | Text   | No       |

**Accepted file types:** `.csv`, `.xlsx`, `.xls`

### Distribution Algorithm

Items are distributed equally among **all agents** in the system:

- `baseCount = floor(totalItems / totalAgents)`
- First `remainder` agents receive `baseCount + 1` items
- Remaining agents receive `baseCount` items

---

## Default Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@example.com  | admin123  |
