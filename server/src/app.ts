import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


// Middleware
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Something broke!' });
});

export default app;
