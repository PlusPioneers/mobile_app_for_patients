import { create } from 'zustand';
import { LabResult } from '@/types';
import { labAPI } from '@/services/api';

interface LabState {
  results: LabResult[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getResults: (token: string) => Promise<void>;
  uploadResult: (token: string, file: any, testName: string, testDate: string) => Promise<void>;
  clearError: () => void;
}

export const useLabStore = create<LabState>((set, get) => ({
  results: [],
  isLoading: false,
  error: null,

  getResults: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const results = await labAPI.getResults(token);
      set({ results, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch lab results',
        isLoading: false,
      });
    }
  },

  uploadResult: async (token: string, file: any, testName: string, testDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await labAPI.uploadResult(token, file, testName, testDate);
      set((state) => ({
        results: [result, ...state.results],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload lab result',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));