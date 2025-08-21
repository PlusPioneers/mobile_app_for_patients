import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, Calendar, FileText, Activity, CircleAlert as AlertCircle, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useConsultationsStore } from '@/stores/consultationsStore';
import { useNotificationsStore } from '@/stores/notificationsStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { consultations, getConsultations } = useConsultationsStore();
  const { notifications, unreadCount, getNotifications } = useNotificationsStore();
  
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh data
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const upcomingConsultations = consultations.filter(
    c => c.status === 'scheduled' && new Date(c.scheduledAt) > new Date()
  ).slice(0, 3);

  const recentNotifications = notifications
    .filter(n => !n.isRead)
    .slice(0, 3);

  const quickActions = [
    {
      title: 'Record Symptoms',
      subtitle: 'Voice recording',
      icon: Mic,
      color: '#0066CC',
      onPress: () => router.push('/symptoms'),
    },
    {
      title: 'Book Consultation',
      subtitle: 'Talk to doctor',
      icon: Calendar,
      color: '#00AA44',
      onPress: () => router.push('/consultations'),
    },
    {
      title: 'Lab Results',
      subtitle: 'View reports',
      icon: FileText,
      color: '#FF6B35',
      onPress: () => router.push('/lab-results'),
    },
    {
      title: 'Health Status',
      subtitle: 'Check vitals',
      icon: Activity,
      color: '#9333EA',
      onPress: () => Alert.alert('Feature Coming Soon', 'Health monitoring will be available in the next update.'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.firstName || 'Patient'}</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.notificationBadge}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={20} color="#ffffff" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <action.icon size={24} color={action.color} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Appointments */}
        {upcomingConsultations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {upcomingConsultations.map((consultation) => (
              <TouchableOpacity
                key={consultation.id}
                style={styles.appointmentCard}
                onPress={() => router.push('/consultations')}
              >
                <View style={styles.appointmentTime}>
                  <Clock size={16} color="#6b7280" />
                  <Text style={styles.appointmentTimeText}>
                    {new Date(consultation.scheduledAt).toLocaleDateString()} at{' '}
                    {new Date(consultation.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.appointmentDoctor}>
                  Dr. {consultation.doctorId} • {consultation.type} call
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Alerts */}
        {recentNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {recentNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={styles.alertCard}
                onPress={() => router.push('/notifications')}
              >
                <View style={styles.alertIcon}>
                  <AlertCircle size={20} color="#FF6B35" />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{notification.title}</Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Health Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Health Tip</Text>
            <Text style={styles.tipText}>
              Stay hydrated! Drink at least 8 glasses of water daily to maintain good health, 
              especially important in rural areas with hot weather.
            </Text>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '700',
    marginTop: 4,
  },
  notificationBadge: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#0066CC',
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  quickActions: {
    paddingHorizontal: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00AA44',
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTimeText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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
});