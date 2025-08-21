import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus, isLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    };

    initAuth();
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0066CC" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});