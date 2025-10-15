import { createHash } from 'crypto';
import { Plan, Phase, TaskAnalysis, EnhancedPhase, EnhancementOptions } from './types.js';
import { planTask } from './planner.js';
import { analyzeTask } from './analysis.js';
import { OpenAIEnhancementService } from './openaiService.js';

// In-memory store for plan enhancement progress
interface PlanEnhancementState {
  taskHash: string;
  basePlan: Plan;
  analysis: TaskAnalysis;
  enhancedPhases: { [phaseIndex: number]: EnhancedPhase | 'failed' };
  phaseStatuses: { [phaseIndex: number]: 'pending' | 'in_flight' | 'enhancing' | 'enhanced' | 'enhancement_failed' };
  progress: {
    current: number;
    total: number;
  };
  isComplete: boolean;
  startTime: number;
}

const planStates = new Map<string, PlanEnhancementState>();

// Generate a hash for the task
function generateTaskHash(task: string): string {
  const normalizedTask = task.toLowerCase().trim();
  return createHash('sha256').update(normalizedTask).digest('hex').substring(0, 16);
}


// Main orchestrator function
export async function generateCompletePlan(
  task: string,
  options: EnhancementOptions = {}
): Promise<{ plan: Plan; taskHash: string }> {
  // Step 1: Generate base plan immediately (rule-based)
  const basePlan = planTask(task);
  const taskHash = generateTaskHash(task);
  const analysis = analyzeTask(task);
  
  // Update generation method if API key is provided
  if (options.apiKey) {
    basePlan.generationMethod = 'hybrid';
  }

  // Step 2: Initialize enhancement state
  const enhancementState: PlanEnhancementState = {
    taskHash,
    basePlan,
    analysis,
    enhancedPhases: {},
    phaseStatuses: {},
    progress: {
      current: 0,
      total: basePlan.phases.length,
    },
    isComplete: false,
    startTime: Date.now(),
  };

  planStates.set(taskHash, enhancementState);

  // Step 3: Start background enhancement if API key is available
  if (options.apiKey) {
    console.log(` Starting AI enhancement...`);
    enhancePlanAsync(taskHash, options).catch(error => {
      console.error(' AI enhancement failed:', error);
    });
  } else {
    console.log(`No API key provided, skipping AI enhancement`);
  }

  return { plan: basePlan, taskHash };
}

// Background enhancement process
async function enhancePlanAsync(
  taskHash: string,
  options: EnhancementOptions
): Promise<void> {
  const state = planStates.get(taskHash);
  if (!state) {
    console.error('Plan state not found for taskHash:', taskHash);
    return;
  }

  const service = new OpenAIEnhancementService(options.apiKey);
  console.log('🚀 Starting batch enhancement for all phases...');
  
  // Set all phases to enhancing status
  for (let i = 0; i < state.basePlan.phases.length; i++) {
    state.phaseStatuses[i] = 'enhancing';
  }
  
  try {
    // Enhance all phases in a single API call
    const batchResults = await service.enhanceAllPhases(
      state.basePlan.phases,
      state.basePlan.task,
      state.analysis,
      {
        model: options.model || 'gpt-5-nano', // Cheapest model - $0.05/$0.40 per 1M tokens
        maxTokens: options.maxTokens || 2000, // Increased for batch processing
        temperature: options.temperature || 0.1, // Lower for consistency
      }
    );

    // Process batch results
    for (let i = 0; i < state.basePlan.phases.length; i++) {
      const phase = state.basePlan.phases[i];
      const enhanced = batchResults[i];
      
      if (phase && enhanced) {
        // Convert to EnhancedPhase format
        const enhancedPhase: EnhancedPhase = {
          id: phase.id,
          name: phase.name,
          description: enhanced.description,
          reasoning: enhanced.reasoning,
          files: enhanced.files,
          estimatedTime: phase.estimatedTime,
        };

        state.enhancedPhases[i] = enhancedPhase;
        state.phaseStatuses[i] = 'enhanced';
        console.log(`✅ Phase ${i + 1}: "${phase.name}" enhanced successfully`);
      } else {
        console.error(`❌ Phase ${i + 1}: "${phase?.name || 'Unknown'}" enhancement failed`);
        state.phaseStatuses[i] = 'enhancement_failed';
      }
    }
    
    // Update progress to completion
    state.progress.current = state.basePlan.phases.length;
    
  } catch (error) {
    console.error('❌ Batch enhancement failed:', error);
    
    // Mark all phases as failed
    for (let i = 0; i < state.basePlan.phases.length; i++) {
      state.phaseStatuses[i] = 'enhancement_failed';
    }
    state.progress.current = state.basePlan.phases.length;
  }

  // Mark as complete
  state.isComplete = true;
  state.progress.current = state.basePlan.phases.length;
  
  console.log(`AI enhancement complete: ${Object.keys(state.enhancedPhases).length}/${state.basePlan.phases.length} phases enhanced`);
}

// Reconciliation pass removed for better performance and cost efficiency

// Get plan status
export function getPlanStatus(taskHash: string) {
  const state = planStates.get(taskHash);
  if (!state) {
    return null;
  }

  return {
    taskHash: state.taskHash,
    basePlan: state.basePlan,
    enhancedPhases: state.enhancedPhases,
    phaseStatuses: state.phaseStatuses,
    progress: state.progress,
  };
}

// Clean up old plan states (call periodically)
export function cleanupOldPlans(maxAge: number = 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [taskHash, state] of planStates.entries()) {
    if (now - state.startTime > maxAge) {
      planStates.delete(taskHash);
    }
  }
}

// Get enhancement statistics
export function getEnhancementStats(): {
  totalPlans: number;
  completedPlans: number;
  averagePhases: number;
} {
  const states = Array.from(planStates.values());
  const completedPlans = states.filter(s => s.isComplete).length;
  const totalPhases = states.reduce((sum, s) => sum + s.basePlan.phases.length, 0);
  
  return {
    totalPlans: states.length,
    completedPlans,
    averagePhases: states.length > 0 ? totalPhases / states.length : 0,
  };
}
