/**
 * Photo Frame App - Editor foto dengan frame dan stiker
 * 
 * Fitur:
 * - Pilih foto dari database (Firebase Firestore)
 * - Tambahkan frame PNG transparan
 * - Tambahkan stiker yang bisa drag, scale, rotate
 * - Simpan hasil ke galeri
 */

import { PhotoTransaction } from '@/services/photoService';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// 4R paper: 102mm × 152mm (aspect ratio 2:3)
// DPI 300 untuk print quality: 102mm = 1200px, 152mm = 1800px
const EXPORT_WIDTH = 1200;  // 102mm @ 300 DPI
const EXPORT_HEIGHT = 1800; // 152mm @ 300 DPI

// Display canvas dengan 4R aspect ratio (2:3)
const CANVAS_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);
const CANVAS_HEIGHT = (CANVAS_WIDTH * EXPORT_HEIGHT) / EXPORT_WIDTH; // Maintain 2:3 ratio
const EXPORT_SCALE = 1; // Already high resolution

// Frame types - menggunakan SVG dengan bagian tengah transparan
type FrameType = {
  id: string;
  name: string;
  type: 'svg';
  component: (size: number) => React.ReactNode;
  color: string;
};

// Frame Component untuk border sederhana
const SimpleBorderFrame = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
    <Rect x="0" y="0" width={size} height={size} fill="transparent" />
    <Rect x="0" y="0" width={size} height="20" fill={color} />
    <Rect x="0" y="0" width="20" height={size} fill={color} />
    <Rect x={size - 20} y="0" width="20" height={size} fill={color} />
    <Rect x="0" y={size - 20} width={size} height="20" fill={color} />
  </Svg>
);

// Frame Component untuk border ganda
const DoubleBorderFrame = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
    <Rect x="0" y="0" width={size} height={size} fill="transparent" />
    {/* Outer border */}
    <Rect x="0" y="0" width={size} height="30" fill={color} />
    <Rect x="0" y="0" width="30" height={size} fill={color} />
    <Rect x={size - 30} y="0" width="30" height={size} fill={color} />
    <Rect x="0" y={size - 30} width={size} height="30" fill={color} />
    {/* Inner border */}
    <Rect x="15" y="15" width={size - 30} height="10" fill={color} opacity={0.7} />
    <Rect x="15" y="15" width="10" height={size - 30} fill={color} opacity={0.7} />
    <Rect x={size - 25} y="15" width="10" height={size - 30} fill={color} opacity={0.7} />
    <Rect x="15" y={size - 25} width={size - 30} height="10" fill={color} opacity={0.7} />
  </Svg>
);

// Frame Component untuk border decorative
const DecorativeFrame = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
    <Rect x="0" y="0" width={size} height={size} fill="transparent" />
    {/* Corner decorations */}
    <Path d={`M 0,0 L 0,40 L 40,0 Z`} fill={color} />
    <Path d={`M ${size},0 L ${size},40 L ${size - 40},0 Z`} fill={color} />
    <Path d={`M 0,${size} L 0,${size - 40} L 40,${size} Z`} fill={color} />
    <Path d={`M ${size},${size} L ${size},${size - 40} L ${size - 40},${size} Z`} fill={color} />
    {/* Borders */}
    <Rect x="0" y="0" width={size} height="25" fill={color} opacity={0.6} />
    <Rect x="0" y="0" width="25" height={size} fill={color} opacity={0.6} />
    <Rect x={size - 25} y="0" width="25" height={size} fill={color} opacity={0.6} />
    <Rect x="0" y={size - 25} width={size} height="25" fill={color} opacity={0.6} />
  </Svg>
);

// Frame Component untuk border rounded
const RoundedFrame = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
    <Rect x="0" y="0" width={size} height={size} fill="transparent" />
    <Rect x="0" y="0" width={size} height="20" fill={color} rx="5" />
    <Rect x="0" y="0" width="20" height={size} fill={color} rx="5" />
    <Rect x={size - 20} y="0" width="20" height={size} fill={color} rx="5" />
    <Rect x="0" y={size - 20} width={size} height="20" fill={color} rx="5" />
  </Svg>
);

