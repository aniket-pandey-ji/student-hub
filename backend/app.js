import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { AppError } from './utils/AppError.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Vercel compatibility
  crossOriginEmbedderPolicy: false
}));

// CORS - allow your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests' }
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

// Auth routes (minimal working version)
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    // In production: save to MongoDB here
    res.status(201).json({ 
      success: true,       message: 'User registered',
      data: { accessToken: 'demo-token-' + Date.now() }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    // In production: verify against MongoDB here
    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      data: { accessToken: 'demo-token-' + Date.now() }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/auth/refresh', (req, res) => {
  res.status(200).json({ 
    success: true, 
    data: { accessToken: 'demo-token-' + Date.now() } 
  });
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
});

// 404 handler for API routes
app.all('/api/*', (req, res, next) => {
  next(new AppError(`API route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' && status >= 500 
      ? 'Internal server error'       : err.message
  });
});

export default app;
