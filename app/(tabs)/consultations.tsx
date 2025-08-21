import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Video, 
  Phone, 
  Calendar, 
  Clock,
  User,
  Star,
  Plus,
  X
} from 'lucide-react-native';
import { useConsultationsStore } from '@/stores/consultationsStore';
import { useAuthStore } from '@/stores/authStore';
import { Consultation, Doctor } from '@/types';

export default function ConsultationsScreen() {
  const { token } = useAuthStore();
  const {
    consultations,
    availableDoctors,
    isLoading,
    error,
    getConsultations,
    getAvailableDoctors,
    requestConsultation,
    joinCall,
    clearError,
  } = useConsultationsStore();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'audio'>('video');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (token) {
      getConsultations(token);
      getAvailableDoctors(token);
    }
  }, [token]);

  const handleRequestConsultation = async () => {
    if (!token || !selectedDoctor) return;

    if (!symptoms.trim()) {
      Alert.alert('Symptoms Required', 'Please describe your symptoms');
      return;
    }

    try {
      await requestConsultation(token, {
        doctorId: selectedDoctor.id,
        type: consultationType,
        symptoms: symptoms.trim(),
        scheduledAt: selectedDate.toISOString(),
        status: 'scheduled',
      });

      Alert.alert(
        'Consultation Requested',
        'Your consultation request has been sent. The doctor will confirm the appointment.',
        [{ text: 'OK', onPress: () => setShowRequestModal(false) }]
      );
      
      setSymptoms('');
      setSelectedDoctor(null);
    } catch (err) {
      Alert.alert('Request Failed', 'Could not request consultation. Please try again.');
    }
  };

  const handleJoinCall = async (consultation: Consultation) => {
    if (!token) return;

    try {
      await joinCall(token, consultation.id);
      // Navigate to call screen or open call interface
      Alert.alert(
        'Joining Call',
        'Connecting you to the doctor...',
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Join Failed', 'Could not join the call. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#0066CC';
      case 'in-progress':
        return '#00AA44';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const upcomingConsultations = consultations.filter(
    c => c.status === 'scheduled' && new Date(c.scheduledAt) > new Date()
  );

  const pastConsultations = consultations.filter(
    c => c.status === 'completed' || new Date(c.scheduledAt) < new Date()
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Doctor Consultations</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowRequestModal(true)}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Available Doctors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsList}>
            {availableDoctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                style={styles.doctorCard}
                onPress={() => {
                  setSelectedDoctor(doctor);
                  setShowRequestModal(true);
                }}
              >
                <View style={styles.doctorAvatar}>
                  <User size={24} color="#0066CC" />
                </View>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
                <View style={styles.doctorRating}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingText}>{doctor.rating}</Text>
                  <Text style={styles.experienceText}>({doctor.experience}y exp)</Text>
                </View>
                <View style={[
                  styles.availabilityIndicator,
                  { backgroundColor: doctor.isAvailable ? '#00AA44' : '#dc2626' }
                ]}>
                  <Text style={styles.availabilityText}>
                    {doctor.isAvailable ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Consultations */}
        {upcomingConsultations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {upcomingConsultations.map((consultation) => (
              <View key={consultation.id} style={styles.consultationCard}>
                <View style={styles.consultationHeader}>
                  <View style={styles.consultationInfo}>
                    <Text style={styles.consultationDoctor}>
                      Dr. {consultation.doctorId}
                    </Text>
                    <View style={styles.consultationMeta}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.consultationDate}>
                        {new Date(consultation.scheduledAt).toLocaleDateString()}
                      </Text>
                      <Clock size={16} color="#6b7280" />
                      <Text style={styles.consultationTime}>
                        {new Date(consultation.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(consultation.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(consultation.status) }
                    ]}>
                      {consultation.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.consultationSymptoms} numberOfLines={2}>
                  {consultation.symptoms}
                </Text>

                <View style={styles.consultationActions}>
                  <TouchableOpacity
                    style={styles.callTypeButton}
                    onPress={() => handleJoinCall(consultation)}
                  >
                    {consultation.type === 'video' ? (
                      <Video size={16} color="#0066CC" />
                    ) : (
                      <Phone size={16} color="#0066CC" />
                    )}
                    <Text style={styles.callTypeText}>
                      Join {consultation.type} call
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Past Consultations */}
        {pastConsultations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical History</Text>
            {pastConsultations.map((consultation) => (
              <View key={consultation.id} style={styles.consultationCard}>
                <View style={styles.consultationHeader}>
                  <View style={styles.consultationInfo}>
                    <Text style={styles.consultationDoctor}>
                      Dr. {consultation.doctorId}
                    </Text>
                    <View style={styles.consultationMeta}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.consultationDate}>
                        {new Date(consultation.scheduledAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(consultation.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(consultation.status) }
                    ]}>
                      {consultation.status}
                    </Text>
                  </View>
                </View>

                {consultation.diagnosis && (
                  <View style={styles.diagnosisContainer}>
                    <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
                    <Text style={styles.diagnosisText}>{consultation.diagnosis}</Text>
                  </View>
                )}

                {consultation.prescription && (
                  <View style={styles.prescriptionContainer}>
                    <Text style={styles.prescriptionLabel}>Prescription:</Text>
                    <Text style={styles.prescriptionText}>{consultation.prescription}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {consultations.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Consultations Yet</Text>
            <Text style={styles.emptyStateText}>
              Start by requesting a consultation with an available doctor
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowRequestModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Request Consultation</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Request Consultation Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Consultation</Text>
            <TouchableOpacity onPress={() => setShowRequestModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Doctor Selection */}
            <Text style={styles.modalSectionTitle}>Select Doctor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalDoctorsList}>
              {availableDoctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.modalDoctorCard,
                    selectedDoctor?.id === doctor.id && styles.modalDoctorCardSelected,
                  ]}
                  onPress={() => setSelectedDoctor(doctor)}
                >
                  <View style={styles.doctorAvatar}>
                    <User size={20} color="#0066CC" />
                  </View>
                  <Text style={styles.modalDoctorName}>{doctor.name}</Text>
                  <Text style={styles.modalDoctorSpecialization}>{doctor.specialization}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Consultation Type */}
            <Text style={styles.modalSectionTitle}>Consultation Type</Text>
            <View style={styles.consultationTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.consultationTypeButton,
                  consultationType === 'video' && styles.consultationTypeButtonSelected,
                ]}
                onPress={() => setConsultationType('video')}
              >
                <Video size={20} color={consultationType === 'video' ? '#ffffff' : '#0066CC'} />
                <Text style={[
                  styles.consultationTypeText,
                  consultationType === 'video' && styles.consultationTypeTextSelected,
                ]}>
                  Video Call
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.consultationTypeButton,
                  consultationType === 'audio' && styles.consultationTypeButtonSelected,
                ]}
                onPress={() => setConsultationType('audio')}
              >
                <Phone size={20} color={consultationType === 'audio' ? '#ffffff' : '#0066CC'} />
                <Text style={[
                  styles.consultationTypeText,
                  consultationType === 'audio' && styles.consultationTypeTextSelected,
                ]}>
                  Audio Call
                </Text>
              </TouchableOpacity>
            </View>

            {/* Symptoms Description */}
            <Text style={styles.modalSectionTitle}>Describe Your Symptoms</Text>
            <TextInput
              style={styles.symptomsInput}
              multiline
              numberOfLines={4}
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Please describe your symptoms in detail..."
              textAlignVertical="top"
            />

            {/* Request Button */}
            <TouchableOpacity
              style={[
                styles.requestButton,
                (!selectedDoctor || !symptoms.trim()) && styles.requestButtonDisabled,
              ]}
              onPress={handleRequestConsultation}
              disabled={!selectedDoctor || !symptoms.trim() || isLoading}
            >
              <Text style={styles.requestButtonText}>
                {isLoading ? 'Requesting...' : 'Request Consultation'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  doctorsList: {
    paddingHorizontal: 20,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#111827',
    marginLeft: 2,
  },
  experienceText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  availabilityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '500',
  },
  consultationCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  consultationInfo: {
    flex: 1,
  },
  consultationDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  consultationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consultationDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  consultationTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  consultationSymptoms: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  consultationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  callTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    gap: 6,
  },
  callTypeText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  diagnosisContainer: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  diagnosisLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  prescriptionContainer: {
    backgroundColor: '#fef3f2',
    padding: 12,
    borderRadius: 8,
  },
  prescriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  prescriptionText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  modalDoctorsList: {
    marginBottom: 24,
  },
  modalDoctorCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalDoctorCardSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F9FF',
  },
  modalDoctorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
    marginTop: 4,
  },
  modalDoctorSpecialization: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  consultationTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  consultationTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#0066CC',
    gap: 8,
  },
  consultationTypeButtonSelected: {
    backgroundColor: '#0066CC',
  },
  consultationTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066CC',
  },
  consultationTypeTextSelected: {
    color: '#ffffff',
  },
  symptomsInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 24,
  },
  requestButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});