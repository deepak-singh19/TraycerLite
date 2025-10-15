// Test script to see LLM responses
// This script reads OPENAI_API_KEY from environment variables
import { OpenAIEnhancementService } from '../dist/openaiService.js';
import { planTask } from '../dist/planner.js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '../../.env.local' });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
  console.error('Please create a .env.local file in the project root with:');
  console.error('OPENAI_API_KEY=your-api-key-here');
  process.exit(1);
}

async function testLLMResponse() {
  console.log('🧪 Testing LLM Response...\n');
  
  const task = 'create simple counter with context api';
  const plan = planTask(task);
  const service = new OpenAIEnhancementService(apiKey);
  
  console.log('📋 Generated Plan:');
  console.log('Task:', task);
  console.log('Phases:', plan.phases.map(p => p.name));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test the first phase
  const firstPhase = plan.phases[0];
  console.log('🎯 Testing enhancement for phase:', firstPhase.name);
  
  try {
    const enhanced = await service.enhancePhase(firstPhase, task, {
      projectType: 'web-app',
      features: ['frontend'],
      complexity: 'simple',
      hasAuth: false,
      hasDatabase: false,
      hasFrontend: true,
      hasBackend: false,
      hasRealtime: false,
    });
    
    console.log('\n✅ Enhancement successful!');
    console.log('Enhanced description:', enhanced.description);
    console.log('Enhanced reasoning:', enhanced.reasoning);
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
  }
}

testLLMResponse().catch(console.error);

