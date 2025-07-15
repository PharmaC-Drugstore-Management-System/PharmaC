import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt'

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

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
