/**
 * Homepage - Bitcoin Energy Style
 * 
 * DETAIL SPECIFICATIONS:
 * - Colors: Bitcoin Orange (#F7931A) - bold, energetic
 * - Typography: Bold headings, natural case body
 * - Border Radius: Minimal (6px buttons, 8px cards) - angular Bitcoin style
 * - Shadows: Medium shadows for depth
 * - Buttons: Orange with orange-dark hover (no grey!)
 * - Backgrounds: Alternating cream and white
 */

import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

// Services data
const services = [
  {
    id: "self_foto",
    name: "Self Foto",
    icon: "📸",
    description: "Foto mandiri dengan berbagai konsep dan backdrop menarik",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop",
  },
  {
    id: "fotobox",
    name: "FotoBox",
    icon: "📦",
    description: "Konsep foto dengan booth dan backdrop eksklusif",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop",
  },
  {
    id: "photografer",
    name: "Foto Pakai Photografer",
    icon: "👨‍🎨",
    description: "Foto dengan jasa photographer profesional",
    image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=300&fit=crop",
  },
  {
    id: "photobooth",
    name: "Photobooth Event",
    icon: "🎉",
    description: "Photobooth untuk acara, pernikahan, dan event lainnya",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
  },
  {
    id: "videobooth360",
    name: "VideoBooth360",
    icon: "🎥",
    description: "Video booth dengan teknologi 360 derajat",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=300&fit=crop",
  },
  {
    id: "id_passport",
    name: "ID/Passport Photo",
    icon: "🪪",
    description: "Foto resmi untuk dokumen KTP, passport, dan lainnya",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  },
];

// Gallery images
const galleryImages = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=700&fit=crop",
  "https://images.unsplash.com/photo-1493863641943-9b67192f852b?w=600&h=600&fit=crop",
];

