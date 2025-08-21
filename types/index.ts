export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomReport {
  id: string;
  patientId: string;
  originalAudio?: string;
  transcription: string;
  translatedText: string;
  structuredReport: {
    symptoms: string[];
    duration: string;
    severity: 'mild' | 'moderate' | 'severe';
    additionalNotes: string;
  };
  status: 'draft' | 'submitted' | 'reviewed';
  doctorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'video' | 'audio';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  duration?: number;
  symptoms: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  followUpRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  isAvailable: boolean;
  rating: number;
  experience: number;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testDate: string;
  results: string;
  fileUrl?: string;
  doctorComments?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  patientId: string;
  type: 'appointment' | 'outbreak' | 'reminder' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}