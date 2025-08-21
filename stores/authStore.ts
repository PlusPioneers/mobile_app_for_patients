import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { authAPI, patientAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData: Partial<User> & { password: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await authAPI.logout(token);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: async (userData: Partial<User>) => {
        const { token, user } = get();
        if (!token) throw new Error('Not authenticated');
        
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await patientAPI.updateProfile(token, userData);
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      checkAuthStatus: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const user = await patientAPI.getProfile(token);
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);