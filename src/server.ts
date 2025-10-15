import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { cleanupOldPlans } from './planOrchestrator.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount all routes
app.use(routes);

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Traycer Lite Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs:`);
  console.log(`   POST /api/test-connection - Test OpenAI API key`);
  console.log(`   POST /api/analyze - Analyze task and get technology recommendations`);
  console.log(`   POST /api/plan - Generate a new plan`);
  console.log(`   GET  /api/plan-status?taskHash=... - Get plan status`);
  console.log(`   POST /api/execute - Execute a phase`);
  console.log(`   GET  /api/stats - Get enhancement statistics`);
  console.log(`   POST /api/cleanup - Clean up old plans`);
  
  // Clean up old plans every hour
  setInterval(() => {
    cleanupOldPlans(60 * 60 * 1000); // 1 hour
  }, 60 * 60 * 1000);
});

export default app;