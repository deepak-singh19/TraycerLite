import { Router } from 'express';
import { analyzeTask } from '../analysis.js';

const router = Router();

// POST /analyze - Analyze task and get technology recommendations
router.post('/analyze', async (req, res) => {
  try {
    const { task } = req.body;
    
    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Task is required and must be a non-empty string' 
      });
    }

    const analysis = analyzeTask(task);
    
    return res.json(analysis);
  } catch (error) {
    console.error('Error analyzing task:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