// Video thumbnails
const videos = [
  { id: "1", thumbnail: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop", title: "Behind the Scenes" },
  { id: "2", thumbnail: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop", title: "Customer Stories" },
  { id: "3", thumbnail: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop", title: "Studio Tour" },
  { id: "4", thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop", title: "Photoshoot Tips" },
];

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNavLink, setActiveNavLink] = useState<string | null>(null);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Navbar - Bitcoin Energy */}
      <View className="px-6 py-4 flex-row justify-between items-center absolute top-0 left-0 right-0 z-50 w-full bg-white shadow-medium border-b border-outline-200">
        {/* Logo - Bitcoin Orange, Bold */}
        <Text className="text-xl font-heading font-bold text-accent-orange">
          📸 NORA STUDIO
        </Text>

        {/* Desktop Menu */}
        {!isMobile && (
          <HStack space="lg" className="items-center">
            <Pressable
              onPress={() => setActiveNavLink('about')}
              className="relative pb-1"
            >
              <Text className={`text-sm font-body font-medium ${activeNavLink === 'about' ? 'text-accent-orange' : 'text-typography-700'}`}>
                About Us
              </Text>
              {activeNavLink === 'about' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-orange" />
              )}
            </Pressable>
            <Pressable
              onPress={() => setActiveNavLink('price')}
              className="relative pb-1"
            >
              <Text className={`text-sm font-body font-medium ${activeNavLink === 'price' ? 'text-accent-orange' : 'text-typography-700'}`}>
                Price List
              </Text>
              {activeNavLink === 'price' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-orange" />
              )}
            </Pressable>
            <Pressable
              onPress={() => setActiveNavLink('app')}
              className="relative pb-1"
            >
              <Text className={`text-sm font-body font-medium ${activeNavLink === 'app' ? 'text-accent-orange' : 'text-typography-700'}`}>
                Download App
              </Text>
              {activeNavLink === 'app' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-orange" />
              )}
            </Pressable>
            <Pressable onPress={() => router.push('/login')}>
              <Text className="text-sm font-body font-medium text-typography-700">Login</Text>
            </Pressable>
          </HStack>
        )}

        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <Pressable onPress={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Text className="text-xl text-typography-700">☰</Text>
          </Pressable>
        )}
      </View>

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <View className="bg-white shadow-medium absolute top-[64px] left-0 right-0 z-40 p-5 flex-col gap-4">
          <Pressable onPress={() => setMobileMenuOpen(false)}>
            <Text className="text-base font-body font-medium text-typography-700">About Us</Text>
          </Pressable>
          <Pressable onPress={() => setMobileMenuOpen(false)}>
            <Text className="text-base font-body font-medium text-typography-700">Price List</Text>
          </Pressable>
          <Pressable onPress={() => setMobileMenuOpen(false)}>
            <Text className="text-base font-body font-medium text-typography-700">Download App</Text>
          </Pressable>
          <Pressable onPress={() => { router.push('/login'); setMobileMenuOpen(false); }}>
            <Text className="text-base font-body font-medium text-typography-700">Login</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 72 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Bitcoin Energy */}
        <View className="w-full min-h-[550px] justify-center items-center bg-accent-cream relative px-6 py-20">
          {/* Subtle Background Image */}
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop" }}
            className="absolute w-full h-full opacity-10"
            resizeMode="cover"
          />

          {/* Hero Content */}
          <VStack space="xl" className="items-center max-w-2xl z-10">
            <Text className={`${isMobile ? 'text-4xl' : 'text-6xl'} font-heading font-bold text-center text-accent-orange leading-tight`}>
              Capture Your Best Moment
            </Text>

            <Text className={`${isMobile ? 'text-base' : 'text-lg'} text-center font-body text-typography-600 leading-relaxed max-w-xl`}>
              Booth aesthetic dengan vibes kekinian
            </Text>

            <View className="flex-row gap-4 flex-wrap justify-center mt-4">
              <Pressable
                onPress={() => { }}
                className="bg-accent-orange px-6 py-3 rounded shadow-medium active:bg-accent-orangeDark min-w-[140px]"
              >
                <Text className="text-white font-body font-semibold text-base text-center">Book Now</Text>
              </Pressable>
              <Pressable
                onPress={() => { }}
                className="border-accent-orange border-2 bg-white px-6 py-3 rounded active:bg-accent-orange/10 min-w-[140px]"
              >
                <Text className="text-accent-orange font-body font-semibold text-base text-center">Download App</Text>
              </Pressable>
            </View>
          </VStack>
        </View>

        {/* Our Services Section */}
        <View className="py-20 px-6 bg-white">
          <VStack space="xl" className="items-center">
            <VStack space="sm" className="items-center">
              <Text className="text-4xl font-heading font-bold text-center text-typography-900">
                Our Services
              </Text>
              <View className="h-1 w-20 bg-accent-orange" />
            </VStack>

            {/* Services Grid */}
            <View className="flex-row flex-wrap justify-center gap-6 max-w-6xl">
              {services.map((service, index) => (
                <TouchableOpacity
                  key={service.id}
                  activeOpacity={0.9}
                  className={`${isMobile ? 'w-full' : 'w-[calc(33.333%-16px)]'} max-w-[340px] bg-white rounded-lg p-6 shadow-medium border border-outline-200 active:border-accent-orange`}
                >
                  <VStack space="md" className="items-center">
                    <Text className="text-5xl mb-2">{service.icon}</Text>
                    <Image
                      source={{ uri: service.image }}
                      className="w-full h-[200px] rounded my-2"
                      resizeMode="cover"
                    />
                    <Text className="text-lg font-heading font-bold text-center text-typography-900 mt-2">
                      {service.name}
                    </Text>
                    <Text className="text-sm text-center font-body text-typography-600 leading-relaxed">
                      {service.description}
                    </Text>
                  </VStack>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </View>

        {/* Gallery / Inspiration Section */}
        <View className="py-20 px-6 bg-accent-peach">
          <VStack space="xl" className="items-center w-full">
            <VStack space="sm" className="items-center w-full max-w-2xl">
              <Text className="text-4xl font-heading font-bold text-center text-typography-900">
                Temukan Inspirasi Gayamu
              </Text>
              <View className="h-1 w-20 bg-accent-orange my-2" />
              <Text className="text-base text-center font-body text-typography-600 leading-relaxed px-4">
                Galeri booth aesthetic dengan vibes kekinian
              </Text>
            </VStack>

            {/* Masonry Grid - Angular Style */}
            <View className="w-full flex-row flex-wrap justify-center gap-3" style={{ maxWidth: isMobile ? '100%' : 1200 }}>
              {galleryImages.map((img, index) => {
                const itemWidth = isMobile ? '48%' : index % 3 === 0 ? '32%' : '31.5%';
                const itemHeight = index % 2 === 0 ? 320 : 280;
                return (
                  <View
                    key={index}
                    style={{
                      width: itemWidth,
                      marginBottom: 12,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      className="w-full rounded overflow-hidden shadow-medium"
                    >
                      <Image
                        source={{ uri: img }}
                        style={{ width: '100%', height: itemHeight }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <View className="items-center mt-6">
              <Pressable
                onPress={() => { }}
                className="border-accent-orange border-2 bg-white px-5 py-2.5 rounded active:bg-accent-orange/10"
              >
                <Text className="text-accent-orange font-body font-semibold">Lihat Inspirasi Lainnya</Text>
              </Pressable>
            </View>
          </VStack>
        </View>

        {/* Videos Section */}
        <View className="py-20 px-6 bg-white">
          <VStack space="xl" className="items-center w-full">
            <VStack space="sm" className="items-center w-full">
              <Text className="text-4xl font-heading font-bold text-center text-typography-900">
                Our Videos
              </Text>
              <View className="h-1 w-20 bg-accent-orange" />
            </VStack>

            <View className="w-full flex-row flex-wrap justify-center gap-6" style={{ maxWidth: isMobile ? '100%' : 1200 }}>
              {videos.map((video) => (
                <View
                  key={video.id}
                  style={{
                    width: isMobile ? '45%' : '22%',
                    maxWidth: 260,
                    marginBottom: 16,
                  }}
                  className="relative"
                >
                  <TouchableOpacity activeOpacity={0.9} className="w-full">
                    <Image
                      source={{ uri: video.thumbnail }}
                      style={{ width: '100%', height: 260 }}
                      className="rounded shadow-medium"
                      resizeMode="cover"
                    />
                    {/* Play Icon Overlay - Bitcoin Orange */}
                    <View className="absolute top-1/2 left-1/2" style={{ marginLeft: -24, marginTop: -24 }}>
                      <View className="w-12 h-12 rounded-full bg-accent-orange justify-center items-center shadow-medium border-2 border-white">
                        <Text className="text-white text-xl">▶</Text>
                      </View>
                    </View>
                    <Text className="text-sm font-body font-semibold text-center mt-3 text-typography-900">
                      {video.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </VStack>
        </View>

        {/* Footer */}
        <View className="py-16 px-6 bg-[#1A1A1A]">
          <VStack space="xl">
            {/* Top Footer */}
            <View className={`${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start gap-12 flex-wrap`}>
              {/* Brand */}
              <VStack space="md" className={isMobile ? 'w-full' : 'flex-1 max-w-xs'}>
                <Text className="text-xl font-heading font-bold text-accent-orange">
                  📸 NORA STUDIO
                </Text>
                <Text className="text-sm font-body text-typography-400 leading-relaxed">
                  Creative Photography Studio dengan booth aesthetic dan vibes kekinian
                </Text>
              </VStack>

              {/* Links */}
              <VStack space="sm" className={isMobile ? 'w-full mt-6' : 'flex-1 max-w-[160px]'}>
                <Text className="text-base font-body font-semibold text-white mb-3">
                  Quick Links
                </Text>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm font-body text-typography-400 mb-2">About Us</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm font-body text-typography-400 mb-2">Outlets</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm font-body text-typography-400 mb-2">Contact</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm font-body text-typography-400 mb-2">Blog</Text>
                </Pressable>
              </VStack>

              {/* App Download */}
              <VStack space="sm" className={isMobile ? 'w-full mt-6' : 'flex-1 max-w-[200px]'}>
                <Text className="text-base font-body font-semibold text-white mb-3">
                  Download App
                </Text>
                <Pressable
                  onPress={() => { }}
                  className="bg-[#2A2A2A] px-5 py-3 rounded mb-2 flex-row items-center gap-2 active:bg-[#333333]"
                >
                  <Text className="text-white text-lg">📱</Text>
                  <Text className="text-white font-body font-semibold">Play Store</Text>
                </Pressable>
                <Pressable
                  onPress={() => { }}
                  className="bg-[#2A2A2A] px-5 py-3 rounded flex-row items-center gap-2 active:bg-[#333333]"
                >
                  <Text className="text-white text-lg">🍎</Text>
                  <Text className="text-white font-body font-semibold">App Store</Text>
                </Pressable>
              </VStack>
            </View>

            {/* Copyright */}
            <View className="border-t border-typography-800 pt-6 mt-4">
              <Text className="text-sm text-center font-body text-typography-500">
                © {new Date().getFullYear()} Nora Studio. All rights reserved.
              </Text>
            </View>
          </VStack>
        </View>
      </ScrollView>
    </>
  );
}
