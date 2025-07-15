import dotenv from 'dotenv';
dotenv.config(); // ✅ load .env before anything else

import app from './src/app'; // ⛔️ don't include `.js` or `.ts` — let TS/Node resolve it

import apiRouter from './src/routes/userRoutes';

const PORT = process.env.PORT || 3000;

app.use('/', apiRouter);

app.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
  console.log(`🔗 Access at http://localhost:${PORT}`);
});
