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
import { captureRef } from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import {
  DecorativeFrame,
  DoubleBorderFrame,
  DraggablePhotoListItem,
  RoundedFrame,
  SimpleBorderFrame
} from './components';
import { FrameType, GridCell, LayoutTemplate, PhotoTransform, StickerData } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// 4R paper: 102mm × 152mm (aspect ratio 2:3)
// DPI 300 untuk print quality: 102mm = 1200px, 152mm = 1800px
const EXPORT_WIDTH = 1200;  // 102mm @ 300 DPI
const EXPORT_HEIGHT = 1800; // 152mm @ 300 DPI

// Base canvas size untuk single photo (1x1 layout)
const BASE_CANVAS_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);
const BASE_CANVAS_HEIGHT = (BASE_CANVAS_WIDTH * EXPORT_HEIGHT) / EXPORT_WIDTH; // Maintain 2:3 ratio

// Helper function untuk calculate canvas size - TETAP 4R RATIO
const calculateCanvasSize = (layout: LayoutTemplate | null) => {
  // Canvas tetap 4R ratio (2:3), tidak berubah sesuai layout
  // Grid cells yang berubah ukurannya
  if (!layout) {
    return { width: 0, height: 0 }; // No layout selected
  }
  return {
    width: BASE_CANVAS_WIDTH,
    height: BASE_CANVAS_HEIGHT, // Tetap 4R ratio
  };
};

// Frame components sudah di-import dari components.tsx

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

// Layout templates untuk grid-based editor
const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  { id: '1x1', name: '1 Foto', cols: 1, rows: 1, cellAspectRatio: 2 / 3 },
  { id: '2x2', name: '2×2 Grid', cols: 2, rows: 2, cellAspectRatio: 1 / 1 },
  { id: '3x3', name: '3×3 Grid', cols: 3, rows: 3, cellAspectRatio: 1 / 1 },
  { id: '2x3', name: '2×3 Grid', cols: 2, rows: 3, cellAspectRatio: 2 / 3 },
  { id: '4x6', name: '4×6 Grid', cols: 4, rows: 6, cellAspectRatio: 2 / 3 },
];

