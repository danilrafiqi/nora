import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
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
    <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text className="text-2xl font-bold">Masuk</Text>
      <Text className="text-center text-muted-500">Gunakan akun Google untuk melanjutkan.</Text>
      <Button onPress={signInWithGoogle} action="primary" variant="solid" disabled={loading}>
        <ButtonText>{loading ? 'Memproses...' : 'Masuk dengan Google'}</ButtonText>
      </Button>
    </View>
  );
}


