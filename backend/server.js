import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome / Health check route
app.get('/', (req, res) => {
  res.json({
    message: '📚 Book Library Management System API is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      books: {
        getAll: 'GET /api/books (supports ?search= &category= &status= &sortBy=)',
        create: 'POST /api/books',
        getById: 'GET /api/books/:id',
        update: 'PUT /api/books/:id',
        toggleStatus: 'PATCH /api/books/:id/status',
        delete: 'DELETE /api/books/:id',
        seed: 'POST /api/books/seed',
      },
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`👉 API Docs / Health: http://localhost:${PORT}`);
});

export default app;
