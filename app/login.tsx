/**
 * Login Page - Bitcoin Energy Style
 * 
 * DETAIL SPECIFICATIONS:
 * - Bitcoin Orange button with orange-dark hover
 * - Warm pastel background (#FFF4E6)
 * - Minimal rounded (6px)
 * - Bold branding
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/transaction');
    }
  }, [user, loading]);

  return (
    <View className="flex-1 bg-accent-peach p-6 items-center justify-center">
      <View className="w-full max-w-md items-center gap-8">
        <Text className="text-5xl mb-2">📸</Text>
        <Text className="text-3xl font-heading font-bold text-accent-orange text-center">
          NORA STUDIO
        </Text>
        <Text className="text-center font-body text-typography-600 leading-relaxed">
          Gunakan akun Google untuk melanjutkan.
        </Text>
        <Pressable
          onPress={signInWithGoogle}
          disabled={loading}
          className="w-full bg-accent-orange px-6 py-3 rounded shadow-medium active:bg-accent-orangeDark disabled:opacity-50"
        >
          <Text className="text-white font-body font-semibold text-center text-base">
            {loading ? 'Memproses...' : 'Masuk dengan Google'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
