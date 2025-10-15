import { Router } from 'express';
import { OpenAIEnhancementService } from '../openaiService.js';

const router = Router();

// POST /test-connection - Test OpenAI API key connection
router.post('/test-connection', async (req, res) => {
  try {
    const apiKey = req.headers['x-openai-api-key'] as string;
    const envApiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey && !envApiKey) {
      return res.status(400).json({ 
        error: 'API key is required' 
      });
    }

    const service = new OpenAIEnhancementService(apiKey || envApiKey);
    const isValid = await service.testConnection();

    if (isValid) {
      return res.json({ 
        success: true, 
        message: 'API key is valid and working!' 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'API key test failed. Please check your key.' 
      });
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Connection failed. Please check your internet connection.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
