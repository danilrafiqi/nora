/**
 * Photo Frame App - Editor foto dengan frame dan stiker
 * 
 * Fitur:
 * - Pilih foto dari database (Firebase Firestore)
 * - Tambahkan frame PNG transparan
 * - Tambahkan stiker yang bisa drag, scale, rotate
 * - Simpan hasil ke galeri
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { getCustomerPhotos, PhotoTransaction } from '@/services/photoService';
import { useRouter } from 'expo-router';
import Svg, { Rect, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 32, 400);

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
      x: CANVAS_SIZE / 2 - 50,
      y: CANVAS_SIZE / 2 - 50,
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

  const saveToGallery = async () => {
    if (!selectedPhoto) {
      Alert.alert('Error', 'Silakan pilih foto dulu');
      return;
    }

    setSaving(true);
    try {
      // Wait sedikit untuk memastikan UI sudah render
      await new Promise(resolve => setTimeout(resolve, 200));

      if (Platform.OS === 'web') {
        // Web: Pakai html2canvas untuk capture
        try {
          if (typeof document === 'undefined' || !canvasRef.current) {
            throw new Error('Canvas tidak tersedia');
          }

          // Import html2canvas dynamically (sudah termasuk di react-native-view-shot)
          const html2canvas = (await import('html2canvas')).default;
          const canvasElement = canvasRef.current as any;
          
          // Get the DOM node - React Native Web menggunakan _nativeNode
          let element: HTMLElement | null = null;
          
          // Try multiple ways to get the DOM element
          if (canvasElement?._nativeNode) {
            element = canvasElement._nativeNode;
          } else if (canvasElement?.current?._nativeNode) {
            element = canvasElement.current._nativeNode;
          } else if (canvasElement?.firstChild) {
            element = canvasElement.firstChild as HTMLElement;
          }

          if (!element) {
            // Fallback: try to get by querying
            const canvasId = `canvas-${Date.now()}`;
            if (canvasRef.current) {
              (canvasRef.current as any).setNativeProps?.({ testID: canvasId });
              element = document.querySelector(`[data-testid="${canvasId}"]`) as HTMLElement;
            }
          }

          if (!element) {
            throw new Error('Tidak dapat menemukan elemen canvas. Coba refresh halaman.');
          }

          const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            allowTaint: true,
          });

          // Convert to blob and download
          canvas.toBlob((blob: Blob | null) => {
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
          Alert.alert('Error', webError.message || 'Gagal capture gambar. Pastikan browser mendukung HTML5 Canvas.');
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
        
        // Update sticker data di array
        setStickers(prev => prev.map(s => 
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
        setStickers(prev => prev.map(s => 
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
        setStickers(prev => prev.map(s => 
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
        position: 'absolute',
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
          {
            left: 0,
            top: 0,
          },
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
            {/* Info label untuk menunjukkan stiker bisa dihapus */}
            <View style={styles.deleteHint}>
              <Text style={styles.deleteHintText}>Tap ✕ untuk hapus</Text>
            </View>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowPhotoList(true)}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>📸 Pilih Foto</Text>
        </TouchableOpacity>
        {selectedPhoto && (
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photo List Modal */}
      {showPhotoList && (
        <View style={styles.photoListModal}>
          <View style={styles.photoListContent}>
            <View style={styles.photoListHeader}>
              <Text style={styles.photoListTitle}>Pilih Foto dari Database</Text>
              <TouchableOpacity onPress={() => setShowPhotoList(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.photoListScroll}>
              {loading ? (
                <ActivityIndicator size="large" color="#F7931A" style={styles.loader} />
              ) : photoList.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Tidak ada foto ditemukan</Text>
                  <TouchableOpacity onPress={loadPhotos} style={styles.refreshButton}>
                    <Text style={styles.refreshButtonText}>Muat Ulang</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                photoList.map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    onPress={() => selectPhoto(photo)}
                    style={styles.photoListItem}
                  >
                    <View style={styles.photoListItemContent}>
                      <Image
                        source={{ uri: photo.link }}
                        style={styles.photoListThumbnail}
                      />
                      <View style={styles.photoListItemInfo}>
                        <Text style={styles.photoListItemName} numberOfLines={1}>
                          {photo.name}
                        </Text>
                        <Text style={styles.photoListItemPackage} numberOfLines={1}>
                          {photo.package}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity onPress={loadPhotos} style={styles.loadButton}>
              <Text style={styles.loadButtonText}>
                {loading ? 'Memuat...' : 'Muat Foto dari Database'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Canvas Area */}
      <ScrollView
        contentContainerStyle={styles.canvasContainer}
        showsVerticalScrollIndicator={false}
      >
        {!selectedPhoto ? (
          <View style={styles.emptyCanvas}>
            <Text style={styles.emptyCanvasText}>Silakan pilih foto dulu</Text>
            <TouchableOpacity onPress={() => setShowPhotoList(true)} style={styles.selectPhotoButton}>
              <Text style={styles.selectPhotoButtonText}>📸 Pilih Foto dari Database</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            ref={canvasRef}
            collapsable={false}
            style={[styles.canvas, { width: CANVAS_SIZE, height: CANVAS_SIZE }]}
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
                {selectedFrame.component(CANVAS_SIZE)}
              </View>
            )}

            {/* Stickers */}
            {stickers.map((sticker) => (
              <StickerItem key={sticker.id} sticker={sticker} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Toolbar */}
      {selectedPhoto && (
        <View style={styles.toolbar}>
          {/* Frame Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbarSection}>
            <Text style={styles.toolbarLabel}>Frame:</Text>
            {FRAMES.map((frame) => (
              <TouchableOpacity
                key={frame.id}
                onPress={() => addFrame(frame)}
                style={[
                  styles.toolbarItem,
                  selectedFrame?.id === frame.id && styles.toolbarItemActive,
                ]}
              >
                <View style={[styles.toolbarItemFramePreview, { backgroundColor: frame.color }]}>
                  <View style={styles.toolbarItemFrameInner} />
                </View>
                <Text style={styles.toolbarItemText}>{frame.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sticker Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbarSection}>
            <Text style={styles.toolbarLabel}>Stiker:</Text>
            {STICKERS.map((sticker) => (
              <TouchableOpacity
                key={sticker.id}
                onPress={() => addSticker(sticker)}
                style={styles.toolbarItem}
              >
                <Text style={styles.toolbarStickerEmoji}>{sticker.emoji}</Text>
                <Text style={styles.toolbarItemText}>{sticker.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Clear Frame Button */}
            {selectedFrame && (
              <TouchableOpacity
                onPress={() => setSelectedFrame(null)}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>🗑️ Hapus Frame</Text>
              </TouchableOpacity>
            )}
            
            {/* Clear Stickers Button */}
            {stickers.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setStickers([]);
                  setActiveStickerId(null);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>🗑️ Hapus Semua Stiker</Text>
              </TouchableOpacity>
            )}

            {/* Save Button */}
            <TouchableOpacity
              onPress={saveToGallery}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Simpan Hasil</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  headerButton: {
    backgroundColor: '#F7931A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    minWidth: 150,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
