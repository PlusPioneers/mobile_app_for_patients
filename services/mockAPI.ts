import { User, SymptomReport, Consultation, Doctor, LabResult, Notification } from '@/types';
import {
  mockUser,
  mockDoctors,
  mockConsultations,
  mockLabResults,
  mockNotifications,
  mockSymptomReports,
  simulateNetworkDelay,
} from './mockData';

// Mock storage for runtime data
let currentUser: User | null = null;
let consultations = [...mockConsultations];
let labResults = [...mockLabResults];
let notifications = [...mockNotifications];
let symptomReports = [...mockSymptomReports];

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    await simulateNetworkDelay();
    
    // Simple mock authentication
    if (email === 'patient@demo.com' && password === 'demo123') {
      currentUser = mockUser;
      return {
        user: mockUser,
        token: 'mock-jwt-token-12345',
      };
    }
    
    throw new Error('Invalid email or password');
  },

  register: async (userData: Partial<User> & { password: string }): Promise<{ user: User; token: string }> => {
    await simulateNetworkDelay();
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      phone: userData.phone || '',
      dateOfBirth: userData.dateOfBirth || '',
      gender: userData.gender || 'other',
      address: userData.address || '',
      emergencyContact: userData.emergencyContact || {
        name: '',
        phone: '',
        relation: '',
      },
      preferredLanguage: userData.preferredLanguage || 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    currentUser = newUser;
    return {
      user: newUser,
      token: 'mock-jwt-token-' + Date.now(),
    };
  },

  logout: async (token: string): Promise<void> => {
    await simulateNetworkDelay();
    currentUser = null;
  },
};

// Patient API
export const patientAPI = {
  getProfile: async (token: string): Promise<User> => {
    await simulateNetworkDelay();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    return currentUser;
  },

  updateProfile: async (token: string, userData: Partial<User>): Promise<User> => {
    await simulateNetworkDelay();
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    currentUser = {
      ...currentUser,
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    
    return currentUser;
  },
};

// Symptoms API
export const symptomsAPI = {
  createReport: async (token: string, reportData: Partial<SymptomReport>): Promise<SymptomReport> => {
    await simulateNetworkDelay();
    
    const newReport: SymptomReport = {
      id: Date.now().toString(),
      patientId: currentUser?.id || '1',
      transcription: reportData.transcription || '',
      translatedText: reportData.translatedText || reportData.transcription || '',
      structuredReport: reportData.structuredReport || {
        symptoms: [],
        duration: '',
        severity: 'mild',
        additionalNotes: '',
      },
      status: reportData.status || 'draft',
      doctorId: reportData.doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    symptomReports.unshift(newReport);
    return newReport;
  },

  getReports: async (token: string): Promise<SymptomReport[]> => {
    await simulateNetworkDelay();
    return symptomReports;
  },

  updateReport: async (token: string, reportId: string, data: Partial<SymptomReport>): Promise<SymptomReport> => {
    await simulateNetworkDelay();
    
    const reportIndex = symptomReports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    symptomReports[reportIndex] = {
      ...symptomReports[reportIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return symptomReports[reportIndex];
  },

  submitReport: async (token: string, reportId: string): Promise<SymptomReport> => {
    await simulateNetworkDelay();
    
    const reportIndex = symptomReports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }
    
    symptomReports[reportIndex] = {
      ...symptomReports[reportIndex],
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    };
    
    return symptomReports[reportIndex];
  },

  transcribeAudio: async (token: string, audioUri: string, language: string): Promise<{ transcription: string; translation: string }> => {
    await simulateNetworkDelay();
    
    // Mock transcription based on language
    const mockTranscriptions = {
      en: 'I have been feeling unwell with headache and fever since yesterday.',
      hi: 'मुझे कल से सिरदर्द और बुखार के साथ अस्वस्थ महसूस हो रहा है।',
      bn: 'আমি গতকাল থেকে মাথাব্যথা এবং জ্বর নিয়ে অসুস্থ বোধ করছি।',
      te: 'నేను నిన్న నుండి తలనొప్పి మరియు జ్వరంతో అనారోగ్యంగా ఉన్నాను.',
      mr: 'मला कालपासून डोकेदुखी आणि ताप येत आहे.',
      ta: 'நேற்றிலிருந்து தலைவலி மற்றும் காய்ச்சலுடன் உடல்நிலை சரியில்லை.',
    };
    
    const transcription = mockTranscriptions[language as keyof typeof mockTranscriptions] || mockTranscriptions.en;
    const translation = language !== 'en' ? mockTranscriptions.en : transcription;
    
    return { transcription, translation };
  },
};

// Consultations API
export const consultationsAPI = {
  getAvailableDoctors: async (token: string): Promise<Doctor[]> => {
    await simulateNetworkDelay();
    return mockDoctors;
  },

  requestConsultation: async (token: string, data: Partial<Consultation>): Promise<Consultation> => {
    await simulateNetworkDelay();
    
    const newConsultation: Consultation = {
      id: Date.now().toString(),
      patientId: currentUser?.id || '1',
      doctorId: data.doctorId || '',
      type: data.type || 'video',
      status: 'scheduled',
      scheduledAt: data.scheduledAt || new Date().toISOString(),
      symptoms: data.symptoms || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    consultations.unshift(newConsultation);
    return newConsultation;
  },

  getConsultations: async (token: string): Promise<Consultation[]> => {
    await simulateNetworkDelay();
    return consultations;
  },

  joinCall: async (token: string, consultationId: string): Promise<{ callToken: string; channelName: string }> => {
    await simulateNetworkDelay();
    
    return {
      callToken: 'mock-call-token-' + consultationId,
      channelName: 'consultation-' + consultationId,
    };
  },
};

// Lab API
export const labAPI = {
  getResults: async (token: string): Promise<LabResult[]> => {
    await simulateNetworkDelay();
    return labResults;
  },

  uploadResult: async (token: string, file: any, testName: string, testDate: string): Promise<LabResult> => {
    await simulateNetworkDelay();
    
    const newResult: LabResult = {
      id: Date.now().toString(),
      patientId: currentUser?.id || '1',
      testName,
      testDate,
      results: 'Results will be processed and updated by the medical team within 24-48 hours.',
      fileUrl: file.uri, // In a real app, this would be a server URL
      createdAt: new Date().toISOString(),
    };
    
    labResults.unshift(newResult);
    return newResult;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (token: string): Promise<Notification[]> => {
    await simulateNetworkDelay();
    return notifications;
  },

  markAsRead: async (token: string, notificationId: string): Promise<void> => {
    await simulateNetworkDelay();
    
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      notifications[notificationIndex].isRead = true;
    }
  },

  registerPushToken: async (token: string, pushToken: string): Promise<void> => {
    await simulateNetworkDelay();
    // Mock implementation - in real app this would register with push service
    console.log('Push token registered:', pushToken);
  },
};