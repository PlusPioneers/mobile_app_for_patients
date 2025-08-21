import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone,
  Calendar,
  MapPin
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'other' as 'male' | 'female' | 'other',
    address: '',
    password: '',
    confirmPassword: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: '',
    },
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first and last name');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (phone && phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      
      const { confirmPassword, ...registrationData } = formData;
      await register({
        ...registrationData,
        email: registrationData.email.toLowerCase().trim(),
        preferredLanguage: 'en',
      });
      
      router.replace('/(tabs)');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateEmergencyContact = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🏥</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join our telehealth platform to access quality healthcare
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Name Fields */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>First Name *</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => updateField('firstName', text)}
                    placeholder="First name"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.label}>Last Name *</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => updateField('lastName', text)}
                    placeholder="Last name"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  placeholder="Your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.dateOfBirth}
                  onChangeText={(text) => updateField('dateOfBirth', text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.genderButtonSelected,
                    ]}
                    onPress={() => updateField('gender', gender)}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === gender && styles.genderButtonTextSelected,
                      ]}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => updateField('address', text)}
                  placeholder="Your address"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>
            </View>

            {/* Emergency Contact Section */}
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Emergency Contact Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#dc2626" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.emergencyContact.name}
                  onChangeText={(text) => updateEmergencyContact('name', text)}
                  placeholder="Emergency contact name"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Emergency Contact Phone</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#dc2626" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.emergencyContact.phone}
                  onChangeText={(text) => updateEmergencyContact('phone', text)}
                  placeholder="Emergency contact phone"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Relation</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#dc2626" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.emergencyContact.relation}
                  onChangeText={(text) => updateEmergencyContact('relation', text)}
                  placeholder="e.g., Father, Mother, Spouse"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Password Fields */}
            <Text style={styles.sectionTitle}>Account Security</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  placeholder="Choose a secure password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6b7280" />
                  ) : (
                    <Eye size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign in here</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  genderButtonSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F9FF',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  genderButtonTextSelected: {
    color: '#0066CC',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#0066CC',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 16,
  },
  footerLink: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
  },
});