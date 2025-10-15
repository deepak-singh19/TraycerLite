import { ArrowLeft, Copy, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Plan, Phase, EnhancedPhase } from '../types';
import { PhaseCard } from './PhaseCard';
import { EnhancementBadge } from './EnhancementBadge';

interface PlanViewerProps {
  plan: Plan;
  enhancedPhases: { [phaseIndex: number]: EnhancedPhase | 'failed' };
  phaseStatuses: { [phaseIndex: number]: 'pending' | 'in_flight' | 'enhancing' | 'enhanced' | 'enhancement_failed' };
  progress: { current: number; total: number };
  onBack: () => void;
  onExecutePhase: (phase: Phase) => void;
  executionLogs: Array<{ stepId: string; success: boolean; output: string }>;
}

export function PlanViewer({
  plan,
  enhancedPhases,
  phaseStatuses,
  progress,
  onBack,
  onExecutePhase,
  executionLogs,
}: PlanViewerProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getExecutionResult = (phaseId: string) => {
    return executionLogs.find(log => log.stepId === phaseId);
  };

  // console.log(plan);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Input
            </button>
            <div className="flex items-center">
              <Zap className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Traycer Lite</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Implementation Plan</h2>
              <p className="text-gray-600">{plan.overview}</p>
              
              {/* Progressive Enhancement Status */}
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    {progress.current} of {progress.total} phases enhanced
                  </span>
                </div>
                {progress.current < progress.total && (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-600">AI enhancement in progress...</span>
                  </div>
                )}
              </div>
            </div>
            <EnhancementBadge progress={progress} />
          </div>

          {/* Tech Stack */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {plan.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Risks */}
          {plan.risks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Potential Risks</h3>
              <div className="space-y-1">
                {plan.risks.map((risk, index) => (
                  <div key={index} className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phases - Progressive Loading */}
        <div className="space-y-6">
          {plan.phases.map((phase, index) => {
            const enhancedPhase = enhancedPhases?.[index];
            const phaseStatus = phaseStatuses?.[index] || 'pending';
            const executionResult = getExecutionResult(phase.id);
            
            // Only show phases that are completed, enhanced, or currently being enhanced
            const shouldShowPhase = phaseStatus === 'enhanced' || 
                                  phaseStatus === 'enhancing' || 
                                  phaseStatus === 'enhancement_failed' ||
                                  enhancedPhase !== undefined;
            
            if (!shouldShowPhase) {
              return null;
            }
            
            return (
              <div key={phase.id} className="animate-fade-in">
                <PhaseCard
                  phase={phase}
                  enhancedPhase={enhancedPhase}
                  phaseStatus={phaseStatus}
                  phaseNumber={index + 1}
                  onExecute={() => onExecutePhase(phase)}
                  executionResult={executionResult}
                />
              </div>
            );
          })}
          
          {/* Show loading indicator for phases not yet enhanced */}
          {plan.phases.map((phase, index) => {
            const phaseStatus = phaseStatuses?.[index] || 'pending';
            const enhancedPhase = enhancedPhases?.[index];
            
            // Show loading card for phases that haven't been enhanced yet
            const shouldShowLoading = phaseStatus === 'pending' && 
                                    enhancedPhase === undefined &&
                                    index < progress.current + 1; // Show next phase being processed
            
            if (!shouldShowLoading) {
              return null;
            }
            
            return (
              <div key={`loading-${phase.id}`} className="border rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mr-3">
                      Phase {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                  </div>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm font-medium text-blue-600">Enhancing...</span>
                  </div>
                </div>
                <div className="text-gray-600">
                  <p>AI is enhancing this phase with detailed instructions and reasoning...</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Execution Logs */}
        {executionLogs.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Logs</h3>
            <div className="space-y-4">
              {executionLogs.map((log, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {log.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="font-medium text-gray-900">
                        Phase: {log.stepId}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(log.output)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {log.output}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
