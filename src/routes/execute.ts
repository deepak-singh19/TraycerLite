import { Router } from 'express';
import { runAgent } from '../agent.js';
import { ExecuteRequest, ExecuteResponse } from '../types.js';

const router = Router();

// POST /execute - Execute a phase
router.post('/execute', async (req, res) => {
  try {
    const { step }: ExecuteRequest = req.body;
    
    if (!step) {
      return res.status(400).json({ 
        error: 'Step is required' 
      });
    }

    const result = await runAgent(step);
    
    const response: ExecuteResponse = {
      result,
    };

    return res.json(response);
  } catch (error) {
    console.error('Error executing phase:', error);
    return res.status(500).json({ 
      error: 'Failed to execute phase',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
