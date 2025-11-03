/**
 * Photo Editor Canvas - Editor foto berbasis Canvas API
 * Support: iOS, Android, Web
 * 
 * Fitur:
 * - Render foto dengan Canvas
 * - Drag, scale, rotate stiker
 * - Export ke image berkualitas tinggi
 * - Smooth animations
 */

import { PhotoTransaction } from '@/services/photoService';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 32, 600);
const EXPORT_SIZE = 1200; // High quality export

// Sticker data type
type StickerData = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  emoji?: string;
  uri?: string;
};

// Gesture state
type GestureState = {
  stickerId: string | null;
  startX: number;
  startY: number;
  startScale: number;
  startRotation: number;
  mode: 'drag' | 'scale' | 'rotate' | null;
};

const STICKERS = [
  { id: 'sticker1', name: '❤️', emoji: '❤️' },
  { id: 'sticker2', name: '⭐', emoji: '⭐' },
  { id: 'sticker3', name: '🎉', emoji: '🎉' },
  { id: 'sticker4', name: '🎈', emoji: '🎈' },
  { id: 'sticker5', name: '✨', emoji: '✨' },
  { id: 'sticker6', name: '😊', emoji: '😊' },
  { id: 'sticker7', name: '🎊', emoji: '🎊' },
  { id: 'sticker8', name: '💖', emoji: '💖' },
];

