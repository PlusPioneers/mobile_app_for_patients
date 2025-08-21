import { User, SymptomReport, Consultation, Doctor, LabResult, Notification } from '@/types';

// Mock user data
export const mockUser: User = {
  id: '1',
  email: 'patient@demo.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1-555-0123',
  dateOfBirth: '1985-06-15',
  gender: 'male',
  address: '123 Main Street, Rural Town, State 12345',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+1-555-0124',
    relation: 'Spouse',
  },
  preferredLanguage: 'en',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-12-15T10:00:00Z',
};

// Mock doctors data
export const mockDoctors: Doctor[] = [
  {
    id: 'dr1',
    name: 'Dr. Sarah Johnson',
    specialization: 'General Medicine',
    isAvailable: true,
    rating: 4.8,
    experience: 12,
  },
  {
    id: 'dr2',
    name: 'Dr. Michael Chen',
    specialization: 'Pediatrics',
    isAvailable: true,
    rating: 4.9,
    experience: 8,
  },
  {
    id: 'dr3',
    name: 'Dr. Priya Sharma',
    specialization: 'Internal Medicine',
    isAvailable: false,
    rating: 4.7,
    experience: 15,
  },
  {
    id: 'dr4',
    name: 'Dr. Robert Wilson',
    specialization: 'Cardiology',
    isAvailable: true,
    rating: 4.9,
    experience: 20,
  },
  {
    id: 'dr5',
    name: 'Dr. Maria Garcia',
    specialization: 'Dermatology',
    isAvailable: true,
    rating: 4.6,
    experience: 10,
  },
];

// Mock consultations data
export const mockConsultations: Consultation[] = [
  {
    id: 'cons1',
    patientId: '1',
    doctorId: 'dr1',
    type: 'video',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    symptoms: 'Persistent headache and mild fever for 3 days',
    createdAt: '2024-12-13T10:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z',
  },
  {
    id: 'cons2',
    patientId: '1',
    doctorId: 'dr2',
    type: 'audio',
    status: 'completed',
    scheduledAt: '2024-12-10T14:00:00Z',
    duration: 25,
    symptoms: 'Stomach pain after meals',
    diagnosis: 'Mild gastritis, likely due to dietary habits',
    prescription: 'Antacid tablets, take 1 tablet after meals for 7 days. Avoid spicy foods.',
    notes: 'Patient should follow up if symptoms persist after medication course.',
    followUpRequired: false,
    createdAt: '2024-12-08T10:00:00Z',
    updatedAt: '2024-12-10T14:25:00Z',
  },
  {
    id: 'cons3',
    patientId: '1',
    doctorId: 'dr3',
    type: 'video',
    status: 'completed',
    scheduledAt: '2024-12-05T09:00:00Z',
    duration: 30,
    symptoms: 'Seasonal allergies and runny nose',
    diagnosis: 'Allergic rhinitis',
    prescription: 'Antihistamine tablets, take 1 daily for 10 days. Nasal spray as needed.',
    notes: 'Recommend avoiding outdoor activities during high pollen days.',
    followUpRequired: false,
    createdAt: '2024-12-03T10:00:00Z',
    updatedAt: '2024-12-05T09:30:00Z',
  },
];

// Mock lab results data
export const mockLabResults: LabResult[] = [
  {
    id: 'lab1',
    patientId: '1',
    testName: 'Complete Blood Count (CBC)',
    testDate: '2024-12-10',
    results: 'Hemoglobin: 14.2 g/dL (Normal)\nWhite Blood Cells: 7,200/μL (Normal)\nPlatelets: 285,000/μL (Normal)\nHematocrit: 42% (Normal)',
    doctorComments: 'All values are within normal range. Good overall blood health.',
    createdAt: '2024-12-11T10:00:00Z',
  },
  {
    id: 'lab2',
    patientId: '1',
    testName: 'Lipid Profile',
    testDate: '2024-12-08',
    results: 'Total Cholesterol: 195 mg/dL (Borderline)\nLDL: 125 mg/dL (Borderline)\nHDL: 45 mg/dL (Low)\nTriglycerides: 150 mg/dL (Normal)',
    doctorComments: 'HDL cholesterol is slightly low. Recommend increasing physical activity and omega-3 rich foods.',
    createdAt: '2024-12-09T10:00:00Z',
  },
  {
    id: 'lab3',
    patientId: '1',
    testName: 'Chest X-Ray',
    testDate: '2024-11-28',
    results: 'Clear lung fields. No signs of infection or abnormalities. Heart size normal.',
    fileUrl: 'https://example.com/xray-chest-20241128.pdf',
    doctorComments: 'Normal chest X-ray. No concerns.',
    createdAt: '2024-11-29T10:00:00Z',
  },
];

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    patientId: '1',
    type: 'appointment',
    title: 'Upcoming Appointment Reminder',
    message: 'You have a video consultation with Dr. Sarah Johnson scheduled for tomorrow at 2:00 PM. Please ensure you have a stable internet connection.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'notif2',
    patientId: '1',
    type: 'outbreak',
    title: 'Health Alert: Flu Outbreak',
    message: 'There has been an increase in flu cases in your area. Please take preventive measures and contact us if you experience symptoms.',
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
  {
    id: 'notif3',
    patientId: '1',
    type: 'reminder',
    title: 'Medication Reminder',
    message: 'Don\'t forget to take your prescribed antacid tablet after dinner.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'notif4',
    patientId: '1',
    type: 'general',
    title: 'Lab Results Available',
    message: 'Your Complete Blood Count (CBC) results are now available in the Lab Results section.',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'notif5',
    patientId: '1',
    type: 'appointment',
    title: 'Consultation Completed',
    message: 'Your consultation with Dr. Michael Chen has been completed. Prescription and notes are available in your consultation history.',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
];

// Mock symptom reports data
export const mockSymptomReports: SymptomReport[] = [
  {
    id: 'symp1',
    patientId: '1',
    transcription: 'I have been experiencing persistent headaches for the past three days, along with mild fever and body aches.',
    translatedText: 'I have been experiencing persistent headaches for the past three days, along with mild fever and body aches.',
    structuredReport: {
      symptoms: ['headache', 'fever', 'body aches'],
      duration: '3 days',
      severity: 'moderate',
      additionalNotes: 'Symptoms started gradually and have been consistent',
    },
    status: 'reviewed',
    doctorId: 'dr1',
    createdAt: '2024-12-12T10:00:00Z',
    updatedAt: '2024-12-12T15:00:00Z',
  },
  {
    id: 'symp2',
    patientId: '1',
    transcription: 'Stomach pain after eating, especially spicy food. Also feeling nauseous sometimes.',
    translatedText: 'Stomach pain after eating, especially spicy food. Also feeling nauseous sometimes.',
    structuredReport: {
      symptoms: ['stomach pain', 'nausea'],
      duration: '1 week',
      severity: 'mild',
      additionalNotes: 'Triggered by spicy foods',
    },
    status: 'submitted',
    createdAt: '2024-12-07T10:00:00Z',
    updatedAt: '2024-12-07T10:00:00Z',
  },
];

// Utility functions for mock API simulation
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const simulateNetworkDelay = () => delay(Math.random() * 1000 + 500); // 500-1500ms delay