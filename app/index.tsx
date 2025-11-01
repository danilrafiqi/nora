import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  // Alert, // Commented - not used currently
  Dimensions,
  Image,
  // Linking, // Commented - not used currently
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

// Frame catalog categories - commented out since section is disabled
/*
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
*/

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

// Blog posts - commented out since section is disabled
// const blogPosts = [
//   {
//     id: "1",
//     date: "15 Jan 2024",
//     title: "Tips Foto Aesthetic di Nora Studio",
//     snippet: "Pelajari cara mendapatkan hasil foto yang aesthetic dengan tips dari tim professional kami...",
//   },
//   {
//     id: "2",
//     date: "10 Jan 2024",
//     title: "Frame Catalog Terbaru untuk Tahun 2024",
//     snippet: "Rasakan pengalaman foto yang lebih seru dengan frame catalog terbaru dari Nora Studio...",
//   },
//   {
//     id: "3",
//     date: "5 Jan 2024",
//     title: "Promo Spesial Bulan Januari",
//     snippet: "Dapatkan diskon hingga 30% untuk semua paket foto di bulan Januari ini. Limited time only!",
//   },
// ];

// Video thumbnails
const videos = [
  { id: "1", thumbnail: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop", title: "Behind the Scenes" },
  { id: "2", thumbnail: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop", title: "Customer Stories" },
  { id: "3", thumbnail: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop", title: "Studio Tour" },
  { id: "4", thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop", title: "Photoshoot Tips" },
];

export default function HomePage() {
  const router = useRouter();
  // const [activeFrameTab, setActiveFrameTab] = useState("selfie_time"); // Commented - Frame Catalog section disabled
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // const handleOpenLink = async (url: string) => { // Commented - not used currently
  //   try {
  //     const canOpen = await Linking.canOpenURL(url);
  //     if (canOpen) {
  //       await Linking.openURL(url);
  //     }
  //   } catch {
  //     Alert.alert("Error", "Gagal membuka link");
  //   }
  // };

  // const activeFrames = frameCategories.find(cat => cat.id === activeFrameTab)?.frames || []; // Commented - Frame Catalog section disabled

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Navbar - Fixed Top */}
      <View className="px-4 py-3 flex-row justify-between items-center absolute top-0 left-0 right-0 z-50 w-full bg-white/95 shadow-md">
        {/* Logo */}
        <Text className="text-2xl font-bold text-[#FF6B9D]">
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
        <View className="bg-white shadow-lg absolute top-[60px] left-0 right-0 z-40 p-4 flex-col gap-3">
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
        <View className="w-full h-[500px] justify-center items-center bg-[#FFE5F0] relative">
          {/* Background Image */}
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop" }}
            className="absolute w-full h-full opacity-30"
            resizeMode="cover"
          />

          {/* Hero Content */}
          <VStack space="lg" className="items-center px-5 z-10">
            <Text className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-center text-[#FF6B9D]`}>
              Capture Your Best Moment
            </Text>

            <Text className={`${isMobile ? 'text-base' : 'text-xl'} text-center text-[#666]`}>
              Booth aesthetic dengan vibes kekinian
            </Text>

            <View className="flex-row gap-3 flex-wrap justify-center">
              <Button
                onPress={() => { }}
                action="primary"
                variant="solid"
                size="lg"
                className="bg-[#FF6B9D]"
              >
                <ButtonText>Book Now</ButtonText>
              </Button>
              <Button
                onPress={() => { }}
                action="secondary"
                variant="outline"
                size="lg"
                className="border-[#FF6B9D]"
              >
                <ButtonText className="text-[#FF6B9D]">Download App</ButtonText>
              </Button>
            </View>
          </VStack>
        </View>

        {/* Our Services Section */}
        <View className="py-12 px-6 bg-white">
          <VStack space="lg">
            <Text className="text-3xl font-bold text-center text-[#333]">
              Our Services
            </Text>

            {/* Services Grid */}
            <View className="flex-row flex-wrap justify-center gap-5">
              {services.map((service, index) => (
                <TouchableOpacity
                  key={service.id}
                  activeOpacity={0.8}
                  className={`${isMobile ? 'w-full' : 'w-[30%]'} max-w-[350px] bg-white rounded-2xl p-5 shadow-lg`}
                >
                  <VStack space="md" className="items-center">
                    <Text className="text-4xl">{service.icon}</Text>
                    <Image
                      source={{ uri: service.image }}
                      className="w-full h-[180px] rounded-xl my-3"
                      resizeMode="cover"
                    />
                    <Text className="text-xl font-semibold text-center text-[#333]">
                      {service.name}
                    </Text>
                    <Text className="text-sm text-center text-[#666]">
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
        <View className="py-12 px-6 bg-white">
          <VStack space="lg">
            <VStack space="sm" className="items-center">
              <Text className="text-3xl font-bold text-[#333]">
                Temukan Inspirasi Gayamu
              </Text>
              <Text className="text-base text-center text-[#666]">
                Galeri booth aesthetic dengan vibes kekinian
              </Text>
            </VStack>

            {/* Masonry Grid */}
            <View className="flex-row flex-wrap gap-2 justify-center">
              {galleryImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  className={`${isMobile ? 'w-[48%]' : index % 3 === 0 ? 'w-[32%]' : 'w-[31%]'} mb-2 rounded-xl overflow-hidden`}
                >
                  <Image
                    source={{ uri: img }}
                    className={`w-full ${index % 2 === 0 ? 'h-[300px]' : 'h-[250px]'}`}
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
                className="border-[#FF6B9D]"
              >
                <ButtonText className="text-[#FF6B9D]">Lihat Inspirasi Lainnya</ButtonText>
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
        <View className="py-12 px-6 bg-white">
          <VStack space="lg">
            <Text className="text-3xl font-bold text-center text-[#333]">
              Our Videos
            </Text>

            <View className="flex-row flex-wrap justify-center gap-4">
              {videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  activeOpacity={0.8}
                  className={`${isMobile ? 'w-[45%]' : 'w-[22%]'} max-w-[280px] relative`}
                >
                  <Image
                    source={{ uri: video.thumbnail }}
                    className="w-full h-[280px] rounded-xl"
                    resizeMode="cover"
                  />
                  {/* Play Icon Overlay */}
                  <View className="absolute top-1/2 left-1/2 -ml-[25px] -mt-[25px] w-[50px] h-[50px] rounded-full bg-[rgba(255,107,157,0.9)] justify-center items-center">
                    <Text className="text-white text-xl">▶</Text>
                  </View>
                  <Text className="text-sm font-semibold text-center mt-2 text-[#333]">
                    {video.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </VStack>
        </View>

        {/* Footer */}
        <View className="py-10 px-6 bg-[#333]">
          <VStack space="lg">
            {/* Top Footer */}
            <View className={`${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start gap-10 flex-wrap`}>
              {/* Brand */}
              <VStack space="md" className={isMobile ? 'flex-1' : 'flex-[0.3]'}>
                <Text className="text-2xl font-bold text-[#FF6B9D]">
                  📸 Nora Studio
                </Text>
                <Text className="text-sm text-[#999]">
                  Creative Photography Studio dengan booth aesthetic dan vibes kekinian
                </Text>
              </VStack>

              {/* Links */}
              <VStack space="sm" className={isMobile ? 'flex-1' : 'flex-[0.2]'}>
                <Text className="text-base font-semibold text-white mb-2">
                  Quick Links
                </Text>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm text-[#CCC] mb-1">About Us</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm text-[#CCC] mb-1">Outlets</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm text-[#CCC] mb-1">Contact</Text>
                </Pressable>
                <Pressable onPress={() => { }}>
                  <Text className="text-sm text-[#CCC] mb-1">Blog</Text>
                </Pressable>
              </VStack>

              {/* App Download */}
              <VStack space="sm" className={isMobile ? 'flex-1' : 'flex-[0.3]'}>
                <Text className="text-base font-semibold text-white mb-2">
                  Download App
                </Text>
                <Pressable
                  onPress={() => { }}
                  className="bg-black px-4 py-3 rounded-lg mb-2 flex-row items-center gap-2"
                >
                  <Text className="text-white">📱</Text>
                  <Text className="text-white font-semibold">Play Store</Text>
                </Pressable>
                <Pressable
                  onPress={() => { }}
                  className="bg-black px-4 py-3 rounded-lg flex-row items-center gap-2"
                >
                  <Text className="text-white">🍎</Text>
                  <Text className="text-white font-semibold">App Store</Text>
                </Pressable>
              </VStack>
            </View>

            {/* Copyright */}
            <View className="border-t border-[#555] pt-5 mt-5">
              <Text className="text-sm text-center text-[#999]">
                © {new Date().getFullYear()} Nora Studio. All rights reserved.
              </Text>
            </View>
          </VStack>
        </View>
      </ScrollView>
    </>
  );
}
