// apps/backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import gatewayRoutes from './routes/gateway';
import intelRoutes from './routes/intel';
import devsecopsRoutes from './routes/devsecops';
import runtimeRoutes from './routes/runtime';
import orchestrationRoutes from './routes/orchestration';
import deploymentRoutes from './routes/deployment';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Attach io to req for routes to use
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

app.use('/api/gateway', gatewayRoutes);
app.use('/api/intel', intelRoutes);
app.use('/api/devsecops', devsecopsRoutes);
app.use('/api/runtime', runtimeRoutes);
app.use('/api/orchestration', orchestrationRoutes);
app.use('/api/deployment', deploymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', agents: 5 });
});

// Serve frontend static files
// Resolve to the root workspace 'dist' directory
const frontendPath = path.join(__dirname, '../../../dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  // Exclude /api routes from being caught by the static file server fallback
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', (channel) => {
    socket.join(channel);
    console.log(`Socket ${socket.id} joined channel ${channel}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`CyberMesh Backend API Gateway running on port ${PORT}`);
  
  // Start the orchestrator within the same process
  try {
    require('../../../services/nexus-orchestrator/src/index');
    console.log('Orchestrator successfully loaded in single-app mode.');
  } catch (error) {
    console.error('Failed to load orchestrator:', error);
  }
});
