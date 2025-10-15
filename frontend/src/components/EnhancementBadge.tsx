// React import not needed in modern React
import { Sparkles, Zap } from 'lucide-react';

interface EnhancementBadgeProps {
  progress: {
    current: number;
    total: number;
  };
}

export function EnhancementBadge({ progress }: EnhancementBadgeProps) {
  const { current, total } = progress;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current >= total;

  if (isComplete) {
    return (
      <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
        <Sparkles className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">AI-Enhanced Plan</span>
      </div>
    );
  }

  if (current > 0) {
    return (
      <div className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-sm font-medium">
          Enhanced {current}/{total} phases ({percentage}%)
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
      <Zap className="w-4 h-4 mr-2" />
      <span className="text-sm font-medium">Rule-based Plan</span>
    </div>
  );
}
