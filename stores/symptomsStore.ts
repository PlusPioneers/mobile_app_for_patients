import { create } from 'zustand';
import { SymptomReport } from '@/types';
import { symptomsAPI } from '@/services/api';

interface SymptomsState {
  reports: SymptomReport[];
  currentReport: SymptomReport | null;
  isLoading: boolean;
  error: string | null;
  isRecording: boolean;
  recordingUri: string | null;
  transcription: string | null;
  translation: string | null;

  // Actions
  startRecording: () => void;
  stopRecording: (uri: string) => void;
  transcribeAudio: (token: string, audioUri: string, language: string) => Promise<void>;
  createReport: (token: string, reportData: Partial<SymptomReport>) => Promise<void>;
  updateReport: (token: string, reportId: string, data: Partial<SymptomReport>) => Promise<void>;
  submitReport: (token: string, reportId: string) => Promise<void>;
  getReports: (token: string) => Promise<void>;
  setCurrentReport: (report: SymptomReport | null) => void;
  clearTranscription: () => void;
  clearError: () => void;
}

export const useSymptomsStore = create<SymptomsState>((set, get) => ({
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
  isRecording: false,
  recordingUri: null,
  transcription: null,
  translation: null,

  startRecording: () => set({ isRecording: true, recordingUri: null }),

  stopRecording: (uri: string) => set({ isRecording: false, recordingUri: uri }),

  transcribeAudio: async (token: string, audioUri: string, language: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await symptomsAPI.transcribeAudio(token, audioUri, language);
      set({
        transcription: result.transcription,
        translation: result.translation,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Transcription failed',
        isLoading: false,
      });
    }
  },

  createReport: async (token: string, reportData: Partial<SymptomReport>) => {
    set({ isLoading: true, error: null });
    try {
      const report = await symptomsAPI.createReport(token, reportData);
      set((state) => ({
        reports: [report, ...state.reports],
        currentReport: report,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create report',
        isLoading: false,
      });
    }
  },

  updateReport: async (token: string, reportId: string, data: Partial<SymptomReport>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedReport = await symptomsAPI.updateReport(token, reportId, data);
      set((state) => ({
        reports: state.reports.map((report) =>
          report.id === reportId ? updatedReport : report
        ),
        currentReport: state.currentReport?.id === reportId ? updatedReport : state.currentReport,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update report',
        isLoading: false,
      });
    }
  },

  submitReport: async (token: string, reportId: string) => {
    set({ isLoading: true, error: null });
    try {
      const submittedReport = await symptomsAPI.submitReport(token, reportId);
      set((state) => ({
        reports: state.reports.map((report) =>
          report.id === reportId ? submittedReport : report
        ),
        currentReport: state.currentReport?.id === reportId ? submittedReport : state.currentReport,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit report',
        isLoading: false,
      });
    }
  },

  getReports: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const reports = await symptomsAPI.getReports(token);
      set({ reports, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch reports',
        isLoading: false,
      });
    }
  },

  setCurrentReport: (report: SymptomReport | null) => set({ currentReport: report }),

  clearTranscription: () => set({
    transcription: null,
    translation: null,
    recordingUri: null,
  }),

  clearError: () => set({ error: null }),
}));