import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();

app.disable('x-powered-by');

// Em produção o frontend e a API ficam no mesmo domínio (via Nginx) e o CORS não é usado.
// Só libera outras origens quando CORS_ORIGIN estiver definido.
if (config.corsOrigins.length > 0) {
  app.use(cors({ origin: config.corsOrigins }));
}

app.use(express.json({ limit: '10kb' }));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);
