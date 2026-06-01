import express from 'express';
import cors from 'cors';
import { pool } from './db.js';


console.log('DATABASE_URL set?', !!process.env.DATABASE_URL);

const app = express();
const port = process.env.PORT || 4000;
const corsOptions = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: corsOptions }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
});

app.listen(port, () => {
  console.log(`CondoPay API listening on port ${port}`);
});