/**
 * Claim Photos Page - Bitcoin Energy Style
 * 
 * DETAIL SPECIFICATIONS:
 * - Bitcoin Orange (#F7931A) - bold
 * - Background: Warm pastel (#FFF4E6)
 * - Border Radius: Minimal (6px buttons, 6px inputs)
 * - Button hover: Orange-dark, not grey
 */

import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View, Alert, Linking, Pressable } from "react-native";
import { isValidPhone, normalizePhone } from "@/utils/phoneNormalizer";

export default function SearchPhotosPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmed = phone.trim();
    
    if (!trimmed) {
      Alert.alert("Error", "Masukkan nomor HP Anda");
      return;
    }

    if (!isValidPhone(trimmed)) {
      Alert.alert("Error", "Format nomor HP tidak valid. Contoh: 081234567890 atau 6281234567890");
      return;
    }

    const normalized = normalizePhone(trimmed);
    setLoading(true);
    
    // Navigate to results page
    router.push(`/photos/${normalized}`);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box className="flex-1 bg-accent-peach p-6">
        <VStack space="xl" className="items-center justify-center flex-1">
          {/* Header */}
          <VStack space="md" className="items-center w-full">
            <Text className="text-5xl">📸</Text>
            <Text className="text-3xl font-heading font-bold text-accent-orange">
              NORA STUDIO
            </Text>
            <Text className="text-lg text-center font-body text-typography-600">
              Lihat Foto Anda
            </Text>
          </VStack>

          {/* Search Form */}
          <VStack space="md" className="w-full max-w-md">
            <VStack space="sm">
              <Text className="text-base font-body font-semibold text-typography-900">
                Masukkan nomor HP Anda:
              </Text>
              <Input variant="outline" size="lg" className="bg-white rounded border-outline-200">
                <InputField
                  placeholder="081234567890 atau 6281234567890"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  editable={!loading}
                  className="font-body"
                />
              </Input>
            </VStack>

            <Pressable
              onPress={handleSearch}
              disabled={loading || !phone.trim()}
              className="w-full bg-accent-orange px-6 py-3 rounded shadow-medium active:bg-accent-orangeDark disabled:opacity-50"
            >
              <Text className="text-white font-body font-semibold text-center text-base">
                {loading ? "Mencari..." : "Cari Foto Saya"}
              </Text>
            </Pressable>
          </VStack>

          {/* Info */}
          <VStack space="sm" className="w-full max-w-md mt-4">
            <View className="bg-accent-orange/10 p-4 rounded border border-accent-orange/20">
              <Text className="text-sm font-body text-typography-900">
                💡 Gunakan nomor HP yang Anda gunakan saat melakukan transaksi di studio
              </Text>
            </View>
          </VStack>

          {/* Quick Links */}
          <VStack space="sm" className="w-full max-w-md mt-4">
            <Text className="text-sm text-center font-body text-typography-600">
              Butuh bantuan? Hubungi kami di{" "}
              <Text
                className="text-accent-orange font-semibold underline"
                onPress={() => Linking.openURL("https://wa.me/6281234567890")}
              >
                WhatsApp
              </Text>
            </Text>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
}
