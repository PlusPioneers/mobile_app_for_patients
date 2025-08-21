import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Calendar, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, Clock } from 'lucide-react-native';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useAuthStore } from '@/stores/authStore';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const { token } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    getNotifications, 
    markAsRead,
    clearError 
  } = useNotificationsStore();
  
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (token) {
      getNotifications(token);
    }
  }, [token]);

  const onRefresh = async () => {
    if (!token) return;
    
    setRefreshing(true);
    try {
      await getNotifications(token);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!token) return;
    
    if (!notification.isRead) {
      await markAsRead(token, notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'outbreak':
        return AlertTriangle;
      case 'reminder':
        return Clock;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return '#0066CC';
      case 'outbreak':
        return '#dc2626';
      case 'reminder':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const sortedDates = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getDateLabel = (dateString: string) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

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
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        {/* Notifications List */}
        {sortedDates.length > 0 ? (
          sortedDates.map((dateString) => (
            <View key={dateString} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{getDateLabel(dateString)}</Text>
              {groupedNotifications[dateString].map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.unreadNotification,
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationContent}>
                      <View style={[
                        styles.notificationIcon,
                        { backgroundColor: iconColor + '20' }
                      ]}>
                        <IconComponent size={20} color={iconColor} />
                      </View>
                      
                      <View style={styles.notificationText}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.isRead && styles.unreadTitle,
                        ]}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatNotificationTime(notification.createdAt)}
                        </Text>
                      </View>
                      
                      {!notification.isRead && (
                        <View style={styles.unreadIndicator} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You'll receive notifications about appointments, health alerts, and important updates here.
            </Text>
          </View>
        )}

        {/* Notification Types Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Notification Types</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#0066CC20' }]}>
                <Calendar size={16} color="#0066CC" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoItemTitle}>Appointments</Text>
                <Text style={styles.infoItemDesc}>Consultation reminders and updates</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#dc262620' }]}>
                <AlertTriangle size={16} color="#dc2626" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoItemTitle}>Health Alerts</Text>
                <Text style={styles.infoItemDesc}>Outbreak warnings in your area</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#f59e0b20' }]}>
                <Clock size={16} color="#f59e0b" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoItemTitle}>Reminders</Text>
                <Text style={styles.infoItemDesc}>Medicine and health check reminders</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Stay Updated</Text>
          <Text style={styles.tipText}>
            Enable push notifications to receive real-time health alerts and appointment reminders, 
            even when the app is closed.
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066CC',
    marginLeft: 8,
    marginTop: 8,
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
    lineHeight: 24,
  },
  infoSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  infoTitle: {
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
    padding: 20,
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
    marginBottom: 16,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  infoItemDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 32,
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