import { Router } from 'express';
import { generateCompletePlan, getPlanStatus } from '../planOrchestrator.js';
import { PlanRequest, PlanResponse, PlanStatusResponse } from '../types.js';

const router = Router();

// POST /plan - Generate a new plan
router.post('/plan', async (req, res) => {
  try {
    const { task }: PlanRequest = req.body;
    
    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Task is required and must be a non-empty string' 
      });
    }

    // Check for API key in request (for demo mode)
    const apiKey = req.headers['x-openai-api-key'] as string;
    const envApiKey = process.env.OPENAI_API_KEY;
    
    const result = await generateCompletePlan(task, {
      apiKey: apiKey || envApiKey,
      model: 'gpt-4',
      maxTokens: 400,
      temperature: 0.3,
      maxConcurrency: 3,
    });

    const response: PlanResponse = {
      plan: result.plan,
      taskHash: result.taskHash,
    };

    return res.json(response);
  } catch (error) {
    console.error('Error generating plan:', error);
    return res.status(500).json({ 
      error: 'Failed to generate plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /plan-status - Get plan enhancement status
router.get('/plan-status', async (req, res) => {
  try {
    const { taskHash } = req.query;
    
    if (!taskHash || typeof taskHash !== 'string') {
      return res.status(400).json({ 
        error: 'taskHash query parameter is required' 
      });
    }

    const status = getPlanStatus(taskHash);
    
    if (!status) {
      return res.status(404).json({ 
        error: 'Plan not found or expired' 
      });
    }

    const response: PlanStatusResponse = {
      taskHash: status.taskHash,
      basePlan: status.basePlan,
      enhancedPhases: status.enhancedPhases,
      phaseStatuses: status.phaseStatuses,
      progress: status.progress,
    };

    return res.json(response);
  } catch (error) {
    console.error('Error getting plan status:', error);
    return res.status(500).json({ 
      error: 'Failed to get plan status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
