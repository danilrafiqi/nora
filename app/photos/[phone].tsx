/**
 * Photo Results Page - Modern Pastel + Bitcoin Orange Energy Theme
 * 
 * VISUAL CHANGES:
 * - Bitcoin Orange accent colors for active states
 * - Pastel background (#FFEDE2)
 * - Rounded-xl cards with shadow-md
 * - Orange buttons for primary actions
 */

import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { getCustomerPhotos, getDaysRemaining, isLinkExpired, PhotoTransaction } from "@/services/photoService";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as Clipboard from "expo-clipboard";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, View } from "react-native";

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
        <Box className="flex-1 bg-accent-peach items-center justify-center">
          <ActivityIndicator size="large" color="#F7931A" />
          <Text className="mt-4 font-body text-typography-600">Memuat foto Anda...</Text>
        </Box>
      </>
    );
  }

  if (photos.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Box className="flex-1 bg-accent-peach p-6">
            <VStack space="xl" className="items-center justify-center flex-1">
              <Text className="text-4xl">📭</Text>
              <VStack space="sm" className="items-center">
                <Text className="text-xl font-heading font-bold text-center text-typography-900">
                  Tidak Ada Foto Ditemukan
                </Text>
                <Text className="text-center font-body text-typography-600">
                  Tidak ada foto yang ditemukan untuk nomor HP ini.
                </Text>
                <Text className="text-center font-body text-typography-600 text-sm mt-2">
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
        <Box className="flex-1 bg-accent-peach">
          {/* Header */}
          <View className="p-6 pb-4 bg-white border-b border-outline-200">
            <VStack space="xs">
              <Text className="text-2xl font-heading font-bold text-accent-orange">
                📸 Foto {customerName}
              </Text>
              <Text className="text-sm font-body text-typography-600">📱 {phone}</Text>
              <Text className="text-sm font-body text-typography-600">
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
                    className="bg-white p-5 rounded-lg border border-outline-200 shadow-medium"
                  >
                    <VStack space="sm">
                      {/* Date & Package */}
                      <View className="flex-row justify-between items-start">
                        <VStack space="xs" className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-lg">📅</Text>
                            <Text className="text-base font-body font-semibold text-text-primary">
                              {formatDate(photo.created_at)}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Text className="text-lg">📦</Text>
                            <Text className="text-base font-body text-text-secondary">
                              {photo.package}
                            </Text>
                          </View>
                        </VStack>
                      </View>

                      {/* Expiry Status */}
                      {expired ? (
                        <View className="bg-error-50 p-3 rounded border border-error-200">
                          <Text className="text-sm font-body text-error-800">
                            ⚠️ Link Expired (kadaluarsa lebih dari 7 hari)
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-success-50 p-3 rounded border border-success-200">
                          <Text className="text-sm font-body text-success-800">
                            ⏰ Tersisa {daysRemaining} {daysRemaining === 1 ? "hari" : "hari"}
                          </Text>
                        </View>
                      )}

                      {/* Link Display - Sensor jika expired */}
                      <View className="bg-offwhite p-3 rounded border border-outline-200">
                        {expired ? (
                          <Text className="text-sm font-body text-typography-400 italic">
                            🔗 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                          </Text>
                        ) : (
                          <Text
                            className="text-sm font-body text-text-secondary"
                            numberOfLines={2}
                            ellipsizeMode="middle"
                          >
                            🔗 {photo.link}
                          </Text>
                        )}
                      </View>

                      {/* Actions */}
                      <View className="flex-row gap-2 mt-2">
                        <Pressable
                          onPress={() => handleCopyLink(photo.link)}
                          disabled={expired}
                          className="flex-1 border border-outline-300 bg-white px-4 py-2.5 rounded active:bg-outline-100 disabled:opacity-50"
                        >
                          <Text className="font-body text-center text-typography-700">
                            {expired ? "Tidak Tersedia" : "Salin Link"}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleOpenLink(photo.link, expired)}
                          disabled={expired}
                          className={`flex-1 px-4 py-2.5 rounded shadow-medium ${expired
                            ? 'bg-typography-400'
                            : 'bg-accent-orange active:bg-accent-orangeDark'
                            } disabled:opacity-50`}
                        >
                          <Text className="font-body font-semibold text-center text-white">
                            {expired ? "Expired" : "Buka Link"}
                          </Text>
                        </Pressable>
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
