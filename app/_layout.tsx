import { useColorScheme } from '@/hooks/useColorScheme';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { db } from '@/services/firebase'; // Adjust the import path as necessary
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs } from "firebase/firestore";
import { useEffect } from 'react';
import 'react-native-reanimated';
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });



  useEffect(() => {
    async function loadUsers() {
      const snapshot = await getDocs(collection(db, "transaction"));
      snapshot.forEach((doc) => {
        console.log(doc.id, "=>", doc.data());
      });
    }
    loadUsers();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GluestackUIProvider mode="light"><ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider></GluestackUIProvider>
  );
}
