import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Zap, Database, Server, Monitor } from 'lucide-react';
import { TechnologyComparison } from '../types';

interface TechnologyRecommendationsProps {
  recommendations: {
    database?: TechnologyComparison;
    backend?: TechnologyComparison;
    frontend?: TechnologyComparison;
  } | null;
  isLoading?: boolean;
}

export function TechnologyRecommendations({ recommendations, isLoading }: TechnologyRecommendationsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Technology Recommendations</h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-5 h-5 text-green-600" />;
      case 'backend':
        return <Server className="w-5 h-5 text-blue-600" />;
      case 'frontend':
        return <Monitor className="w-5 h-5 text-purple-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'database':
        return 'Database Choice';
      case 'backend':
        return 'Backend Framework';
      case 'frontend':
        return 'Frontend Framework';
      default:
        return 'Technology';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <Zap className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Technology Recommendations</h3>
      </div>

      <div className="space-y-6">
        {recommendations.database && (
          <TechnologyCard
            type="database"
            recommendation={recommendations.database}
            icon={getIcon('database')}
            title={getTitle('database')}
            getComplexityColor={getComplexityColor}
            getConfidenceColor={getConfidenceColor}
          />
        )}

        {recommendations.backend && (
          <TechnologyCard
            type="backend"
            recommendation={recommendations.backend}
            icon={getIcon('backend')}
            title={getTitle('backend')}
            getComplexityColor={getComplexityColor}
            getConfidenceColor={getConfidenceColor}
          />
        )}

        {recommendations.frontend && (
          <TechnologyCard
            type="frontend"
            recommendation={recommendations.frontend}
            icon={getIcon('frontend')}
            title={getTitle('frontend')}
            getComplexityColor={getComplexityColor}
            getConfidenceColor={getConfidenceColor}
          />
        )}
      </div>
    </div>
  );
}

interface TechnologyCardProps {
  type: string;
  recommendation: TechnologyComparison;
  icon: React.ReactNode;
  title: string;
  getComplexityColor: (complexity: string) => string;
  getConfidenceColor: (confidence: number) => string;
}

function TechnologyCard({ 
  recommendation, 
  icon, 
  title, 
  getComplexityColor, 
  getConfidenceColor 
}: TechnologyCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {icon}
          <h4 className="text-md font-semibold text-gray-900 ml-2">{title}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
            {Math.round(recommendation.confidence * 100)}% confidence
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show Details'}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          <span className="font-medium text-gray-900">{recommendation.recommendation}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {recommendation.implementation.timeline}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(recommendation.implementation.complexity)}`}>
            {recommendation.implementation.complexity} complexity
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Reasoning */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Why this choice?</h5>
            <ul className="space-y-1">
              {recommendation.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Trade-offs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Pros
              </h5>
              <ul className="space-y-1">
                {recommendation.tradeoffs.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                Cons
              </h5>
              <ul className="space-y-1">
                {recommendation.tradeoffs.cons.map((con, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alternatives */}
          {recommendation.alternatives.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Alternatives
              </h5>
              <div className="space-y-3">
                {recommendation.alternatives.map((alt, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3">
                    <div className="font-medium text-sm text-gray-900">{alt.technology}</div>
                    <div className="text-sm text-gray-600 mt-1">{alt.whenToUse}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Trade-offs: {alt.tradeoffs.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Implementation Details */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Implementation</h5>
            <div className="text-sm text-gray-600">
              <div className="mb-1">
                <span className="font-medium">Learning Curve:</span> {recommendation.implementation.learningCurve}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
