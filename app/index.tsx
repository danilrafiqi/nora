import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;

// Services data untuk Nora Studio
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

// Frame catalog categories
const frameCategories = [
  {
    id: "selfie_time",
    name: "Selfie Time",
    frames: [
      { id: "1", name: "Aesthetic Pink", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=300&fit=crop" },
      { id: "2", name: "Vintage Vibes", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=300&h=300&fit=crop" },
      { id: "3", name: "Dreamy Pastel", image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=300&fit=crop" },
    ],
  },
  {
    id: "collab_fanbase",
    name: "Collab Fanbase",
    frames: [
      { id: "4", name: "Group Aesthetic", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop" },
      { id: "5", name: "Friends Forever", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop" },
      { id: "6", name: "Party Mode", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop" },
    ],
  },
  {
    id: "license",
    name: "License",
    frames: [
      { id: "7", name: "Classic White", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop" },
      { id: "8", name: "Professional Blue", image: "https://images.unsplash.com/photo-1493863641943-9b67192f852b?w=300&h=300&fit=crop" },
    ],
  },
  {
    id: "seasonal",
    name: "Seasonal",
    frames: [
      { id: "9", name: "Holiday Special", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop" },
      { id: "10", name: "Summer Vibes", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" },
    ],
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

// Blog posts
const blogPosts = [
  {
    id: "1",
    date: "15 Jan 2024",
    title: "Tips Foto Aesthetic di Nora Studio",
    snippet: "Pelajari cara mendapatkan hasil foto yang aesthetic dengan tips dari tim professional kami...",
  },
  {
    id: "2",
    date: "10 Jan 2024",
    title: "Frame Catalog Terbaru untuk Tahun 2024",
    snippet: "Rasakan pengalaman foto yang lebih seru dengan frame catalog terbaru dari Nora Studio...",
  },
  {
    id: "3",
    date: "5 Jan 2024",
    title: "Promo Spesial Bulan Januari",
    snippet: "Dapatkan diskon hingga 30% untuk semua paket foto di bulan Januari ini. Limited time only!",
  },
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
  const [activeFrameTab, setActiveFrameTab] = useState("selfie_time");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert("Error", "Gagal membuka link");
    }
  };

  const activeFrames = frameCategories.find(cat => cat.id === activeFrameTab)?.frames || [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Navbar - Fixed Top */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        {/* Logo */}
        <Text className="text-2xl font-bold" style={{ color: '#FF6B9D' }}>
          📸 Nora Studio
        </Text>

        {/* Desktop Menu */}
        {!isMobile && (
          <HStack space="lg" className="items-center">
            <Pressable onPress={() => { }}>
              <Text className="text-base text-typography-700 hover:text-primary-500">About Us</Text>
            </Pressable>
            <Pressable onPress={() => { }}>
              <Text className="text-base text-typography-700 hover:text-primary-500">Price List</Text>
            </Pressable>
            <Pressable onPress={() => { }}>
              <Text className="text-base text-typography-700 hover:text-primary-500">Download App</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/login')}>
              <Text className="text-base text-typography-700 hover:text-primary-500">Login</Text>
            </Pressable>
          </HStack>
        )}

        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <Pressable onPress={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Text className="text-2xl">☰</Text>
          </Pressable>
        )}
      </View>

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <View
          className="bg-white shadow-lg"
          style={{
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            zIndex: 40,
            padding: 16,
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Pressable onPress={() => setMobileMenuOpen(false)}><Text className="text-base">About Us</Text></Pressable>
          <Pressable onPress={() => setMobileMenuOpen(false)}><Text className="text-base">Price List</Text></Pressable>
          <Pressable onPress={() => setMobileMenuOpen(false)}><Text className="text-base">Download App</Text></Pressable>
          <Pressable onPress={() => { router.push('/login'); }}>
            <Text className="text-base">Login</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 70 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View
          style={{
            width: '100%',
            height: 500,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFE5F0',
            position: 'relative',
          }}
        >
          {/* Background Image */}
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop" }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0.3,
            }}
            resizeMode="cover"
          />

          {/* Hero Content */}
          <VStack space="lg" className="items-center" style={{ paddingHorizontal: 20, zIndex: 10 }}>
            <Text
              className="text-5xl font-bold text-center"
              style={{ color: '#FF6B9D', fontSize: isMobile ? 32 : 48 }}
            >
              Capture Your Best Moment
            </Text>

            <Text
              className="text-xl text-center"
              style={{ color: '#666', fontSize: isMobile ? 16 : 20 }}
            >
              Booth aesthetic dengan vibes kekinian
            </Text>

            <View
              style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <Button
                onPress={() => { }}
                action="primary"
                variant="solid"
                size="lg"
                style={{ backgroundColor: '#FF6B9D' }}
              >
                <ButtonText>Book Now</ButtonText>
              </Button>
              <Button
                onPress={() => { }}
                action="secondary"
                variant="outline"
                size="lg"
                style={{ borderColor: '#FF6B9D' }}
              >
                <ButtonText style={{ color: '#FF6B9D' }}>Download App</ButtonText>
              </Button>
            </View>
          </VStack>
        </View>

        {/* Our Services Section */}
        <View className="py-12 px-6" style={{ backgroundColor: '#FFFFFF' }}>
          <VStack space="lg">
            <Text className="text-3xl font-bold text-center" style={{ color: '#333' }}>
              Our Services
            </Text>

            {/* Services Grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              {services.map((service, index) => (
                <TouchableOpacity
                  key={service.id}
                  activeOpacity={0.8}
                  style={{
                    width: isMobile ? '100%' : '30%',
                    maxWidth: 350,
                    backgroundColor: '#FFF',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <VStack space="md" className="items-center">
                    <Text className="text-4xl">{service.icon}</Text>
                    <Image
                      source={{ uri: service.image }}
                      style={{ width: '100%', height: 180, borderRadius: 12, marginVertical: 12 }}
                      resizeMode="cover"
                    />
                    <Text className="text-xl font-semibold text-center" style={{ color: '#333' }}>
                      {service.name}
                    </Text>
                    <Text className="text-sm text-center" style={{ color: '#666' }}>
                      {service.description}
                    </Text>
                  </VStack>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </View>

        {/* Frame Catalog Section */}
        {/* <View className="py-12 px-6" style={{ backgroundColor: '#FFF9FB' }}>
          <VStack space="lg">
            <Text className="text-3xl font-bold text-center" style={{ color: '#333' }}>
              Pilih Frame Catalog Sesuai Mood Kamu
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8, gap: 12 }}
            >
              {frameCategories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setActiveFrameTab(category.id)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: activeFrameTab === category.id ? '#FF6B9D' : '#FFF',
                    borderWidth: 1,
                    borderColor: activeFrameTab === category.id ? '#FF6B9D' : '#E0E0E0',
                  }}
                >
                  <Text
                    style={{
                      color: activeFrameTab === category.id ? '#FFF' : '#666',
                      fontWeight: activeFrameTab === category.id ? 'bold' : 'normal',
                    }}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 16,
                marginTop: 20,
              }}
            >
              {activeFrames.map((frame) => (
                <TouchableOpacity
                  key={frame.id}
                  activeOpacity={0.8}
                  style={{
                    width: isMobile ? '45%' : '22%',
                    maxWidth: 250,
                    backgroundColor: '#FFF',
                    borderRadius: 12,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Image
                    source={{ uri: frame.image }}
                    style={{ width: '100%', height: 200 }}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 12 }}>
                    <Text className="text-base font-semibold text-center" style={{ color: '#333' }}>
                      {frame.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </View> */}

        {/* Gallery / Inspiration Section */}
        <View className="py-12 px-6" style={{ backgroundColor: '#FFFFFF' }}>
          <VStack space="lg">
            <VStack space="sm" className="items-center">
              <Text className="text-3xl font-bold" style={{ color: '#333' }}>
                Temukan Inspirasi Gayamu
              </Text>
              <Text className="text-base text-center" style={{ color: '#666' }}>
                Galeri booth aesthetic dengan vibes kekinian
              </Text>
            </VStack>

            {/* Masonry Grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                justifyContent: 'center',
              }}
            >
              {galleryImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  style={{
                    width: isMobile ? '48%' : index % 3 === 0 ? '32%' : '31%',
                    marginBottom: 8,
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    source={{ uri: img }}
                    style={{ width: '100%', height: index % 2 === 0 ? 300 : 250 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View className="items-center mt-4">
              <Button
                onPress={() => { }}
                action="secondary"
                variant="outline"
                size="md"
                style={{ borderColor: '#FF6B9D' }}
              >
                <ButtonText style={{ color: '#FF6B9D' }}>Lihat Inspirasi Lainnya</ButtonText>
              </Button>
            </View>
          </VStack>
        </View>

        {/* Trending / Blog Section */}
        {/* <View className="py-12 px-6" style={{ backgroundColor: '#FFF9FB' }}>
          <VStack space="lg">
            <Text className="text-3xl font-bold text-center" style={{ color: '#333' }}>
              Trending
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              {blogPosts.map((post) => (
                <View
                  key={post.id}
                  style={{
                    width: isMobile ? '100%' : '30%',
                    maxWidth: 350,
                    backgroundColor: '#FFF',
                    borderRadius: 12,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <VStack space="sm">
                    <Text className="text-sm" style={{ color: '#999' }}>
                      {post.date}
                    </Text>
                    <Text className="text-xl font-bold" style={{ color: '#333' }}>
                      {post.title}
                    </Text>
                    <Text className="text-sm" style={{ color: '#666', lineHeight: 20 }}>
                      {post.snippet}
                    </Text>
                    <Pressable onPress={() => { }}>
                      <Text style={{ color: '#FF6B9D', fontWeight: '600', marginTop: 8 }}>
                        Read more →
                      </Text>
                    </Pressable>
                  </VStack>
                </View>
              ))}
            </View>
          </VStack>
        </View> */}

        {/* Videos Section */}
        <View className="py-12 px-6" style={{ backgroundColor: '#FFFFFF' }}>
          <VStack space="lg">
            <Text className="text-3xl font-bold text-center" style={{ color: '#333' }}>
              Our Videos
            </Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              {videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  activeOpacity={0.8}
                  style={{
                    width: isMobile ? '45%' : '22%',
                    maxWidth: 280,
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri: video.thumbnail }}
                    style={{ width: '100%', height: 280, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  {/* Play Icon Overlay */}
                  <View
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginLeft: -25,
                      marginTop: -25,
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: 'rgba(255, 107, 157, 0.9)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 20 }}>▶</Text>
                  </View>
                  <Text className="text-sm font-semibold text-center mt-2" style={{ color: '#333' }}>
                    {video.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </View>

        {/* Footer */}
        <View className="py-12 px-6" style={{ backgroundColor: '#333', paddingVertical: 40 }}>
          <VStack space="lg">
            {/* Top Footer */}
            <View
              style={{
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'flex-start',
                gap: 40,
                flexWrap: 'wrap',
              }}
            >
              {/* Brand */}
              <VStack space="md" style={{ flex: isMobile ? 1 : 0.3 }}>
                <Text className="text-2xl font-bold" style={{ color: '#FF6B9D' }}>
                  📸 Nora Studio
                </Text>
                <Text className="text-sm" style={{ color: '#999' }}>
                  Creative Photography Studio dengan booth aesthetic dan vibes kekinian
                </Text>
              </VStack>

              {/* Links */}
              <VStack space="sm" style={{ flex: isMobile ? 1 : 0.2 }}>
                <Text className="text-base font-semibold" style={{ color: '#FFF', marginBottom: 8 }}>
                  Quick Links
                </Text>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm" style={{ color: '#CCC', marginBottom: 4 }}>About Us</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm" style={{ color: '#CCC', marginBottom: 4 }}>Outlets</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm" style={{ color: '#CCC', marginBottom: 4 }}>Contact</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm" style={{ color: '#CCC', marginBottom: 4 }}>Blog</Text>
                </Pressable>
              </VStack>

              {/* App Download */}
              <VStack space="sm" style={{ flex: isMobile ? 1 : 0.3 }}>
                <Text className="text-base font-semibold" style={{ color: '#FFF', marginBottom: 8 }}>
                  Download App
                </Text>
                <Pressable
                  onPress={() => { }}
                  style={{
                    backgroundColor: '#000',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Text style={{ color: '#FFF' }}>📱</Text>
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Play Store</Text>
                </Pressable>
                <Pressable
                  onPress={() => { }}
                  style={{
                    backgroundColor: '#000',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Text style={{ color: '#FFF' }}>🍎</Text>
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>App Store</Text>
                </Pressable>
              </VStack>
            </View>

            {/* Copyright */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#555',
                paddingTop: 20,
                marginTop: 20,
              }}
            >
              <Text className="text-sm text-center" style={{ color: '#999' }}>
                © {new Date().getFullYear()} Nora Studio. All rights reserved.
              </Text>
            </View>
          </VStack>
        </View>
      </ScrollView>
    </>
  );
}
