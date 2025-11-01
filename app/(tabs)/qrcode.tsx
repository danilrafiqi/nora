import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Platform, ScrollView, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRCodeGeneratorScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [url, setUrl] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const qrRef = useRef<QRCode | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user]);

  const isValid = useMemo(() => {
    if (!value) return false;
    try {
      // Allow missing protocol by attempting to prepend https
      const candidate = value.match(/^https?:\/\//) ? value : `https://${value}`;
      new URL(candidate);
      return true;
    } catch {
      return false;
    }
  }, [value]);

  const handleGenerate = () => {
    setValue(url.trim());
    Keyboard.dismiss();
  };

  const displayValue = useMemo(() => {
    if (!value) return "";
    return value.match(/^https?:\/\//) ? value : `https://${value}`;
  }, [value]);

  const downloadJpgNative = async (pngBase64: string) => {
    // write PNG to cache
    const pngPath = FileSystem.cacheDirectory + `qr_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(pngPath, pngBase64, { encoding: FileSystem.EncodingType.Base64 });
    // convert to JPEG
    const manipulated = await ImageManipulator.manipulateAsync(
      pngPath,
      [],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
    );
    // request permission and save
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Izin penyimpanan ditolak");
    }
    await MediaLibrary.saveToLibraryAsync(manipulated.uri);
  };

  const downloadJpgWeb = async (pngBase64: string) => {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve();
        ctx.drawImage(image, 0, 0);
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 1.0);
        const link = document.createElement("a");
        link.href = jpegDataUrl;
        link.download = `qrcode_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      };
      image.src = `data:image/png;base64,${pngBase64}`;
    });
  };

  const handleSaveJpg = async () => {
    if (!isValid || !qrRef.current) return;
    setIsSaving(true);
    try {
      // react-native-qrcode-svg toDataURL returns base64 PNG
      qrRef.current.toDataURL(async (data: string) => {
        try {
          if (Platform.OS === "web") {
            await downloadJpgWeb(data);
          } else {
            await downloadJpgNative(data);
          }
        } finally {
          setIsSaving(false);
        }
      });
    } catch (e) {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 16 }}>
        <Text className="text-xl font-bold">Generate QR Code</Text>
        <Input variant="outline" size="md">
          <InputField
            placeholder="Paste atau ketik URL (contoh: https://example.com)"
            autoCapitalize="none"
            autoCorrect={false}
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            returnKeyType="done"
            onSubmitEditing={handleGenerate}
          />
        </Input>

        <Button onPress={handleGenerate} action="primary" variant="solid" disabled={!url.trim()}>
          <ButtonText>Buat QR</ButtonText>
        </Button>

        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          {isValid ? (
            <View style={{ alignItems: "center", gap: 12 }}>
              <QRCode value={displayValue} size={240} getRef={(c) => (qrRef.current = c)} />
              <Text className="text-center text-sm" selectable>
                {displayValue}
              </Text>
              <Button onPress={handleSaveJpg} action="secondary" variant="outline" disabled={isSaving}>
                <ButtonText>{isSaving ? "Menyimpan..." : "Simpan JPG"}</ButtonText>
              </Button>
            </View>
          ) : (
            <Text className="text-center text-muted-500">
              Masukkan URL valid, lalu tekan "Buat QR".
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}