// Dummy frame data - menggunakan SVG components
const FRAMES: FrameType[] = [
  {
    id: 'frame1',
    name: 'Border Sederhana',
    type: 'svg',
    color: '#F7931A',
    component: (size) => <SimpleBorderFrame size={size} color="#F7931A" />
  },
  {
    id: 'frame2',
    name: 'Border Ganda',
    type: 'svg',
    color: '#FF6B6B',
    component: (size) => <DoubleBorderFrame size={size} color="#FF6B6B" />
  },
  {
    id: 'frame3',
    name: 'Border Dekoratif',
    type: 'svg',
    color: '#4ECDC4',
    component: (size) => <DecorativeFrame size={size} color="#4ECDC4" />
  },
  {
    id: 'frame4',
    name: 'Border Rounded',
    type: 'svg',
    color: '#95E1D3',
    component: (size) => <RoundedFrame size={size} color="#95E1D3" />
  },
];

// Dummy stickers - menggunakan emoji untuk sementara
const STICKERS = [
  { id: 'sticker1', name: '❤️', uri: null, emoji: '❤️' },
  { id: 'sticker2', name: '⭐', uri: null, emoji: '⭐' },
  { id: 'sticker3', name: '🎉', uri: null, emoji: '🎉' },
  { id: 'sticker4', name: '🎈', uri: null, emoji: '🎈' },
  { id: 'sticker5', name: '✨', uri: null, emoji: '✨' },
  { id: 'sticker6', name: '😊', uri: null, emoji: '😊' },
  { id: 'sticker7', name: '🎊', uri: null, emoji: '🎊' },
  { id: 'sticker8', name: '💖', uri: null, emoji: '💖' },
];

type StickerData = {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  uri: string | null;
  emoji?: string;
};

