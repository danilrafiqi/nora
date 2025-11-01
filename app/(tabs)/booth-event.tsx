import {
  Avatar,
  AvatarFallbackText,
  AvatarImage
} from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import React from 'react';
import { Linking, SafeAreaView } from 'react-native';

export default function BioLink() {
  const links = [
    { title: 'Website', url: 'https://norastudio.id' },
    { title: 'Instagram', url: 'https://instagram.com/yourusername' },
    { title: 'YouTube', url: 'https://youtube.com/@yourchannel' },
  ];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 items-center bg-background-0 p-6">
        <VStack space="lg" className="items-center w-full">
          {/* Avatar */}
          <Avatar size="2xl">
            <AvatarFallbackText>Nora Studio</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=687&q=80',
              }}
            />
          </Avatar>

          {/* Nama & Deskripsi */}
          <Text className="text-xl font-bold">Nora Studio</Text>
          <Text className="text-sm text-typography-500">
            Creative Photography Studio 📸
          </Text>

          {/* Daftar Link */}
          <VStack space="md" className="w-full mt-6">
            {links.map((link, idx) => (
              <Button
                key={idx}
                className="rounded-xl"
                action="primary"
                onPress={() => handleOpenLink(link.url)}
              >
                <ButtonText>{link.title}</ButtonText>
              </Button>
            ))}
          </VStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
