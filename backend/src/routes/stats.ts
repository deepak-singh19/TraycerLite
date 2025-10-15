import { Router } from 'express';
import { getEnhancementStats, cleanupOldPlans } from '../planOrchestrator.js';

const router = Router();

// GET /stats - Get enhancement statistics
router.get('/stats', (req, res) => {
  try {
    const stats = getEnhancementStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({ 
      error: 'Failed to get statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /cleanup - Clean up old plans (admin endpoint)
router.post('/cleanup', (req, res) => {
  try {
    const maxAge = req.body.maxAge || 60 * 60 * 1000; // Default 1 hour
    cleanupOldPlans(maxAge);
    return res.json({ 
      success: true, 
      message: 'Old plans cleaned up successfully' 
    });
  } catch (error) {
    console.error('Error cleaning up plans:', error);
    return res.status(500).json({ 
      error: 'Failed to cleanup plans',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
