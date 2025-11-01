import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View, Alert, Linking } from "react-native";
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
      <Box className="flex-1 bg-background-0 p-6">
        <VStack space="xl" className="items-center justify-center flex-1">
          {/* Header */}
          <VStack space="md" className="items-center w-full">
            <Text className="text-3xl font-bold text-center">📸</Text>
            <Text className="text-2xl font-bold text-center">Nora Studio</Text>
            <Text className="text-lg text-center text-typography-500">
              Lihat Foto Anda
            </Text>
          </VStack>

          {/* Search Form */}
          <VStack space="md" className="w-full">
            <VStack space="sm">
              <Text className="text-base font-semibold">
                Masukkan nomor HP Anda:
              </Text>
              <Input variant="outline" size="lg">
                <InputField
                  placeholder="081234567890 atau 6281234567890"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  editable={!loading}
                />
              </Input>
            </VStack>

            <Button
              onPress={handleSearch}
              action="primary"
              variant="solid"
              size="lg"
              disabled={loading || !phone.trim()}
              className="w-full"
            >
              <ButtonText>{loading ? "Mencari..." : "Cari Foto Saya"}</ButtonText>
            </Button>
          </VStack>

          {/* Info */}
          <VStack space="sm" className="w-full mt-4">
            <View className="bg-info-50 p-4 rounded-lg border border-info-200">
              <Text className="text-sm text-info-800">
                💡 Gunakan nomor HP yang Anda gunakan saat melakukan transaksi di studio
              </Text>
            </View>
          </VStack>

          {/* Quick Links */}
          <VStack space="sm" className="w-full mt-4">
            <Text className="text-sm text-center text-typography-500">
              Butuh bantuan? Hubungi kami di{" "}
              <Text
                className="text-primary-600 underline"
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

