import { Router } from 'express';
import healthRoutes from './health.js';
import analyzeRoutes from './analyze.js';
import planRoutes from './plan.js';
import executeRoutes from './execute.js';
import testConnectionRoutes from './test-connection.js';
import statsRoutes from './stats.js';

const router = Router();


router.use('/', healthRoutes);
router.use('/api', analyzeRoutes);
router.use('/api', planRoutes);
router.use('/api', executeRoutes);
router.use('/api', testConnectionRoutes);
router.use('/api', statsRoutes);

export default router;
