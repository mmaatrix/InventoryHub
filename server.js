import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import itemRoutes from './src/routes/itemRoutes.js';
import { ok, fail } from './src/utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, 'web')));

// API Routes
app.use('/api/items', itemRoutes);

// Health Check
app.get('/health', (req, res) => res.json(ok({ status: 'healthy' })));

// Fallback to index.html for SPA (if any) or root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(fail('Internal Server Error', 'INTERNAL_ERROR'));
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`InventoryHub API listening on http://localhost:${PORT}`);
  });
}

export default app;
