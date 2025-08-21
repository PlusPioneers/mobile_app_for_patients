import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Mic, MicOff, Play, Square, Send, CreditCard as Edit, Save, X } from 'lucide-react-native';
import { useSymptomsStore } from '@/stores/symptomsStore';
import { useAuthStore } from '@/stores/authStore';

export default function SymptomsScreen() {
  const { token } = useAuthStore();
  const {
    isRecording,
    recordingUri,
    transcription,
    translation,
    isLoading,
    error,
    startRecording,
    stopRecording,
    transcribeAudio,
    createReport,
    clearTranscription,
    clearError,
  } = useSymptomsStore();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingTranscription, setEditingTranscription] = useState(false);
  const [editedTranscription, setEditedTranscription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
  ];

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecordingAudio = async () => {
    try {
      clearError();
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow microphone access to record symptoms');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      startRecording();
    } catch (err) {
      Alert.alert('Recording failed', 'Could not start recording. Please try again.');
      console.error('Failed to start recording', err);
    }
  };

  const stopRecordingAudio = async () => {
    if (!recording) return;

    try {
      setRecording(null);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        stopRecording(uri);
        // Auto-transcribe the audio
        if (token) {
          await transcribeAudio(token, uri, selectedLanguage);
        }
      }
    } catch (err) {
      Alert.alert('Recording failed', 'Could not save recording. Please try again.');
      console.error('Failed to stop recording', err);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      Alert.alert('Playback failed', 'Could not play recording.');
      console.error('Failed to play recording', err);
    }
  };

  const handleEditTranscription = () => {
    setEditedTranscription(transcription || '');
    setEditingTranscription(true);
  };

  const saveTranscriptionEdit = () => {
    // Update the transcription with edited version
    setEditingTranscription(false);
  };

  const submitSymptomReport = async () => {
    if (!token) return;

    const finalTranscription = editingTranscription ? editedTranscription : transcription;
    
    if (!finalTranscription) {
      Alert.alert('No symptoms recorded', 'Please record your symptoms first.');
      return;
    }

    try {
      await createReport(token, {
        transcription: finalTranscription,
        translatedText: translation || finalTranscription,
        structuredReport: {
          symptoms: [finalTranscription],
          duration: 'Not specified',
          severity,
          additionalNotes: '',
        },
        status: 'submitted',
      });

      Alert.alert(
        'Symptoms Submitted',
        'Your symptoms have been recorded and sent to available doctors.',
        [
          {
            text: 'OK',
            onPress: () => {
              clearTranscription();
              setEditingTranscription(false);
              setEditedTranscription('');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Submission failed', 'Could not submit symptoms. Please try again.');
    }
  };

  const clearAll = () => {
    Alert.alert(
      'Clear Recording',
      'Are you sure you want to clear the current recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            clearTranscription();
            setEditingTranscription(false);
            setEditedTranscription('');
            if (sound) {
              sound.unloadAsync();
              setSound(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Record Your Symptoms</Text>
          <Text style={styles.subtitle}>
            Speak in your preferred language about how you're feeling
          </Text>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Language</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.languageText,
                    selectedLanguage === lang.code && styles.languageTextActive,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recording Section */}
        <View style={styles.section}>
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecordingAudio : startRecordingAudio}
              disabled={isLoading}
            >
              {isRecording ? (
                <Square size={32} color="#ffffff" />
              ) : (
                <Mic size={32} color="#ffffff" />
              )}
            </TouchableOpacity>
            
            <View style={styles.recordingInfo}>
              <Text style={styles.recordingStatus}>
                {isRecording ? 'Recording...' : recordingUri ? 'Recording complete' : 'Tap to start recording'}
              </Text>
              {recordingUri && !isRecording && (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={playRecording}
                  disabled={isPlaying}
                >
                  <Play size={16} color="#0066CC" />
                  <Text style={styles.playButtonText}>
                    {isPlaying ? 'Playing...' : 'Play recording'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Transcription Section */}
        {(transcription || isLoading) && (
          <View style={styles.section}>
            <View style={styles.transcriptionHeader}>
              <Text style={styles.sectionTitle}>Transcription</Text>
              {transcription && !editingTranscription && (
                <TouchableOpacity onPress={handleEditTranscription}>
                  <Edit size={20} color="#0066CC" />
                </TouchableOpacity>
              )}
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
                <Text style={styles.loadingText}>Processing your speech...</Text>
              </View>
            ) : (
              <View style={styles.transcriptionContainer}>
                {editingTranscription ? (
                  <View>
                    <TextInput
                      style={styles.transcriptionInput}
                      multiline
                      value={editedTranscription}
                      onChangeText={setEditedTranscription}
                      placeholder="Edit your transcription..."
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveTranscriptionEdit}
                      >
                        <Save size={16} color="#ffffff" />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setEditingTranscription(false)}
                      >
                        <X size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.transcriptionText}>{transcription}</Text>
                )}
              </View>
            )}

            {translation && translation !== transcription && (
              <View style={styles.translationContainer}>
                <Text style={styles.translationLabel}>Translation:</Text>
                <Text style={styles.translationText}>{translation}</Text>
              </View>
            )}
          </View>
        )}

        {/* Severity Selection */}
        {transcription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How severe are your symptoms?</Text>
            <View style={styles.severityContainer}>
              {(['mild', 'moderate', 'severe'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityButton,
                    severity === level && styles.severityButtonActive,
                    level === 'mild' && styles.severityMild,
                    level === 'moderate' && styles.severityModerate,
                    level === 'severe' && styles.severitySevere,
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text
                    style={[
                      styles.severityText,
                      severity === level && styles.severityTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {transcription && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAll}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitSymptomReport}
              disabled={isLoading}
            >
              <Send size={16} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit to Doctor</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
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
  languageList: {
    paddingHorizontal: 20,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },
  languageButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  languageText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#ffffff',
  },
  recordingContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#dc2626',
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
  },
  playButtonText: {
    fontSize: 14,
    color: '#0066CC',
    marginLeft: 4,
    fontWeight: '500',
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  transcriptionContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  transcriptionInput: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    padding: 6,
  },
  translationContainer: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  translationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 4,
  },
  translationText: {
    fontSize: 16,
    color: '#0369A1',
    lineHeight: 24,
  },
  severityContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: '#ffffff',
  },
  severityMild: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  severityModerate: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  severitySevere: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  severityTextActive: {
    color: '#111827',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0066CC',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});