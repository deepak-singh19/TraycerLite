import { useState } from 'react';
import { ChevronDown, ChevronRight, Play, FileText, Clock, AlertCircle, CheckCircle, Building2, Shield, Zap, Code, Rocket } from 'lucide-react';
import { Phase, EnhancedPhase } from '../types';

interface PhaseCardProps {
  phase: Phase;
  enhancedPhase?: EnhancedPhase | 'failed';
  phaseStatus?: 'pending' | 'in_flight' | 'enhancing' | 'enhanced' | 'enhancement_failed';
  phaseNumber: number;
  onExecute: () => void;
  executionResult?: { stepId: string; success: boolean; output: string };
  isBasePlan?: boolean;
}

export function PhaseCard({
  phase,
  enhancedPhase,
  phaseStatus,
  phaseNumber,
  onExecute,
  executionResult,
  isBasePlan = false,
}: PhaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (executionResult) {
      return executionResult.success ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500" />
      );
    }

    switch (phaseStatus) {
      case 'enhancement_failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'enhanced':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'enhancing':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'in_flight':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (executionResult) {
      return executionResult.success ? 'Executed' : 'Execution Failed';
    }

    switch (phaseStatus) {
      case 'enhancement_failed':
        return 'Enhancement Failed';
      case 'enhanced':
        return 'Enhanced';
      case 'enhancing':
        return 'Enhancing...';
      case 'in_flight':
        return 'In Progress...';
      case 'pending':
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    if (executionResult) {
      return executionResult.success ? 'text-green-600' : 'text-red-600';
    }

    switch (phaseStatus) {
      case 'enhancement_failed':
        return 'text-red-600';
      case 'enhanced':
        return 'text-green-600';
      case 'enhancing':
        return 'text-blue-600';
      case 'in_flight':
        return 'text-blue-600';
      case 'pending':
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Phase Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-left"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400 mr-3" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mr-3">
                  Phase {phaseNumber}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                {isBasePlan && phaseStatus === 'enhancing' && (
                  <div className="ml-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-600 font-medium">Enhancing...</span>
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {getStatusIcon()}
              <span className={`ml-2 text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>

            {phase.estimatedTime && (
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {phase.estimatedTime}
              </div>
            )}

            <button
              onClick={onExecute}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Agent
            </button>
          </div>
        </div>

        {/* Phase Description */}
        <div className="mt-4">
          <p className="text-gray-600">
            {enhancedPhase && enhancedPhase !== 'failed' 
              ? enhancedPhase.description 
              : phase.description
            }
          </p>
        </div>

        {/* Dependencies */}
        {phase.dependencies.length > 0 && (
          <div className="mt-3">
            <span className="text-sm text-gray-500">Depends on: </span>
            {phase.dependencies.map((dep, index) => (
              <span key={dep} className="text-sm text-blue-600">
                {dep}
                {index < phase.dependencies.length - 1 && ', '}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-6">
          {/* Base Plan Enhancement Notice */}
          {isBasePlan && phaseStatus === 'enhancing' && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">AI Enhancement in Progress</h4>
                  <p className="text-sm text-blue-600">This phase is being enhanced with detailed architectural guidance...</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Reasoning */}
          {enhancedPhase && enhancedPhase !== 'failed' && enhancedPhase.reasoning && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">AI Reasoning</h4>
              <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                {enhancedPhase.reasoning}
              </p>
            </div>
          )}

          {/* Architecture & Implementation Details */}
          {enhancedPhase && enhancedPhase !== 'failed' && enhancedPhase.architecture && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Architecture & Implementation
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Architecture Patterns */}
                <div className="bg-white p-4 rounded border">
                  <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    Design Patterns
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {enhancedPhase.architecture.patterns.map((pattern, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Security Measures */}
                <div className="bg-white p-4 rounded border">
                  <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Security Measures
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {enhancedPhase.architecture.security_measures.map((measure, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {measure}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Performance Optimizations */}
                <div className="bg-white p-4 rounded border">
                  <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Performance
                  </h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {enhancedPhase.architecture.performance_optimizations.map((opt, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scalability Approach */}
                <div className="bg-white p-4 rounded border">
                  <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                    <Rocket className="w-4 h-4 mr-1" />
                    Scalability
                  </h5>
                  <p className="text-sm text-gray-600">
                    {enhancedPhase.architecture.scalability_approach}
                  </p>
                </div>
              </div>

              {/* Implementation Details */}
              <div className="mt-4 bg-white p-4 rounded border">
                <h5 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                  <Code className="w-4 h-4 mr-1" />
                  Implementation Strategy
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Best Practices</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {enhancedPhase.implementation.best_practices.map((practice, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Code Structure</h6>
                    <p className="text-sm text-gray-600">{enhancedPhase.implementation.code_structure}</p>
                  </div>
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Error Handling</h6>
                    <p className="text-sm text-gray-600">{enhancedPhase.implementation.error_handling}</p>
                  </div>
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Testing Strategy</h6>
                    <p className="text-sm text-gray-600">{enhancedPhase.implementation.testing_strategy}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Files to {phase.name.toLowerCase()}</h4>
            <div className="space-y-3">
              {(enhancedPhase && enhancedPhase !== 'failed' ? enhancedPhase.files : phase.files).map((file, index) => {
                // Build a Map from phase.files keyed by path
                const phaseFilesMap = new Map(phase.files.map(f => [f.path, f]));
                
                // Look up action/description by path, default to 'create' and generic description if unknown
                const phaseFile = phaseFilesMap.get(file.path);
                const action = phaseFile?.action || 'create';
                const description = phaseFile?.description || 'File description';
                
                return (
                  <div key={index} className="bg-white rounded border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{file.path}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          action === 'create' 
                            ? 'bg-green-100 text-green-800'
                            : action === 'modify'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {action}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {description}
                    </p>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Details:</span>
                      <ul className="mt-1 space-y-1">
                        {file.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Enhanced File Details */}
                    {enhancedPhase && enhancedPhase !== 'failed' && 'architecture_notes' in file && file.architecture_notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-medium text-gray-700 flex items-center mb-1">
                              <Building2 className="w-3 h-3 mr-1" />
                              Architecture Notes:
                            </span>
                            <p className="text-gray-600">{file.architecture_notes}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 flex items-center mb-1">
                              <Code className="w-3 h-3 mr-1" />
                              Implementation:
                            </span>
                            <p className="text-gray-600">{file.implementation_guidance}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 flex items-center mb-1">
                              <Shield className="w-3 h-3 mr-1" />
                              Security:
                            </span>
                            <p className="text-gray-600">{file.security_considerations}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 flex items-center mb-1">
                              <Zap className="w-3 h-3 mr-1" />
                              Performance:
                            </span>
                            <p className="text-gray-600">{file.performance_tips}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
