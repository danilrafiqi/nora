import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getCustomerPhotos, getDaysRemaining, isLinkExpired, PhotoTransaction } from "@/services/photoService";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as Clipboard from "expo-clipboard";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, View } from "react-native";

export default function PhotosResultPage() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [photos, setPhotos] = useState<PhotoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState<string>("");

  useEffect(() => {
    if (phone) {
      loadPhotos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const loadPhotos = async () => {
    if (!phone) return;

    setLoading(true);
    try {
      const data = await getCustomerPhotos(phone);
      // Show all photos (including expired)
      setPhotos(data);
      if (data.length > 0) {
        setCustomerName(data[0].name);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Gagal memuat data foto");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await Clipboard.setStringAsync(link);
      Alert.alert("Berhasil", "Link telah disalin");
    } catch {
      Alert.alert("Error", "Gagal menyalin link");
    }
  };

  const handleOpenLink = async (link: string, expired: boolean) => {
    if (expired) {
      Alert.alert("Link Expired", "Maaf, link ini sudah tidak dapat diakses (kadaluarsa lebih dari 7 hari)");
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) {
        await Linking.openURL(link);
      } else {
        Alert.alert("Error", "Tidak bisa membuka link ini");
      }
    } catch {
      Alert.alert("Error", "Gagal membuka link");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <Box className="flex-1 bg-background-0 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-typography-500">Memuat foto Anda...</Text>
        </Box>
      </>
    );
  }

  if (photos.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Box className="flex-1 bg-background-0 p-6">
            <VStack space="xl" className="items-center justify-center flex-1">
              <Text className="text-4xl">📭</Text>
              <VStack space="sm" className="items-center">
                <Text className="text-xl font-bold text-center">
                  Tidak Ada Foto Ditemukan
                </Text>
                <Text className="text-center text-typography-500">
                  Tidak ada foto yang ditemukan untuk nomor HP ini.
                </Text>
                <Text className="text-center text-typography-500 text-sm mt-2">
                  Pastikan nomor HP yang Anda masukkan sudah benar.
                </Text>
              </VStack>
            </VStack>
          </Box>
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box className="flex-1 bg-background-0">
          {/* Header */}
          <View className="p-6 pb-4 border-b border-border-200">
            <VStack space="xs">
              <Text className="text-2xl font-bold">📸 Foto {customerName}</Text>
              <Text className="text-sm text-typography-500">📱 {phone}</Text>
              <Text className="text-sm text-typography-600">
                Total: {photos.length} {photos.length === 1 ? "transaksi" : "transaksi"}
              </Text>
            </VStack>
          </View>

          {/* Photos List */}
          <View className="p-4">
            <VStack space="md">
              {photos.map((photo) => {
                const expired = isLinkExpired(photo.created_at);
                const daysRemaining = getDaysRemaining(photo.created_at);

                return (
                  <View
                    key={photo.id}
                    className="bg-background-100 p-4 rounded-xl border border-border-200"
                  >
                    <VStack space="sm">
                      {/* Date & Package */}
                      <View className="flex-row justify-between items-start">
                        <VStack space="xs" className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-lg">📅</Text>
                            <Text className="text-base font-semibold">
                              {formatDate(photo.created_at)}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Text className="text-lg">📦</Text>
                            <Text className="text-base text-typography-600">
                              {photo.package}
                            </Text>
                          </View>
                        </VStack>
                      </View>

                      {/* Expiry Status */}
                      {expired ? (
                        <View className="bg-error-50 p-2 rounded-lg border border-error-200">
                          <Text className="text-sm text-error-800">
                            ⚠️ Link Expired (kadaluarsa lebih dari 7 hari)
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-success-50 p-2 rounded-lg border border-success-200">
                          <Text className="text-sm text-success-800">
                            ⏰ Tersisa {daysRemaining} {daysRemaining === 1 ? "hari" : "hari"}
                          </Text>
                        </View>
                      )}

                      {/* Link Display - Sensor jika expired */}
                      <View className="bg-background-50 p-3 rounded-lg border border-border-100">
                        {expired ? (
                          <Text className="text-sm text-typography-400 italic">
                            🔗 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                          </Text>
                        ) : (
                          <Text
                            className="text-sm text-typography-600"
                            numberOfLines={2}
                            ellipsizeMode="middle"
                          >
                            🔗 {photo.link}
                          </Text>
                        )}
                      </View>

                      {/* Actions */}
                      <View className="flex-row gap-2 mt-2">
                        <Button
                          onPress={() => handleCopyLink(photo.link)}
                          action="secondary"
                          variant="outline"
                          className="flex-1"
                          size="md"
                          disabled={expired}
                        >
                          <ButtonText>{expired ? "Tidak Tersedia" : "Salin Link"}</ButtonText>
                        </Button>
                        <Button
                          onPress={() => handleOpenLink(photo.link, expired)}
                          action={expired ? "secondary" : "primary"}
                          variant={expired ? "outline" : "solid"}
                          className="flex-1"
                          size="md"
                          disabled={expired}
                        >
                          <ButtonText>{expired ? "Expired" : "Buka Link"}</ButtonText>
                        </Button>
                      </View>
                    </VStack>
                  </View>
                );
              })}
            </VStack>
          </View>
        </Box>
      </ScrollView>
    </>
  );
}

