import React, { createContext, useContext, useState, useCallback } from 'react';
import { getEvaluationRuns, triggerEvaluation } from '../services/evaluationService';

const EvaluationContext = createContext(null);

export function EvaluationProvider({ children }) {
  const [runs, setRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchRuns = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEvaluationRuns(pageNum, 10);
      setRuns(data.runs ?? []);
      setTotal(data.total ?? 0);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runEvaluation = useCallback(async () => {
    setIsTriggering(true);
    setError(null);
    try {
      await triggerEvaluation();
      // Refresh runs after triggering
      await fetchRuns(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTriggering(false);
    }
  }, [fetchRuns]);

  return (
    <EvaluationContext.Provider value={{
      runs, isLoading, isTriggering, error, total, page,
      fetchRuns, runEvaluation,
    }}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const ctx = useContext(EvaluationContext);
  if (!ctx) throw new Error('useEvaluation must be used within EvaluationProvider');
  return ctx;
}
