# 📚 Book Library Management System

A full-stack, responsive web application for managing library books, tracking availability status, filtering/searching records, and handling user authentication. Built with **React (Vite)**, **Node.js**, **Express.js**, and **MongoDB / Mongoose**.

---

## 🌟 Key Features

- **User Authentication**:
  - Secure **Sign Up** & **Login** with password hashing (`bcryptjs`) and JWT token authentication.
  - 1-Click **Demo Login** shortcut for instant evaluation.
- **Book Catalog Management**:
  - Add new book records (Title, Author, Category, Status, ISBN, Description).
  - Edit existing book details with instant preview.
  - Delete books with confirmation safeguard modal.
- **Availability Tracking**:
  - 1-Click status toggle between **`Available`** (emerald indicator) and **`Issued`** (amber indicator).
  - Optimistic UI updates with toast feedback.
- **Live Search & Filter**:
  - Instant client and server-side search across Title, Author, and Category.
  - Status filter tabs (**All**, **Available**, **Issued**).
  - Category filter chips and multi-criteria sorting (Newest, Oldest, Title A-Z, Author A-Z).
- **Dashboard Metrics**:
  - Real-time counters for Total Books, Available Now, Currently Issued, and Category count.
- **Dual-Mode Backend Architecture**:
  - Primary: Connects to **MongoDB Atlas** / local MongoDB with full Mongoose schemas and models.
  - Resilient Fallback: If MongoDB is offline, automatically activates an in-memory datastore with pre-seeded sample books so development and testing never stall.

---

## 📁 Project Structure

```text
Project_4_GloWLOGIC/
├── PROJECT_BRIEF.md         # Project requirements & specification
├── README.md                # Project documentation & run guide
├── backend/                 # Node.js + Express REST API
│   ├── .env                 # Environment configuration (PORT, MONGODB_URI, JWT_SECRET)
│   ├── .env.example         # Example environment template
│   ├── server.js            # Express application entry point
│   ├── config/
│   │   └── db.js            # Mongoose MongoDB connection
│   ├── models/
│   │   ├── User.js          # Mongoose User model with bcrypt pre-save hook
│   │   └── Book.js          # Mongoose Book model with schema & text indexes
│   ├── controllers/
│   │   ├── authController.js# Signup, login, & user profile logic
│   │   └── bookController.js# Book CRUD, search, status toggle, & seeder
│   ├── routes/
│   │   ├── authRoutes.js    # /api/auth routes
│   │   └── bookRoutes.js    # /api/books routes
│   └── middleware/
│       ├── authMiddleware.js# JWT verification middleware
│       └── errorHandler.js  # Global error & 404 handlers
└── frontend/                # React 19 + Vite application
    ├── .env                 # VITE_API_URL
    ├── .env.example         # Example environment template
    ├── index.html           # HTML entry point with Google Fonts
    ├── vite.config.js       # Vite bundler configuration (port 5173)
    └── src/
        ├── main.jsx         # React DOM root
        ├── App.jsx          # Main application component & state management
        ├── index.css        # Glassmorphic dark styling & micro-animations
        ├── services/
        │   └── api.js       # REST API client with fetch & auth headers
        └── components/
            ├── Navbar.jsx        # Navigation, brand, and user account pill
            ├── StatsOverview.jsx # Statistics counter cards
            ├── FilterBar.jsx     # Live search bar, category chips & status tabs
            ├── BookCard.jsx      # Book item card with status toggle & actions
            ├── BookFormModal.jsx # Add/Edit modal with field validation
            ├── AuthModal.jsx     # Login/Register modal with 1-click Demo Login
            └── Toast.jsx         # Toast notification system
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or newer recommended, tested on v24.18)
- **npm** (v9 or newer)
- **MongoDB** (optional: local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

---

### 1. Run the Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend server will start on **`http://localhost:5000`**.

> **Note on MongoDB**:
> - To connect to your MongoDB Atlas cluster, update `MONGODB_URI` in [backend/.env](file:///c:/Users/SAHANA%20H%20JAIN/OneDrive/Documents/Desktop/Sahana/Project_4_GloWLOGIC/backend/.env):
>   ```env
>   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/library_db?retryWrites=true&w=majority
>   ```
> - If no MongoDB server is currently running, the backend seamlessly switches to its built-in memory datastore with sample books, allowing you to test immediately without configuring a database.

---

### 2. Run the Frontend Client

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser to interact with the Book Library Management System.

---

## 📡 REST API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | `{ "email": "...", "password": "..." }` |
| `GET` | `/api/auth/me` | Fetch logged in user's profile | Requires `Authorization: Bearer <token>` |

### Books Endpoints (`/api/books`)

| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/books` | List books with search & filter | Query: `?search=...&category=...&status=...&sortBy=...` |
| `POST` | `/api/books` | Create a new book record | Body: `{ "title", "author", "category", "status", "isbn", "description" }` |
| `GET` | `/api/books/:id` | Fetch single book by ID | URL parameter `:id` |
| `PUT` | `/api/books/:id` | Update book details | Body: fields to update |
| `PATCH`| `/api/books/:id/status`| Toggle status (`Available` ↔ `Issued`) | URL parameter `:id` |
| `DELETE`| `/api/books/:id`| Remove a book record | URL parameter `:id` |
| `POST` | `/api/books/seed` | Seed initial sample books | None |