export default function PhotoEditorCanvas() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const canvasRef = useRef<any>(null);
  const containerRef = useRef<View>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoTransaction | null>(null);
  const [photoList, setPhotoList] = useState<PhotoTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [showPhotoList, setShowPhotoList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>({
    stickerId: null,
    startX: 0,
    startY: 0,
    startScale: 1,
    startRotation: 0,
    mode: null,
  });

  // Load dummy photos
  const loadPhotos = async () => {
    setLoading(true);
    try {
      const dummyPhotos: PhotoTransaction[] = [
        {
          id: '1',
          name: 'Dummy Photo 1',
          phone: '081234567890',
          package: 'Self Foto',
          link: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=1000&fit=crop',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Dummy Photo 2',
          phone: '081234567890',
          package: 'FotoBox',
          link: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=1000&fit=crop',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Dummy Photo 3',
          phone: '081234567890',
          package: 'Photobooth',
          link: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1000&fit=crop',
          created_at: new Date().toISOString(),
        },
      ];
      setPhotoList(dummyPhotos);
      setShowPhotoList(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memuat foto');
    } finally {
      setLoading(false);
    }
  };

  const selectPhoto = (photo: PhotoTransaction) => {
    setSelectedPhoto(photo);
    setShowPhotoList(false);
    setStickers([]);
  };

  const addSticker = (sticker: any) => {
    const newSticker: StickerData = {
      id: `sticker_${Date.now()}`,
      x: CANVAS_SIZE / 2 - 40,
      y: CANVAS_SIZE / 2 - 40,
      width: 80,
      height: 80,
      scale: 1,
      rotation: 0,
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

  // Canvas rendering (Web only)
  const renderCanvas = () => {
    if (Platform.OS !== 'web' || !canvasRef.current || !selectedPhoto) return;

    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Draw background photo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw stickers
      stickers.forEach((sticker) => {
        ctx.save();
        ctx.translate(sticker.x + sticker.width / 2, sticker.y + sticker.height / 2);
        ctx.rotate(sticker.rotation);
        ctx.scale(sticker.scale, sticker.scale);

        if (sticker.emoji) {
          ctx.font = `${sticker.width}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sticker.emoji, 0, 0);
        }

        ctx.restore();

        // Draw selection border
        if (activeStickerId === sticker.id) {
          ctx.strokeStyle = '#F7931A';
          ctx.lineWidth = 2;
          ctx.strokeRect(sticker.x, sticker.y, sticker.width, sticker.height);
        }
      });
    };
    img.src = selectedPhoto.link;
  };

  // Handle canvas touch/mouse events
  const handleCanvasPress = (e: any) => {
    const rect = canvasRef.current?.getBoundingClientRect?.();
    if (!rect) return;

    const x = e.nativeEvent.pageX - rect.left;
    const y = e.nativeEvent.pageY - rect.top;

    // Check if clicked on sticker
    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i];
      if (
        x >= sticker.x &&
        x <= sticker.x + sticker.width &&
        y >= sticker.y &&
        y <= sticker.y + sticker.height
      ) {
        setActiveStickerId(sticker.id);
        setGestureState({
          stickerId: sticker.id,
          startX: x,
          startY: y,
          startScale: sticker.scale,
          startRotation: sticker.rotation,
          mode: 'drag',
        });
        return;
      }
    }

    setActiveStickerId(null);
  };

  const handleCanvasMove = (e: any) => {
    if (gestureState.mode !== 'drag' || !gestureState.stickerId) return;

    const rect = canvasRef.current?.getBoundingClientRect?.();
    if (!rect) return;

    const x = e.nativeEvent.pageX - rect.left;
    const y = e.nativeEvent.pageY - rect.top;

    const deltaX = x - gestureState.startX;
    const deltaY = y - gestureState.startY;

    setStickers((prev) =>
      prev.map((s) =>
        s.id === gestureState.stickerId
          ? {
            ...s,
            x: Math.max(0, Math.min(s.x + deltaX, CANVAS_SIZE - s.width)),
            y: Math.max(0, Math.min(s.y + deltaY, CANVAS_SIZE - s.height)),
          }
          : s
      )
    );

    setGestureState((prev) => ({
      ...prev,
      startX: x,
      startY: y,
    }));
  };

  const handleCanvasEnd = () => {
    setGestureState({
      stickerId: null,
      startX: 0,
      startY: 0,
      startScale: 1,
      startRotation: 0,
      mode: null,
    });
  };

  // Export canvas to image
  const exportCanvas = async () => {
    if (!canvasRef.current || !selectedPhoto) {
      Alert.alert('Error', 'Canvas tidak tersedia');
      return;
    }

    try {
      setSaving(true);

      if (Platform.OS === 'web') {
        // Web: Download as PNG
        const canvas = canvasRef.current as HTMLCanvasElement;
        canvas.toBlob((blob: Blob | null) => {
          if (!blob) {
            Alert.alert('Error', 'Gagal membuat image');
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `photo-frame-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          Alert.alert('Berhasil', 'Foto berhasil didownload!');
          setSaving(false);
        }, 'image/png');
      } else {
        // Native: Show info message
        Alert.alert('Info', 'Untuk native, gunakan photo-frame-app untuk hasil terbaik');
        setSaving(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal export gambar');
      setSaving(false);
    }
  };

  // Redraw canvas when stickers change
  useEffect(() => {
    renderCanvas();
  }, [stickers, activeStickerId, selectedPhoto]);

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
              <Text style={styles.photoListTitle}>Pilih Foto</Text>
              <TouchableOpacity onPress={() => setShowPhotoList(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.photoListScroll}>
              {loading ? (
                <ActivityIndicator size="large" color="#F7931A" style={styles.loader} />
              ) : photoList.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Tidak ada foto</Text>
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
                    <RNImage
                      source={{ uri: photo.link }}
                      style={styles.photoListThumbnail}
                    />
                    <View style={styles.photoListItemInfo}>
                      <Text style={styles.photoListItemName}>{photo.name}</Text>
                      <Text style={styles.photoListItemPackage}>{photo.package}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity onPress={loadPhotos} style={styles.loadButton}>
              <Text style={styles.loadButtonText}>
                {loading ? 'Memuat...' : 'Muat Foto'}
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
            <TouchableOpacity
              onPress={() => setShowPhotoList(true)}
              style={styles.selectPhotoButton}
            >
              <Text style={styles.selectPhotoButtonText}>📸 Pilih Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            ref={containerRef}
            style={[styles.canvasWrapper, { width: CANVAS_SIZE, height: CANVAS_SIZE }]}
            onStartShouldSetResponder={() => true}
            onResponderMove={handleCanvasMove}
            onResponderRelease={handleCanvasEnd}
          >
            {Platform.OS === 'web' ? (
              <canvas
                ref={canvasRef}
                style={{
                  width: CANVAS_SIZE,
                  height: CANVAS_SIZE,
                  border: '1px solid #ddd',
                  cursor: 'pointer',
                }}
                onMouseDown={handleCanvasPress}
                onMouseMove={handleCanvasMove}
                onMouseUp={handleCanvasEnd}
              />
            ) : (
              <RNImage
                source={{ uri: selectedPhoto.link }}
                style={styles.backgroundPhoto}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Toolbar */}
      {selectedPhoto && (
        <View style={styles.toolbar}>
          {/* Sticker Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.toolbarSection}
          >
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
            {stickers.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setStickers([]);
                  setActiveStickerId(null);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>🗑️ Hapus Semua</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={exportCanvas}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Simpan</Text>
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
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  canvasWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
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