// Types sudah di-import dari types.ts

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
  const [selectedLayout, setSelectedLayout] = useState<LayoutTemplate | null>(null); // No default
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);
  const [draggedOverCellId, setDraggedOverCellId] = useState<string | null>(null);
  const [photoTransforms, setPhotoTransforms] = useState<PhotoTransform[]>([]); // Track photo transforms
  const [draggingFromGrid, setDraggingFromGrid] = useState<string | null>(null); // Track photo being dragged from grid

  // Remove pagination state - show all photos like Canva

  // Calculate canvas size based on selected layout
  const canvasSize = calculateCanvasSize(selectedLayout);
  const CANVAS_WIDTH = canvasSize.width;
  const CANVAS_HEIGHT = canvasSize.height;

  // Initialize grid cells ketika layout berubah
  const initializeGridCells = (layout: LayoutTemplate | null) => {
    if (!layout) {
      setGridCells([]);
      return;
    }
    const totalCells = layout.cols * layout.rows;
    const newCells: GridCell[] = Array.from({ length: totalCells }).map((_, idx) => ({
      id: `cell-${idx}`,
      photoId: null,
    }));
    setGridCells(newCells);
  };

  // Update grid cells ketika layout berubah
  React.useEffect(() => {
    initializeGridCells(selectedLayout);
  }, [selectedLayout]);

  // Load photos saat component mount - DISABLED: Users should start with empty list

  // Debug: log photoList changes
  React.useEffect(() => {
    console.log('photoList updated:', photoList.length, 'photos, loading:', loading);
  }, [photoList, loading]);

  // Function untuk assign foto ke grid cell
  const assignPhotoToCell = (cellId: string, photoId: string) => {
    setGridCells(prev => prev.map(cell =>
      cell.id === cellId ? { ...cell, photoId } : cell
    ));
  };

  // Function untuk clear foto dari grid cell
  const clearPhotoFromCell = (cellId: string) => {
    setGridCells(prev => prev.map(cell =>
      cell.id === cellId ? { ...cell, photoId: null } : cell
    ));
  };

  // Function untuk handle drop foto ke cell
  const handleDropPhotoToCell = (cellId: string, photoId: string) => {
    console.log('Drop photo', photoId, 'to cell', cellId);

    // If dragging from grid, clear the source cell
    if (draggingFromGrid) {
      const sourceCell = gridCells.find(cell => cell.photoId === photoId);
      if (sourceCell) {
        console.log('Clearing source cell', sourceCell.id);
        setGridCells(prev => prev.map(cell =>
          cell.id === sourceCell.id ? { ...cell, photoId: null } : cell
        ));
      }
    }

    // Assign photo to target cell (this will replace any existing photo)
    setGridCells(prev => prev.map(cell =>
      cell.id === cellId ? { ...cell, photoId } : cell
    ));

    setDraggingPhotoId(null);
    setDraggedOverCellId(null);
    setDraggingFromGrid(null);
  };

  // Function untuk handle drop dengan position detection
  const handleDropWithPosition = React.useCallback((photoId: string, x: number, y: number) => {
    console.log('Drop photo', photoId, 'at position', x, y);

    // Get canvas bounds to convert absolute position to relative
    const canvasElement = canvasRef.current as any;
    if (!canvasElement || !selectedLayout) {
      // Fallback: assign to first empty cell
      const emptyCell = gridCells.find(cell => !cell.photoId);
      if (emptyCell) {
        handleDropPhotoToCell(emptyCell.id, photoId);
      }
      return;
    }

    // Get canvas position on screen
    canvasElement.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
      // Convert drop position to relative position within canvas
      const relativeX = x - px;
      const relativeY = y - py;

      console.log('Canvas bounds:', { px, py, width, height });
      console.log('Relative position:', { relativeX, relativeY });

      // Check if drop is within canvas bounds
      if (relativeX >= 0 && relativeX <= width && relativeY >= 0 && relativeY <= height) {
        // Calculate which cell was dropped on
        const cellWidth = width / selectedLayout.cols;
        const cellHeight = height / selectedLayout.rows;

        const col = Math.floor(relativeX / cellWidth);
        const row = Math.floor(relativeY / cellHeight);
        const cellIndex = row * selectedLayout.cols + col;

        console.log('Drop on cell:', { col, row, cellIndex });

        // Check if cell index is valid
        if (cellIndex >= 0 && cellIndex < gridCells.length) {
          const targetCell = gridCells[cellIndex];
          // Allow drop on both empty and occupied cells (replace existing photo)
          handleDropPhotoToCell(targetCell.id, photoId);
          return;
        }
      }

      // Fallback: assign to first empty cell
      const emptyCell = gridCells.find(cell => !cell.photoId);
      if (emptyCell) {
        handleDropPhotoToCell(emptyCell.id, photoId);
      }
    });
  }, [selectedLayout, gridCells]);

  // Callback functions untuk drag handlers - memoized to prevent re-renders
  const handleDragStart = React.useCallback((photoId: string) => {
    setDraggingPhotoId(photoId);
  }, []);

  const handleDragEnd = React.useCallback(() => {
    setDraggingPhotoId(null);
  }, []);

  // Helper functions untuk photo transform
  const getPhotoTransform = React.useCallback((photoId: string): PhotoTransform | undefined => {
    return photoTransforms.find(t => t.photoId === photoId);
  }, [photoTransforms]);

  const updatePhotoTransform = React.useCallback((photoId: string, updates: Partial<PhotoTransform>) => {
    setPhotoTransforms(prev => {
      const existing = prev.find(t => t.photoId === photoId);
      if (existing) {
        return prev.map(t => t.photoId === photoId ? { ...t, ...updates } : t);
      } else {
        return [...prev, { photoId, x: 0, y: 0, scale: 1, rotation: 0, ...updates }];
      }
    });
  }, []);

  // Load photos from database - menggunakan dummy data untuk sementara
  const loadPhotos = React.useCallback(async () => {
    console.log('loadPhotos called');
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

      console.log('Setting photoList with', dummyPhotos.length, 'photos');
      setPhotoList(dummyPhotos);
      console.log('photoList state updated');
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
  }, []);

  const compressImage = (imageUri: string, maxSizeKB: number = 50): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS !== 'web') {
        resolve(imageUri); // Skip compression on native platforms
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions (max 1200px on longest side)
        const maxDimension = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob && blob.size <= maxSizeKB * 1024) {
            // Already under target size
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          } else {
            // Try with lower quality
            canvas.toBlob((compressedBlob) => {
              if (compressedBlob) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(compressedBlob);
              } else {
                resolve(imageUri); // Fallback to original
              }
            }, 'image/jpeg', 0.7);
          }
        }, 'image/jpeg', 0.9);
      };

      img.onerror = () => resolve(imageUri); // Fallback to original
      img.src = imageUri;
    });
  };

  // Function to pick images from device gallery
  const pickImagesFromGallery = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Izin akses galeri diperlukan untuk memilih foto');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: undefined,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        setLoading(true);
        try {
          // Compress images to under 50KB for better performance
          const processedPhotos: PhotoTransaction[] = [];

          for (const asset of result.assets) {
            try {
              const compressedUri = await compressImage(asset.uri, 50);
              processedPhotos.push({
                id: `local_${Date.now()}_${processedPhotos.length}`,
                name: asset.fileName || `Local Photo ${processedPhotos.length + 1}`,
                phone: 'local',
                package: 'Local File',
                link: compressedUri,
                created_at: new Date().toISOString(),
              });
            } catch (error) {
              // Fallback to original if compression fails
              processedPhotos.push({
                id: `local_${Date.now()}_${processedPhotos.length}`,
                name: asset.fileName || `Local Photo ${processedPhotos.length + 1}`,
                phone: 'local',
                package: 'Local File',
                link: asset.uri,
                created_at: new Date().toISOString(),
              });
            }
          }

          setPhotoList(prev => [...prev, ...processedPhotos]);
          setShowPhotoList(true);

          Alert.alert('Berhasil', `${processedPhotos.length} foto berhasil diproses`);
        } catch (error) {
          console.error('Processing error:', error);
          Alert.alert('Error', 'Gagal memproses foto');
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error picking images:', error);
      Alert.alert('Error', error.message || 'Gagal memilih foto dari galeri');
    }
  };

  // Function to pick single image from file system (for web/mobile file picker)
  const pickImageFromFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        aspect: undefined,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        setLoading(true);
        try {
          const asset = result.assets[0];
          const compressedUri = await compressImage(asset.uri, 50);

          const selectedPhoto: PhotoTransaction = {
            id: `local_file_${Date.now()}`,
            name: asset.fileName || 'Local File Photo',
            phone: 'local_file',
            package: 'File Picker',
            link: compressedUri,
            created_at: new Date().toISOString(),
          };

          setPhotoList(prev => [...prev, selectedPhoto]);
          setShowPhotoList(true);

          Alert.alert('Berhasil', 'Foto berhasil diproses');
        } catch (error) {
          // Fallback to original if compression fails
          const asset = result.assets[0];
          const selectedPhoto: PhotoTransaction = {
            id: `local_file_${Date.now()}`,
            name: asset.fileName || 'Local File Photo',
            phone: 'local_file',
            package: 'File Picker',
            link: asset.uri,
            created_at: new Date().toISOString(),
          };

          setPhotoList(prev => [...prev, selectedPhoto]);
          setShowPhotoList(true);

          Alert.alert('Berhasil', 'Foto berhasil ditambahkan (menggunakan ukuran asli)');
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error picking image file:', error);
      Alert.alert('Error', error.message || 'Gagal memilih foto dari file');
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
    console.log('renderCanvasForExport called');
    console.log('selectedPhoto:', !!selectedPhoto);
    console.log('selectedLayout:', !!selectedLayout);
    console.log('Platform.OS:', Platform.OS);

    // Check if we have valid content to export
    const isGrid = selectedLayout && (selectedLayout.cols > 1 || selectedLayout.rows > 1);
    const hasPhotosInGrid = isGrid && gridCells.some(cell => cell.photoId);
    const hasSelectedPhoto = !!selectedPhoto;

    if (!selectedLayout || Platform.OS !== 'web') {
      console.log('Early return: no layout or not web platform');
      return null;
    }

    if (!hasSelectedPhoto && !hasPhotosInGrid) {
      console.log('Early return: no photos to export');
      return null;
    }

    return new Promise((resolve) => {
      console.log('Creating canvas with dimensions:', EXPORT_WIDTH, EXPORT_HEIGHT);
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = EXPORT_WIDTH;
      canvas.height = EXPORT_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.log('Failed to get canvas context');
        resolve(null);
        return;
      }

      // Helper function untuk draw foto dengan support transforms
      const drawPhoto = (photoLink: string, x: number, y: number, width: number, height: number, photoId?: string) => {
        return new Promise<void>((photoResolve) => {
          const img = document.createElement('img') as HTMLImageElement;
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Get photo transform jika ada
            const transform = photoId ? getPhotoTransform(photoId) : undefined;

            // Save canvas state
            ctx.save();

            // Apply transforms
            if (transform) {
              ctx.translate(x + width / 2 + transform.x, y + height / 2 + transform.y);
              ctx.scale(transform.scale, transform.scale);
              ctx.rotate(transform.rotation);
              ctx.drawImage(img, -width / 2, -height / 2, width, height);
            } else {
              ctx.drawImage(img, x, y, width, height);
            }

            // Restore canvas state
            ctx.restore();
            photoResolve();
          };
          img.onerror = () => photoResolve(); // Skip jika foto gagal load
          img.src = photoLink;
        });
      };

      // Define drawFrameAndStickers sebelum di-call
      const drawFrameAndStickers = () => {
        console.log('drawFrameAndStickers called');
        // 2. Draw frame (SVG) - render as colored rectangles
        if (selectedFrame && selectedFrame.type === 'svg') {
          console.log('Drawing frame:', selectedFrame.color);
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
        console.log('Drawing stickers:', stickers.length);
        stickers.forEach((sticker) => {
          if (sticker.emoji) {
            const fontSize = Math.round((EXPORT_WIDTH * 60) / CANVAS_WIDTH);
            ctx.font = `${fontSize}px Arial`;
            const x = (sticker.x / CANVAS_WIDTH) * EXPORT_WIDTH;
            const y = (sticker.y / CANVAS_HEIGHT) * EXPORT_HEIGHT;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(sticker.scale, sticker.scale);
            ctx.rotate(sticker.rotation);
            ctx.fillText(sticker.emoji, 0, 0);
            ctx.restore();
          }
        });

        console.log('Canvas rendering complete, resolving');
        resolve(canvas);
      };

      // Determine apakah grid atau single photo
      const isGrid = selectedLayout && (selectedLayout.cols > 1 || selectedLayout.rows > 1);
      console.log('isGrid:', isGrid);

      if (isGrid && selectedLayout) {
        console.log('Rendering grid layout');
        // Multi-cell grid: draw semua cells dengan foto masing-masing
        const cellWidth = EXPORT_WIDTH / selectedLayout.cols;
        const cellHeight = EXPORT_HEIGHT / selectedLayout.rows;
        let photoLoadCount = 0;
        const totalCells = gridCells.length;
        console.log('Grid cells:', totalCells);

        gridCells.forEach((cell, idx) => {
          const col = idx % selectedLayout.cols;
          const row = Math.floor(idx / selectedLayout.cols);
          const x = col * cellWidth;
          const y = row * cellHeight;

          const cellPhoto = cell.photoId
            ? photoList.find(p => p.id === cell.photoId)
            : selectedPhoto;

          if (cellPhoto) {
            console.log('Drawing photo for cell', idx, cellPhoto.link);
            drawPhoto(cellPhoto.link, x, y, cellWidth, cellHeight).then(() => {
              photoLoadCount++;
              console.log('Photo loaded for cell', idx, photoLoadCount, '/', totalCells);
              if (photoLoadCount === totalCells) {
                // Semua foto selesai di-draw, sekarang draw frame dan stickers
                console.log('All photos loaded, drawing frame and stickers');
                drawFrameAndStickers();
              }
            });
          } else {
            photoLoadCount++;
            console.log('Empty cell', idx, photoLoadCount, '/', totalCells);
            if (photoLoadCount === totalCells) {
              console.log('All cells processed, drawing frame and stickers');
              drawFrameAndStickers();
            }
          }
        });
      } else {
        console.log('Rendering single photo layout');
        // Single photo: draw dengan transforms
        if (selectedPhoto) {
          console.log('Drawing single photo:', selectedPhoto.link);
          drawPhoto(selectedPhoto.link, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT, selectedPhoto.id).then(() => {
            console.log('Single photo loaded, drawing frame and stickers');
            drawFrameAndStickers();
          });
        } else {
          console.log('No photo selected, drawing frame and stickers only');
          drawFrameAndStickers();
        }
      }
    });
  };

  const saveToGallery = async () => {
    console.log('saveToGallery called');
    console.log('selectedPhoto:', selectedPhoto);
    console.log('selectedLayout:', selectedLayout);
    console.log('Platform.OS:', Platform.OS);

    // Check if we have photos to save
    const isGrid = selectedLayout && (selectedLayout.cols > 1 || selectedLayout.rows > 1);
    const hasPhotosInGrid = isGrid && gridCells.some(cell => cell.photoId);
    const hasSelectedPhoto = !!selectedPhoto;

    if (!hasSelectedPhoto && !hasPhotosInGrid) {
      Alert.alert('Error', 'Silakan pilih foto dulu atau letakkan foto di grid');
      return;
    }

    if (!selectedLayout) {
      Alert.alert('Error', 'Silakan pilih layout dulu');
      return;
    }

    setSaving(true);
    try {
      // Show loading message for large photo counts
      const totalPhotos = isGrid ? gridCells.filter(cell => cell.photoId).length : (selectedPhoto ? 1 : 0);
      if (totalPhotos > 10) {
        Alert.alert('Memproses', `Sedang memproses ${totalPhotos} foto. Mohon tunggu...`);
      }

      // Wait untuk memastikan semua animasi selesai dan UI sudah render
      await new Promise(resolve => setTimeout(resolve, 500));

      if (Platform.OS === 'web') {
        console.log('Using web export method');
        // Web: Render canvas manually untuk memastikan frame dan stiker tersimpan
        try {
          const exportCanvas = await renderCanvasForExport();
          console.log('exportCanvas:', exportCanvas);

          if (!exportCanvas) {
            throw new Error('Gagal render canvas');
          }

          // Convert to blob and download
          exportCanvas.toBlob((blob: Blob | null) => {
            console.log('toBlob callback called, blob:', blob);
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

  // Draggable Photo Component dengan pan gesture
  const DraggablePhoto = React.memo(({ photo, cellWidth, cellHeight }: { photo: PhotoTransaction; cellWidth: number; cellHeight: number }) => {
    const currentTransform = getPhotoTransform(photo.id);
    // Store initial transform values to avoid recalculation during drag
    const initialX = currentTransform?.x ?? 0;
    const initialY = currentTransform?.y ?? 0;

    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);

    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        // Use stored initial values + translation
        translateX.value = initialX + e.translationX;
        translateY.value = initialY + e.translationY;
      })
      .onEnd(() => {
        runOnJS(updatePhotoTransform)(photo.id, {
          x: translateX.value,
          y: translateY.value,
        });
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      };
    });

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              width: cellWidth,
              height: cellHeight,
              position: 'absolute',
              left: 0,
              top: 0,
            },
            animatedStyle,
          ]}
        >
          <Image
            source={{ uri: photo.link }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Animated.View>
      </GestureDetector>
    );
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Main Content - 3 Column Layout */}
      <View style={[styles.mainContent, draggingPhotoId && { overflow: 'visible' }]}>
        {/* Left Column - Photo Selector - Hanya muncul jika layout dipilih */}
        {selectedLayout && (
          <View style={[styles.photoColumn, draggingPhotoId && { overflow: 'visible', zIndex: 1000 }]}>
            <Text style={styles.photoColumnTitle}>Pilih Foto</Text>

            {/* Image Picker Buttons */}
            <View style={styles.imagePickerButtons}>
              <TouchableOpacity
                onPress={pickImagesFromGallery}
                style={styles.imagePickerButton}
              >
                <Text style={styles.imagePickerButtonText}>📁 Buka Galeri</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImageFromFile}
                style={styles.imagePickerButton}
              >
                <Text style={styles.imagePickerButtonText}>📄 Pilih File</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={[styles.photoColumnScroll, draggingPhotoId && { overflow: 'visible' }]}>
              {loading ? (
                <View style={styles.photoListLoading}>
                  <ActivityIndicator size="large" color="#F7931A" />
                </View>
              ) : photoList.length === 0 ? (
                <View style={styles.emptyPhotoList}>
                  <Text style={styles.emptyPhotoListText}>Belum ada foto dipilih</Text>
                  <Text style={[styles.emptyPhotoListText, { fontSize: 12, marginBottom: 16, color: '#666' }]}>
                    Gunakan tombol di atas untuk memilih foto dari galeri atau file
                  </Text>
                </View>
              ) : (
                <View style={[styles.photoGridContainer, draggingPhotoId && { overflow: 'visible' }]}>
                  {photoList.map((photo) => {
                    // Memoize isDragging to prevent unnecessary re-renders of all components
                    const isDragging = draggingPhotoId === photo.id;
                    return (
                      <DraggablePhotoListItem
                        key={photo.id}
                        photo={photo}
                        isDragging={isDragging}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDropWithPosition}
                      />
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Center Column - Canvas/Preview */}
        {selectedLayout && (
          <View style={styles.centerColumn}>
            <View
              ref={canvasRef}
              collapsable={false}
              style={[styles.canvas, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}
            >
              {/* Grid Cells */}
              {selectedLayout && (selectedLayout.cols > 1 || selectedLayout.rows > 1) ? (
                // Multi-cell grid
                <View style={styles.gridContainer}>
                  {gridCells.map((cell, idx) => {
                    const cellWidth = CANVAS_WIDTH / selectedLayout!.cols;
                    const cellHeight = CANVAS_HEIGHT / selectedLayout!.rows;
                    const col = idx % selectedLayout!.cols;
                    const row = Math.floor(idx / selectedLayout!.cols);

                    // Get photo untuk cell ini
                    const cellPhoto = cell.photoId
                      ? photoList.find(p => p.id === cell.photoId)
                      : selectedPhoto;

                    return (
                      <TouchableOpacity
                        key={cell.id}
                        onPress={() => {
                          if (draggingPhotoId) {
                            handleDropPhotoToCell(cell.id, draggingPhotoId);
                          }
                        }}
                        style={[
                          styles.gridCell,
                          {
                            width: cellWidth,
                            height: cellHeight,
                            left: col * cellWidth,
                            top: row * cellHeight,
                          },
                          draggedOverCellId === cell.id && styles.gridCellDragOver,
                        ]}
                      >
                        {cellPhoto ? (
                          // Cell with photo - add long press gesture for drag
                          <GestureDetector
                            gesture={Gesture.LongPress()
                              .minDuration(500) // 500ms for grid cells
                              .onStart(() => {
                                console.log('Long press on cell', cell.id, 'with photo', cell.photoId);
                                setDraggingFromGrid(cell.photoId);
                                setDraggingPhotoId(cell.photoId);
                                setDraggedOverCellId(null);
                              })
                            }
                          >
                            <View style={{ flex: 1 }}>
                              <Image
                                source={{ uri: cellPhoto.link }}
                                style={styles.backgroundPhoto}
                                resizeMode="cover"
                              />
                            </View>
                          </GestureDetector>
                        ) : (
                          // Empty cell
                          draggingPhotoId && (
                            <View style={styles.gridCellDropZone}>
                              <Text style={styles.gridCellDropZoneText}>Drop photo here</Text>
                            </View>
                          )
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : selectedPhoto ? (
                // Single photo (1x1 layout) - Draggable
                <DraggablePhoto photo={selectedPhoto} cellWidth={CANVAS_WIDTH} cellHeight={CANVAS_HEIGHT} />
              ) : (
                // No photo selected
                <View style={styles.gridCellDropZone}>
                  <Text style={styles.gridCellDropZoneText}>Pilih foto</Text>
                </View>
              )}

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
        <View style={styles.rightColumn}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.controlsScroll}>
            {/* Layout Selector - ALWAYS VISIBLE */}
            <View style={styles.controlSection}>
              <Text style={styles.controlTitle}>Layout</Text>
              <View style={styles.layoutGrid}>
                {LAYOUT_TEMPLATES.map((layout) => (
                  <TouchableOpacity
                    key={layout.id}
                    onPress={() => setSelectedLayout(layout)}
                    style={[
                      styles.layoutItem,
                      selectedLayout && selectedLayout.id === layout.id && styles.layoutItemActive,
                    ]}
                  >
                    <Text style={styles.layoutItemText}>{layout.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frame Selector - Hanya muncul jika layout dipilih */}
            {selectedLayout && (
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
            )}

            {/* Sticker Selector - Hanya muncul jika layout dipilih */}
            {selectedLayout && (
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
            )}

            {/* Clear Buttons - Hanya muncul jika layout dipilih */}
            {selectedLayout && (
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
            )}
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
    elevation: 4,
  },
  backgroundPhoto: {
    width: '100%',
    height: '100%',
  },
  gridCellDropZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 147, 26, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(247, 147, 26, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 8,
    margin: 4,
  },
  gridCellDropZoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F7931A',
    textAlign: 'center',
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
    justifyContent: 'space-between',
  },
  photoGridItem: {
    width: 80,
    height: 80,
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
  // Layout Selector Styles
  layoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  layoutItem: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  layoutItemActive: {
    backgroundColor: '#FFE5CC',
    borderColor: '#F7931A',
  },
  layoutItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  // Grid Styles
  gridContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  gridCell: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  // Photo Grid Item Wrapper & Assign Button
  photoGridItemWrapper: {
    position: 'relative',
  },
  photoGridItemWrapperDragging: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  photoGridItemDragging: {
    borderWidth: 3,
    borderColor: '#F7931A',
    backgroundColor: '#FFE5CC',
  },
  assignPhotoButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7931A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignPhotoButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  // Grid Cell Drop Zone Styles
  gridCellDragOver: {
    backgroundColor: 'rgba(247, 147, 26, 0.2)',
    borderWidth: 3,
    borderColor: '#F7931A',
    borderStyle: 'dashed',
  },
  // Image Picker Button Styles
  imagePickerButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  imagePickerButton: {
    flex: 1,
    backgroundColor: '#F7931A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  imagePickerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  // Pagination Styles
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7931A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationButtonTextDisabled: {
    color: '#999',
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});
