import mongoose from 'mongoose';
import app from './app.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected || !process.env.MONGODB_URI) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    // Don't throw - allow app to start for health checks
  }
};

// Vercel serverless export
export default async (req, res) => {
  await connectDB();
  return app(req, res);
};

// Local development server
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
    process.on('SIGTERM', () => server.close());
    process.on('SIGINT', () => server.close());
  });
}