export default function PhotoFrameApp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const canvasRef = useRef<View>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoTransaction | null>(null);
  const [photoList, setPhotoList] = useState<PhotoTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<any>(null);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [showPhotoList, setShowPhotoList] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load photos from database - menggunakan dummy data untuk sementara
  const loadPhotos = async () => {
    setLoading(true);
    try {
      // Dummy photos untuk testing - bisa diganti dengan getCustomerPhotos(phone) nanti
      const dummyPhotos: PhotoTransaction[] = [
        {
          id: '1',
          name: 'Dummy Photo 1',
          phone: '081234567890',
          package: 'Self Foto',
          link: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Dummy Photo 2',
          phone: '081234567890',
          package: 'FotoBox',
          link: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=800&fit=crop',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Dummy Photo 3',
          phone: '081234567890',
          package: 'Photobooth',
          link: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=800&fit=crop',
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Dummy Photo 4',
          phone: '081234567890',
          package: 'Self Foto',
          link: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop',
          created_at: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Dummy Photo 5',
          phone: '081234567890',
          package: 'FotoBox',
          link: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop',
          created_at: new Date().toISOString(),
        },
      ];

      setPhotoList(dummyPhotos);
      setShowPhotoList(true);

      // Uncomment untuk menggunakan database real:
      // const phone = '081234567890';
      // const photos = await getCustomerPhotos(phone);
      // setPhotoList(photos);
      // setShowPhotoList(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memuat foto dari database');
    } finally {
      setLoading(false);
    }
  };

  const selectPhoto = (photo: PhotoTransaction) => {
    setSelectedPhoto(photo);
    setShowPhotoList(false);
    setSelectedFrame(null);
    setStickers([]);
  };

  const addFrame = (frame: any) => {
    setSelectedFrame(frame);
  };

  const addSticker = (sticker: any) => {
    const newSticker: StickerData = {
      id: `sticker_${Date.now()}`,
      x: CANVAS_WIDTH / 2 - 50,
      y: CANVAS_HEIGHT / 2 - 50,
      scale: 1,
      rotation: 0,
      uri: sticker.uri || null,
      emoji: sticker.emoji,
    };
    setStickers([...stickers, newSticker]);
    setActiveStickerId(newSticker.id);
  };

  const deleteSticker = (stickerId: string) => {
    setStickers(stickers.filter(s => s.id !== stickerId));
    if (activeStickerId === stickerId) {
      setActiveStickerId(null);
    }
  };

  // Render canvas manually untuk export (memastikan frame dan stiker tersimpan)
  const renderCanvasForExport = async (): Promise<HTMLCanvasElement | null> => {
    if (!selectedPhoto || Platform.OS !== 'web') return null;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = EXPORT_WIDTH;
      canvas.height = EXPORT_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // 1. Draw background photo
      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

        // 2. Draw frame (SVG) - render as colored rectangles
        if (selectedFrame && selectedFrame.type === 'svg') {
          const frameColor = selectedFrame.color;
          const borderWidth = (EXPORT_WIDTH * 20) / CANVAS_WIDTH; // Scale border width

          // Draw frame borders
          ctx.fillStyle = frameColor;
          // Top border
          ctx.fillRect(0, 0, EXPORT_WIDTH, borderWidth);
          // Left border
          ctx.fillRect(0, 0, borderWidth, EXPORT_HEIGHT);
          // Right border
          ctx.fillRect(EXPORT_WIDTH - borderWidth, 0, borderWidth, EXPORT_HEIGHT);
          // Bottom border
          ctx.fillRect(0, EXPORT_HEIGHT - borderWidth, EXPORT_WIDTH, borderWidth);
        }

        // 3. Draw stickers
        stickers.forEach((sticker) => {
          const scale = EXPORT_WIDTH / CANVAS_WIDTH;
          const x = sticker.x * scale;
          const y = sticker.y * scale;
          const stickerWidth = 100 * scale; // Default sticker size
          const stickerHeight = 100 * scale;

          ctx.save();
          ctx.translate(x + stickerWidth / 2, y + stickerHeight / 2);
          ctx.rotate(sticker.rotation);
          ctx.scale(sticker.scale, sticker.scale);

          if (sticker.emoji) {
            ctx.font = `${stickerWidth}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sticker.emoji, 0, 0);
          }

          ctx.restore();
        });

        resolve(canvas);
      };
      img.src = selectedPhoto.link;
    });
  };

  const saveToGallery = async () => {
    if (!selectedPhoto) {
      Alert.alert('Error', 'Silakan pilih foto dulu');
      return;
    }

    setSaving(true);
    try {
      // Wait untuk memastikan semua animasi selesai dan UI sudah render
      await new Promise(resolve => setTimeout(resolve, 500));

      if (Platform.OS === 'web') {
        // Web: Render canvas manually untuk memastikan frame dan stiker tersimpan
        try {
          const exportCanvas = await renderCanvasForExport();
          if (!exportCanvas) {
            throw new Error('Gagal render canvas');
          }

          // Convert to blob and download
          exportCanvas.toBlob((blob: Blob | null) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `photo-frame-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              Alert.alert('Berhasil', 'Foto berhasil didownload!');
            } else {
              throw new Error('Gagal membuat blob dari canvas');
            }
          }, 'image/png');
        } catch (webError: any) {
          console.error('Web capture error:', webError);
          Alert.alert('Error', webError.message || 'Gagal capture gambar.');
        }
      } else {
        // Native: Save ke galeri menggunakan react-native-view-shot
        if (!canvasRef.current) {
          Alert.alert('Error', 'Canvas tidak tersedia');
          setSaving(false);
          return;
        }

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Error', 'Izin akses galeri diperlukan untuk menyimpan foto');
          setSaving(false);
          return;
        }

        const uri = await captureRef(canvasRef.current, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          snapshotContentContainer: true,
        });

        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Berhasil', 'Foto berhasil disimpan!');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message || 'Gagal menyimpan foto. Pastikan ada foto, frame, atau stiker.');
    } finally {
      setSaving(false);
    }
  };

  // Sticker Component with Gesture Handler
  const StickerItem = ({ sticker }: { sticker: StickerData }) => {
    // Initialize shared values dengan nilai awal dari sticker
    const translateX = useSharedValue(sticker.x);
    const translateY = useSharedValue(sticker.y);
    const scale = useSharedValue(sticker.scale);
    const rotation = useSharedValue(sticker.rotation);

    // Update shared values ketika sticker props berubah
    React.useEffect(() => {
      translateX.value = sticker.x;
      translateY.value = sticker.y;
      scale.value = sticker.scale;
      rotation.value = sticker.rotation;
    }, [sticker.id]); // Hanya update ketika ID berubah (stiker baru)

    const isActive = activeStickerId === sticker.id;



    // Pan gesture dengan minDistance untuk membedakan tap vs drag
    const panGestureWithTap = Gesture.Pan()
      .minDistance(5) // Minimal 5px movement untuk dianggap pan
      .onStart(() => {
        // Set base position saat mulai drag
        translateX.value = sticker.x;
        translateY.value = sticker.y;
        // Juga set active saat mulai touch
        setActiveStickerId(sticker.id);
      })
      .onUpdate((e) => {
        translateX.value = sticker.x + e.translationX;
        translateY.value = sticker.y + e.translationY;
      })
      .onEnd((e) => {
        // Update position setelah drag selesai
        const newX = sticker.x + e.translationX;
        const newY = sticker.y + e.translationY;

        // Sync animated values ke React state menggunakan runOnJS
        runOnJS(setStickers)(prev => prev.map(s =>
          s.id === sticker.id
            ? { ...s, x: newX, y: newY }
            : s
        ));

        sticker.x = newX;
        sticker.y = newY;
      });

    // Tap gesture untuk activate sticker (untuk tap tanpa movement)
    const tapGesture = Gesture.Tap()
      .numberOfTaps(1)
      .maxDuration(250) // Max 250ms untuk dianggap tap
      .onEnd(() => {
        // Set active sticker ketika di-tap
        setActiveStickerId(sticker.id);
      });

    // Tap untuk pinch/rotate juga set active
    const pinchWithActivate = Gesture.Pinch()
      .onStart(() => {
        scale.value = sticker.scale;
        setActiveStickerId(sticker.id);
      })
      .onUpdate((e) => {
        scale.value = sticker.scale * e.scale;
      })
      .onEnd((e) => {
        const newScale = sticker.scale * e.scale;
        runOnJS(setStickers)(prev => prev.map(s =>
          s.id === sticker.id
            ? { ...s, scale: newScale }
            : s
        ));
        sticker.scale = newScale;
      });

    const rotateWithActivate = Gesture.Rotation()
      .onStart(() => {
        rotation.value = sticker.rotation;
        setActiveStickerId(sticker.id);
      })
      .onUpdate((e) => {
        rotation.value = sticker.rotation + e.rotation;
      })
      .onEnd((e) => {
        const newRotation = sticker.rotation + e.rotation;
        runOnJS(setStickers)(prev => prev.map(s =>
          s.id === sticker.id
            ? { ...s, rotation: newRotation }
            : s
        ));
        sticker.rotation = newRotation;
      });

    // Combine gestures - tap dan pan bisa berjalan simultan, tapi tap akan trigger jika tidak ada movement
    const composedGesture = Gesture.Race(
      tapGesture,
      Gesture.Simultaneous(
        panGestureWithTap,
        Gesture.Simultaneous(pinchWithActivate, rotateWithActivate)
      )
    );

    const animatedStyle = useAnimatedStyle(() => {
      return {
        left: translateX.value,
        top: translateY.value,
        transform: [
          { scale: scale.value },
          { rotate: `${rotation.value}rad` },
        ],
      };
    });

    return (
      <Animated.View
        style={[
          styles.stickerWrapper,
          animatedStyle,
        ]}
      >
        <GestureDetector gesture={composedGesture}>
          <Pressable
            onPress={() => {
              // Set active sticker ketika di-press (tap tanpa drag)
              setActiveStickerId(sticker.id);
            }}
            style={styles.stickerPressable}
          >
            <Animated.View
              style={[
                styles.stickerContainer,
                isActive && styles.activeSticker,
              ]}
            >
              {sticker.emoji ? (
                <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
              ) : sticker.uri ? (
                <Image source={{ uri: sticker.uri }} style={styles.stickerImage} resizeMode="contain" />
              ) : (
                <Text style={styles.stickerEmoji}>🎨</Text>
              )}
            </Animated.View>
          </Pressable>
        </GestureDetector>
        {isActive && (
          <>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteSticker(sticker.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Main Content - 3 Column Layout */}
      <View style={styles.mainContent}>
        {/* Left Column - Photo Selector */}
        <View style={styles.photoColumn}>
          <Text style={styles.photoColumnTitle}>Pilih Foto</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.photoColumnScroll}>
            {loading ? (
              <View style={styles.photoListLoading}>
                <ActivityIndicator size="large" color="#F7931A" />
              </View>
            ) : photoList.length === 0 ? (
              <View style={styles.emptyPhotoList}>
                <Text style={styles.emptyPhotoListText}>Tidak ada foto</Text>
                <TouchableOpacity onPress={loadPhotos} style={styles.loadPhotoButton}>
                  <Text style={styles.loadPhotoButtonText}>Muat Foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoGridContainer}>
                {photoList.map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    onPress={() => selectPhoto(photo)}
                    style={[
                      styles.photoGridItem,
                      selectedPhoto?.id === photo.id && styles.photoGridItemActive,
                    ]}
                  >
                    <Image
                      source={{ uri: photo.link }}
                      style={styles.photoGridItemImage}
                    />
                    <View style={styles.photoGridItemOverlay}>
                      <Text style={styles.photoGridItemName} numberOfLines={1}>
                        {photo.name}
                      </Text>
                      <Text style={styles.photoGridItemPackage} numberOfLines={1}>
                        {photo.package}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          {photoList.length > 0 && (
            <TouchableOpacity onPress={loadPhotos} style={styles.refreshPhotoListButton}>
              <Text style={styles.refreshPhotoListButtonText}>🔄 Muat Ulang</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Column - Canvas/Preview */}
        {selectedPhoto && (
          <View style={styles.centerColumn}>
            <View
              ref={canvasRef}
              collapsable={false}
              style={[styles.canvas, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}
            >
              {/* Background Photo */}
              <Image
                source={{ uri: selectedPhoto.link }}
                style={styles.backgroundPhoto}
                resizeMode="cover"
              />

              {/* Selected Frame */}
              {selectedFrame && selectedFrame.type === 'svg' && (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  {selectedFrame.component(CANVAS_WIDTH)}
                </View>
              )}

              {/* Stickers */}
              {stickers.map((sticker) => (
                <StickerItem key={sticker.id} sticker={sticker} />
              ))}
            </View>
          </View>
        )}

        {/* Right Column - Controls */}
        {selectedPhoto && (
          <View style={styles.rightColumn}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.controlsScroll}>
              {/* Frame Selector */}
              <View style={styles.controlSection}>
                <Text style={styles.controlTitle}>Frame</Text>
                <View style={styles.frameGrid}>
                  {FRAMES.map((frame) => (
                    <TouchableOpacity
                      key={frame.id}
                      onPress={() => addFrame(frame)}
                      style={[
                        styles.frameItem,
                        selectedFrame?.id === frame.id && styles.frameItemActive,
                      ]}
                    >
                      <View style={[styles.framePreview, { backgroundColor: frame.color }]}>
                        <View style={styles.framePreviewInner} />
                      </View>
                      <Text style={styles.frameItemText}>{frame.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sticker Selector */}
              <View style={styles.controlSection}>
                <Text style={styles.controlTitle}>Stiker</Text>
                <View style={styles.stickerGrid}>
                  {STICKERS.map((sticker) => (
                    <TouchableOpacity
                      key={sticker.id}
                      onPress={() => addSticker(sticker)}
                      style={styles.stickerItem}
                    >
                      <Text style={styles.stickerItemEmoji}>{sticker.emoji}</Text>
                      <Text style={styles.stickerItemText}>{sticker.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Clear Buttons */}
              <View style={styles.controlSection}>
                {selectedFrame && (
                  <TouchableOpacity
                    onPress={() => setSelectedFrame(null)}
                    style={styles.clearButtonSmall}
                  >
                    <Text style={styles.clearButtonText}>🗑️ Hapus Frame</Text>
                  </TouchableOpacity>
                )}

                {stickers.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setStickers([]);
                      setActiveStickerId(null);
                    }}
                    style={styles.clearButtonSmall}
                  >
                    <Text style={styles.clearButtonText}>🗑️ Hapus Semua Stiker</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
            
            {/* Floating Save Button */}
            <TouchableOpacity
              onPress={saveToGallery}
              style={[styles.floatingSaveButton, saving && styles.floatingSaveButtonDisabled]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.floatingSaveButtonText}>💾 Simpan Hasil</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4E6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  photoListModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  photoListContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: SCREEN_WIDTH - 32,
    maxHeight: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
  },
  photoListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  photoListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  photoListScroll: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  photoListItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  photoListItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoListThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  photoListItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  photoListItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  photoListItemPackage: {
    fontSize: 14,
    color: '#666',
  },
  loadButton: {
    backgroundColor: '#F7931A',
    padding: 16,
    alignItems: 'center',
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loader: {
    padding: 40,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#F7931A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  canvasContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  canvas: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backgroundPhoto: {
    width: '100%',
    height: '100%',
  },
  emptyCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCanvasText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectPhotoButton: {
    backgroundColor: '#F7931A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectPhotoButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  stickerWrapper: {
    position: 'absolute',
    zIndex: 10,
  },
  stickerPressable: {
    width: 100,
    height: 100,
  },
  stickerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSticker: {
    borderWidth: 2,
    borderColor: '#F7931A',
    borderRadius: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  deleteHint: {
    position: 'absolute',
    bottom: -25,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1001,
  },
  deleteHintText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  stickerEmoji: {
    fontSize: 60,
  },
  toolbar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toolbarSection: {
    marginBottom: 12,
  },
  toolbarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  toolbarItem: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    minWidth: 70,
  },
  toolbarItemActive: {
    backgroundColor: '#FFE5CC',
    borderWidth: 2,
    borderColor: '#F7931A',
  },
  toolbarItemImage: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  toolbarItemFramePreview: {
    width: 50,
    height: 50,
    marginBottom: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  toolbarItemFrameInner: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  toolbarStickerEmoji: {
    fontSize: 30,
    marginBottom: 4,
  },
  toolbarItemText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#F7931A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  floatingSaveButton: {
    backgroundColor: '#F7931A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 8,
  },
  floatingSaveButtonDisabled: {
    opacity: 0.6,
  },
  floatingSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // 2-Column Layout Styles
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  rightColumn: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlsScroll: {
    flex: 1,
  },
  controlSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  frameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frameItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  frameItemActive: {
    backgroundColor: '#FFE5CC',
    borderWidth: 2,
    borderColor: '#F7931A',
  },
  framePreview: {
    width: 60,
    height: 60,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 4,
  },
  framePreviewInner: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  frameItemText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stickerItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  stickerItemEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  stickerItemText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  clearButtonSmall: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  // 3-Column Layout Styles
  photoColumn: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'column',
  },
  photoColumnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  photoColumnScroll: {
    flex: 1,
  },
  photoListLoading: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPhotoList: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyPhotoListText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadPhotoButton: {
    backgroundColor: '#F7931A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadPhotoButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  photoGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  photoGridItem: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoGridItemActive: {
    borderColor: '#F7931A',
    borderWidth: 3,
  },
  photoGridItemImage: {
    width: '100%',
    height: '100%',
  },
  photoGridItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  photoGridItemName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  photoGridItemPackage: {
    fontSize: 9,
    color: '#ddd',
  },
  refreshPhotoListButton: {
    backgroundColor: '#F7931A',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    margin: 8,
  },
  refreshPhotoListButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  centerColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});
