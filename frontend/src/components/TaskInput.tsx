import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Sparkles, Zap, Play } from 'lucide-react';
import { TechnologyRecommendations } from './TechnologyRecommendations';
import { TechnologyComparison } from '../types';
import { planApi } from '../services/api';

interface TaskInputProps {
  onSubmit: (task: string) => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

const EXAMPLE_TASKS = [
  "Build a task management app with user authentication and real-time updates",
  "Create a REST API for a blog with comments, likes, and user profiles",
  "Real-time chat application with rooms, direct messages, and file sharing",
  "E-commerce platform with Stripe payment integration and inventory management",
  "CLI tool for analyzing Git repositories and generating commit reports"
];

export function TaskInput({ onSubmit, isLoading, onOpenSettings, hasApiKey }: TaskInputProps) {
  const [task, setTask] = useState('');
  const [technologyRecommendations, setTechnologyRecommendations] = useState<{
    database?: TechnologyComparison;
    backend?: TechnologyComparison;
    frontend?: TechnologyComparison;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onSubmit(task.trim());
    }
  };

  const handleExampleClick = (exampleTask: string) => {
    setTask(exampleTask);
  };

  // Debounced analysis function
  const analyzeTask = useCallback(async (taskText: string) => {
    if (taskText.trim().length < 10) {
      setTechnologyRecommendations(null);
      return;
    }

    console.log('Analyzing task:', taskText);
    setIsAnalyzing(true);
    try {
      const analysis = await planApi.analyzeTask(taskText);
      console.log('Analysis result:', analysis);
      setTechnologyRecommendations({
        database: analysis.databaseRecommendation,
        backend: analysis.backendRecommendation,
        frontend: analysis.frontendRecommendation,
      });
    } catch (error) {
      console.error('Error analyzing task:', error);
      setTechnologyRecommendations(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Debounce the analysis
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (task.trim()) {
        analyzeTask(task);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [task, analyzeTask]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl mr-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Traycer Lite</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Planning Layer for AI Development
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Transform vague coding tasks into detailed, structured implementation plans. 
            Plan first, code later.
          </p>
        </div>

        {/* Main Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your coding task
              </label>
              <textarea
                id="task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Build a task management app with user authentication and real-time updates"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>

              <button
                type="submit"
                disabled={!task.trim() || isLoading}
                className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Plan
                  </>
                )}
              </button>
            </div>
          </form>

          {/* API Key Status */}
          {!hasApiKey && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> Add your OpenAI API key in settings for AI-enhanced plan details.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Technology Recommendations */}
        {(technologyRecommendations || isAnalyzing) && (
          <div className="mb-8">
            <TechnologyRecommendations 
              recommendations={technologyRecommendations} 
              isLoading={isAnalyzing}
            />
          </div>
        )}

        {/* Example Tasks */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Tasks</h3>
          <div className="grid gap-3">
            {EXAMPLE_TASKS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-8 text-center">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-green-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Planning</h3>
              <p className="text-sm text-gray-600">
                Get a detailed implementation plan in milliseconds with our rule-based engine
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Enhancement</h3>
              <p className="text-sm text-gray-600">
                GPT-4 adds intelligent details and technical reasoning to each phase
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Agent Ready</h3>
              <p className="text-sm text-gray-600">
                Hand off your detailed plan to any AI coding agent for execution
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
