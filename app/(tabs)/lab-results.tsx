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
import * as DocumentPicker from 'expo-document-picker';
import { 
  FileText, 
  Upload, 
  Calendar,
  Plus,
  X,
  Eye,
  Download
} from 'lucide-react-native';
import { useLabStore } from '@/stores/labStore';
import { useAuthStore } from '@/stores/authStore';

export default function LabResultsScreen() {
  const { token } = useAuthStore();
  const { results, isLoading, error, getResults, uploadResult, clearError } = useLabStore();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);

  useEffect(() => {
    if (token) {
      getResults(token);
    }
  }, [token]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('File Selection Failed', 'Could not select file. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!token || !selectedFile || !testName.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields and select a file.');
      return;
    }

    try {
      const fileData = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name || 'lab_result',
      };

      await uploadResult(token, fileData, testName.trim(), testDate);
      
      Alert.alert(
        'Upload Successful',
        'Your lab result has been uploaded successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowUploadModal(false);
              setTestName('');
              setTestDate(new Date().toISOString().split('T')[0]);
              setSelectedFile(null);
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Upload Failed', 'Could not upload lab result. Please try again.');
    }
  };

  const viewResult = (result: any) => {
    if (result.fileUrl) {
      // Open file viewer or download
      Alert.alert(
        'View Result',
        'This would open the lab result file in a document viewer.',
        [
          { text: 'Cancel' },
          { text: 'View', onPress: () => console.log('Open file:', result.fileUrl) },
        ]
      );
    } else {
      // Show text results
      Alert.alert('Lab Result', result.results);
    }
  };

  const getResultIcon = (testName: string) => {
    const name = testName.toLowerCase();
    if (name.includes('blood')) return '🩸';
    if (name.includes('urine')) return '🧪';
    if (name.includes('x-ray')) return '🏥';
    if (name.includes('mri') || name.includes('ct')) return '🔬';
    return '📄';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Lab Results</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Results List */}
        {results.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Lab Results</Text>
            {results.map((result) => (
              <View key={result.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultTitleContainer}>
                    <Text style={styles.resultIcon}>{getResultIcon(result.testName)}</Text>
                    <View style={styles.resultTitleText}>
                      <Text style={styles.resultTitle}>{result.testName}</Text>
                      <View style={styles.resultMeta}>
                        <Calendar size={14} color="#6b7280" />
                        <Text style={styles.resultDate}>
                          Test Date: {formatDate(result.testDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => viewResult(result)}
                  >
                    <Eye size={16} color="#0066CC" />
                  </TouchableOpacity>
                </View>

                {result.results && (
                  <View style={styles.resultContent}>
                    <Text style={styles.resultText} numberOfLines={3}>
                      {result.results}
                    </Text>
                  </View>
                )}

                {result.doctorComments && (
                  <View style={styles.doctorComments}>
                    <Text style={styles.doctorCommentsLabel}>Doctor's Comments:</Text>
                    <Text style={styles.doctorCommentsText}>{result.doctorComments}</Text>
                  </View>
                )}

                <View style={styles.resultFooter}>
                  <Text style={styles.uploadDate}>
                    Uploaded: {formatDate(result.createdAt)}
                  </Text>
                  {result.fileUrl && (
                    <TouchableOpacity style={styles.downloadButton}>
                      <Download size={14} color="#0066CC" />
                      <Text style={styles.downloadText}>Download</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FileText size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Lab Results Yet</Text>
            <Text style={styles.emptyStateText}>
              Upload your lab test reports to keep track of your health records
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowUploadModal(true)}
            >
              <Upload size={16} color="#ffffff" />
              <Text style={styles.emptyStateButtonText}>Upload First Result</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Health Tips */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Lab Test Tips</Text>
            <Text style={styles.tipText}>
              • Always upload clear, readable copies of your lab reports{'\n'}
              • Include the test date and laboratory name{'\n'}
              • Keep original reports in a safe place{'\n'}
              • Share results with your doctor during consultations
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Lab Result</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Test Name Input */}
            <Text style={styles.inputLabel}>Test Name *</Text>
            <TextInput
              style={styles.textInput}
              value={testName}
              onChangeText={setTestName}
              placeholder="e.g., Blood Test, X-Ray Chest, etc."
              placeholderTextColor="#9ca3af"
            />

            {/* Test Date Input */}
            <Text style={styles.inputLabel}>Test Date *</Text>
            <TextInput
              style={styles.textInput}
              value={testDate}
              onChangeText={setTestDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />

            {/* File Selection */}
            <Text style={styles.inputLabel}>Select File *</Text>
            <TouchableOpacity style={styles.fileSelector} onPress={pickDocument}>
              <View style={styles.fileSelectorContent}>
                {selectedFile ? (
                  <>
                    <FileText size={24} color="#00AA44" />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{selectedFile.name}</Text>
                      <Text style={styles.fileSize}>
                        {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="#6b7280" />
                    <View style={styles.fileInfo}>
                      <Text style={styles.filePlaceholder}>Choose file</Text>
                      <Text style={styles.fileHint}>PDF or image files only</Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Upload Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Upload Guidelines:</Text>
              <Text style={styles.instructionsText}>
                • File types: PDF, JPG, PNG{'\n'}
                • Maximum size: 10MB{'\n'}
                • Ensure the document is clear and readable{'\n'}
                • Include all pages if multi-page report
              </Text>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                (!testName.trim() || !selectedFile) && styles.uploadButtonDisabled,
              ]}
              onPress={handleUpload}
              disabled={!testName.trim() || !selectedFile || isLoading}
            >
              <Upload size={16} color="#ffffff" />
              <Text style={styles.uploadButtonText}>
                {isLoading ? 'Uploading...' : 'Upload Result'}
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
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  resultIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resultTitleText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewButton: {
    padding: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  resultContent: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  doctorComments: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  doctorCommentsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  doctorCommentsText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadText: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  fileSelector: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  fileSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 14,
    color: '#6b7280',
  },
  filePlaceholder: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  fileHint: {
    fontSize: 14,
    color: '#9ca3af',
  },
  instructionsContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});