import { User, SymptomReport, Consultation, Doctor, LabResult, Notification } from '@/types';

const API_BASE_URL = 'https://your-backend-api.com/api';

// Auth endpoints
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData: Partial<User> & { password: string }): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  logout: async (token: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
};

// Patient endpoints
export const patientAPI = {
  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/patients/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateProfile: async (token: string, userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/patients/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// Symptom reports endpoints
export const symptomsAPI = {
  createReport: async (token: string, reportData: Partial<SymptomReport>): Promise<SymptomReport> => {
    const response = await fetch(`${API_BASE_URL}/symptoms/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });
    return response.json();
  },

  getReports: async (token: string): Promise<SymptomReport[]> => {
    const response = await fetch(`${API_BASE_URL}/symptoms/reports`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateReport: async (token: string, reportId: string, data: Partial<SymptomReport>): Promise<SymptomReport> => {
    const response = await fetch(`${API_BASE_URL}/symptoms/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  submitReport: async (token: string, reportId: string): Promise<SymptomReport> => {
    const response = await fetch(`${API_BASE_URL}/symptoms/reports/${reportId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  transcribeAudio: async (token: string, audioUri: string, language: string): Promise<{ transcription: string; translation: string }> => {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/mp4',
      name: 'symptom_recording.m4a',
    } as any);
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/symptoms/transcribe`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
};

// Consultations endpoints
export const consultationsAPI = {
  getAvailableDoctors: async (token: string): Promise<Doctor[]> => {
    const response = await fetch(`${API_BASE_URL}/consultations/doctors/available`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  requestConsultation: async (token: string, data: Partial<Consultation>): Promise<Consultation> => {
    const response = await fetch(`${API_BASE_URL}/consultations/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getConsultations: async (token: string): Promise<Consultation[]> => {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  joinCall: async (token: string, consultationId: string): Promise<{ callToken: string; channelName: string }> => {
    const response = await fetch(`${API_BASE_URL}/consultations/${consultationId}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

// Lab results endpoints
export const labAPI = {
  getResults: async (token: string): Promise<LabResult[]> => {
    const response = await fetch(`${API_BASE_URL}/lab-results`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  uploadResult: async (token: string, file: any, testName: string, testDate: string): Promise<LabResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('testName', testName);
    formData.append('testDate', testDate);

    const response = await fetch(`${API_BASE_URL}/lab-results/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
};

// Notifications endpoints
export const notificationsAPI = {
  getNotifications: async (token: string): Promise<Notification[]> => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  markAsRead: async (token: string, notificationId: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  registerPushToken: async (token: string, pushToken: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pushToken }),
    });
  },
};