import { useState, useCallback } from 'react';
import apiClient from '../api/client';
import { Problem } from '../types';

export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/problems');
      setProblems(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProblem = async (id: string) => {
    try {
      await apiClient.delete(`/problems/${id}`);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete problem');
      return false;
    }
  };

  const addProblem = async (problemData: any) => {
    try {
      const res = await apiClient.post('/problems', problemData);
      setProblems((prev) => [res.data.data, ...prev]);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add problem');
      throw err;
    }
  };

  return {
    problems,
    loading,
    error,
    fetchProblems,
    deleteProblem,
    addProblem
  };
}
