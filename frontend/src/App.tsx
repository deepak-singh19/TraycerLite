import { useState, useEffect } from 'react';
import { TaskInput } from './components/TaskInput';
import { PlanViewer } from './components/PlanViewer';
import { SettingsModal } from './components/SettingsModal';
import { usePlanStatus } from './hooks/usePlanStatus';
import { planApi } from './services/api';
import { AppState, AgentResult } from './types';

function App() {
  const [state, setState] = useState<AppState>({
    view: 'input',
    plan: null,
    taskHash: null,
    apiKey: '',
    enhancementProgress: null,
    isLoading: false,
    error: null,
    executionLogs: [],
    technologyRecommendations: null,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check for existing API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    setState(prev => ({ ...prev, apiKey: savedKey || '' }));
  }, []);

  // Use plan status hook when we have a taskHash
  const { status: planStatus } = usePlanStatus(
    state.taskHash,
    state.view === 'plan' && !!state.taskHash
  );

  // Update state when plan status changes
  useEffect(() => {
    if (planStatus) {
      setState(prev => ({
        ...prev,
        enhancementProgress: planStatus.progress,
      }));
    }
  }, [planStatus]);

  const handleGeneratePlan = async (task: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await planApi.generatePlan(task);
      
      setState(prev => ({
        ...prev,
        view: 'plan',
        plan: response.plan,
        taskHash: response.taskHash,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate plan',
      }));
    }
  };

  const handleExecutePhase = async (phase: any) => {
    try {
      const response = await planApi.executePhase(phase);
      
      setState(prev => ({
        ...prev,
        executionLogs: [...prev.executionLogs, response.result],
      }));
    } catch (error) {
      const errorResult: AgentResult = {
        stepId: phase.id,
        success: false,
        output: error instanceof Error ? error.message : 'Execution failed',
      };
      
      setState(prev => ({
        ...prev,
        executionLogs: [...prev.executionLogs, errorResult],
      }));
    }
  };

  const handleBackToInput = () => {
    setState({
      view: 'input',
      plan: null,
      taskHash: null,
      apiKey: state.apiKey,
      enhancementProgress: null,
      isLoading: false,
      error: null,
      executionLogs: [],
      technologyRecommendations: null,
    });
  };

  const handleApiKeyChange = (hasKey: boolean) => {
    setState(prev => ({ ...prev, apiKey: hasKey ? 'present' : '' }));
  };

  const hasApiKey = !!state.apiKey;

  return (
    <div className="App">
      {state.view === 'input' && (
        <TaskInput
          onSubmit={handleGeneratePlan}
          isLoading={state.isLoading}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasApiKey={hasApiKey}
        />
      )}

      {state.view === 'plan' && state.plan && planStatus && (
        <PlanViewer
          plan={state.plan}
          enhancedPhases={planStatus.enhancedPhases}
          phaseStatuses={planStatus.phaseStatuses}
          progress={planStatus.progress}
          onBack={handleBackToInput}
          onExecutePhase={handleExecutePhase}
          executionLogs={state.executionLogs}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApiKeyChange={handleApiKeyChange}
      />

      {/* Error Display */}
      {state.error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{state.error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
