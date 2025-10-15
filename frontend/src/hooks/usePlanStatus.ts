import { useState, useEffect, useRef } from 'react';
import { planApi } from '../services/api';
import { PlanStatusResponse } from '../types';

export function usePlanStatus(taskHash: string | null, enabled: boolean = true) {
  const [status, setStatus] = useState<PlanStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!taskHash || !enabled) {
      return;
    }

    const pollStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await planApi.getPlanStatus(taskHash);
        setStatus(result);
        
        // Stop polling if enhancement is complete
        if (result.progress.current >= result.progress.total) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch plan status');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    pollStatus();

    // Set up polling every 800ms
    intervalRef.current = setInterval(pollStatus, 800) as unknown as number;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [taskHash, enabled]);

  return { status, isLoading, error };
}
