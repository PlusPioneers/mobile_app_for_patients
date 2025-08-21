import { create } from 'zustand';
import { Consultation, Doctor } from '@/types';
import { consultationsAPI } from '@/services/api';

interface ConsultationsState {
  consultations: Consultation[];
  availableDoctors: Doctor[];
  currentConsultation: Consultation | null;
  isLoading: boolean;
  error: string | null;
  callToken: string | null;
  channelName: string | null;

  // Actions
  getAvailableDoctors: (token: string) => Promise<void>;
  requestConsultation: (token: string, data: Partial<Consultation>) => Promise<void>;
  getConsultations: (token: string) => Promise<void>;
  joinCall: (token: string, consultationId: string) => Promise<void>;
  setCurrentConsultation: (consultation: Consultation | null) => void;
  endCall: () => void;
  clearError: () => void;
}

export const useConsultationsStore = create<ConsultationsState>((set, get) => ({
  consultations: [],
  availableDoctors: [],
  currentConsultation: null,
  isLoading: false,
  error: null,
  callToken: null,
  channelName: null,

  getAvailableDoctors: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const doctors = await consultationsAPI.getAvailableDoctors(token);
      set({ availableDoctors: doctors, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch doctors',
        isLoading: false,
      });
    }
  },

  requestConsultation: async (token: string, data: Partial<Consultation>) => {
    set({ isLoading: true, error: null });
    try {
      const consultation = await consultationsAPI.requestConsultation(token, data);
      set((state) => ({
        consultations: [consultation, ...state.consultations],
        currentConsultation: consultation,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to request consultation',
        isLoading: false,
      });
    }
  },

  getConsultations: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const consultations = await consultationsAPI.getConsultations(token);
      set({ consultations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch consultations',
        isLoading: false,
      });
    }
  },

  joinCall: async (token: string, consultationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const callData = await consultationsAPI.joinCall(token, consultationId);
      set({
        callToken: callData.callToken,
        channelName: callData.channelName,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to join call',
        isLoading: false,
      });
    }
  },

  setCurrentConsultation: (consultation: Consultation | null) => 
    set({ currentConsultation: consultation }),

  endCall: () => set({ callToken: null, channelName: null }),

  clearError: () => set({ error: null }),
}));