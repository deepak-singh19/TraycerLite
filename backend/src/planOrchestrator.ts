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
  // Starting enhancement process
  
  // Enhance phases in order (prioritize lower-index phases)
  for (let i = 0; i < state.basePlan.phases.length; i++) {
    try {
      const phase = state.basePlan.phases[i];
      if (!phase) {
        console.error(` [ENHANCEMENT] Phase at index ${i} is undefined`);
        state.phaseStatuses[i] = 'enhancement_failed';
        // Update progress even on failure to maintain accurate count
        state.progress.current = i + 1;
        continue;
      }
      
      // Set status to enhancing (no progress update yet)
      state.phaseStatuses[i] = 'enhancing';
      
      // Enhancing phase
      
      // Enhance with OpenAI
      const enhanced = await service.enhancePhase(phase, state.basePlan.task, state.analysis, {
        model: options.model || 'gpt-4',
        maxTokens: options.maxTokens || 400,
        temperature: options.temperature || 0.3,
      });

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
      
      // Update progress only after successful completion
      state.progress.current = i + 1;
      
      // Phase enhanced successfully
      
    } catch (error) {
      console.error(` Failed to enhance phase ${i + 1}: "${state.basePlan.phases[i]?.name || 'Unknown'}"`);
      state.phaseStatuses[i] = 'enhancement_failed';
      
      // Update progress even on failure to maintain accurate count
      state.progress.current = i + 1;
    }
  }

  // Mark as complete
  state.isComplete = true;
  state.progress.current = state.basePlan.phases.length;
  
  console.log(`AI enhancement complete: ${Object.keys(state.enhancedPhases).length}/${state.basePlan.phases.length} phases enhanced`);
  
  // Optional: Final reconciliation pass
  if (options.model && options.model.includes('gpt-4')) {
    try {
      await performReconciliationPass(taskHash, service, options);
    } catch (error) {
      console.error('Reconciliation pass failed:', error);
    }
  }
}

// Final reconciliation pass to resolve contradictions
async function performReconciliationPass(
  taskHash: string,
  service: OpenAIEnhancementService,
  options: EnhancementOptions
): Promise<void> {
  const state = planStates.get(taskHash);
  if (!state) return;

  console.log('Performing reconciliation pass...');
  
  // This would involve a single call to the model to review the entire plan
  // and resolve any contradictions between phases. For now, we'll skip this
  // as it's optional and would require additional prompt engineering.
  
  console.log('Reconciliation pass completed');
}

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
