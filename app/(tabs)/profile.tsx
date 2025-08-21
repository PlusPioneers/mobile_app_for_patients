import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, Calendar, MapPin, CreditCard as Edit, LogOut, Shield, Bell, Globe, CircleHelp as HelpCircle, Save, X } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      phone: user?.emergencyContact?.phone || '',
      relation: user?.emergencyContact?.relation || '',
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const profileSections = [
    {
      title: 'Account Settings',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          value: 'Manage your alerts',
          onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon.'),
        },
        {
          icon: Shield,
          label: 'Privacy & Security',
          value: 'Data protection settings',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon.'),
        },
        {
          icon: Globe,
          label: 'Language',
          value: user?.preferredLanguage || 'English',
          onPress: () => Alert.alert('Coming Soon', 'Language settings will be available soon.'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          value: 'Get help with the app',
          onPress: () => Alert.alert('Support', 'For support, please contact your healthcare provider or call the telehealth helpline.'),
        },
      ],
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Edit size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {user?.createdAt && (
            <Text style={styles.memberSince}>
              Member since {formatDate(user.createdAt)}
            </Text>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Phone size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Mail size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {user?.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <MapPin size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        {user?.emergencyContact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <User size={20} color="#dc2626" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{user.emergencyContact.name}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Phone size={20} color="#dc2626" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.emergencyContact.phone}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <User size={20} color="#dc2626" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Relation</Text>
                  <Text style={styles.infoValue}>{user.emergencyContact.relation}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Settings Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <View style={styles.settingsCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingsItem,
                    itemIndex < section.items.length - 1 && styles.settingsItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.settingsIcon}>
                    <item.icon size={20} color="#6b7280" />
                  </View>
                  <View style={styles.settingsContent}>
                    <Text style={styles.settingsLabel}>{item.label}</Text>
                    <Text style={styles.settingsValue}>{item.value}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.firstName}
              onChangeText={(text) => setEditForm({ ...editForm, firstName: text })}
              placeholder="First name"
            />

            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.lastName}
              onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
              placeholder="Last name"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.address}
              onChangeText={(text) => setEditForm({ ...editForm, address: text })}
              placeholder="Your address"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            <Text style={styles.inputLabel}>Emergency Contact Name</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.emergencyContact.name}
              onChangeText={(text) => 
                setEditForm({ 
                  ...editForm, 
                  emergencyContact: { ...editForm.emergencyContact, name: text }
                })
              }
              placeholder="Emergency contact name"
            />

            <Text style={styles.inputLabel}>Emergency Contact Phone</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.emergencyContact.phone}
              onChangeText={(text) => 
                setEditForm({ 
                  ...editForm, 
                  emergencyContact: { ...editForm.emergencyContact, phone: text }
                })
              }
              placeholder="Emergency contact phone"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Relation</Text>
            <TextInput
              style={styles.textInput}
              value={editForm.emergencyContact.relation}
              onChangeText={(text) => 
                setEditForm({ 
                  ...editForm, 
                  emergencyContact: { ...editForm.emergencyContact, relation: text }
                })
              }
              placeholder="e.g., Father, Mother, Spouse"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              <Save size={16} color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
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
  editButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
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
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: '#9ca3af',
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
  infoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingsIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingsValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
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
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
    marginBottom: 20,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});