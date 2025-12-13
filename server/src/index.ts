import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import config from './config/config';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import agentRoutes from './routes/agent.routes';
import candidateRoutes from './routes/candidate.routes';
import callRoutes from './routes/call.routes';
import path from 'path';  
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite dev server ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser(config.cookie.secret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/calls', callRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use("/", express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});



app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
