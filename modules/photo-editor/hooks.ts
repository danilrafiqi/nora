/**
 * Custom hooks untuk Photo Editor
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { PhotoTransaction } from '@/services/photoService';
import { GridCell, PhotoTransform, StickerData, LayoutTemplate } from './types';

// ============ usePhotoManagement ============

export const usePhotoManagement = () => {
  const [photoList, setPhotoList] = useState<PhotoTransaction[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoTransaction | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPhotos = useCallback(async () => {
    console.log('loadPhotos called');
    setLoading(true);
    try {
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
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal memuat foto dari database');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectPhoto = (photo: PhotoTransaction) => {
    setSelectedPhoto(photo);
  };

  return {
    photoList,
    selectedPhoto,
    loading,
    loadPhotos,
    selectPhoto,
    setPhotoList,
    setSelectedPhoto,
  };
};

// ============ useGridCells ============

export const useGridCells = (selectedLayout: LayoutTemplate | null) => {
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);
  const [draggedOverCellId, setDraggedOverCellId] = useState<string | null>(null);

  const initializeGridCells = useCallback((layout: LayoutTemplate | null) => {
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
  }, []);

  const assignPhotoToCell = (cellId: string, photoId: string) => {
    setGridCells(prev => prev.map(cell =>
      cell.id === cellId ? { ...cell, photoId } : cell
    ));
  };

  const clearPhotoFromCell = (cellId: string) => {
    setGridCells(prev => prev.map(cell =>
      cell.id === cellId ? { ...cell, photoId: null } : cell
    ));
  };

  const handleDropPhotoToCell = (cellId: string, photoId: string) => {
    assignPhotoToCell(cellId, photoId);
    setDraggingPhotoId(null);
    setDraggedOverCellId(null);
  };

  return {
    gridCells,
    draggingPhotoId,
    draggedOverCellId,
    initializeGridCells,
    assignPhotoToCell,
    clearPhotoFromCell,
    handleDropPhotoToCell,
    setDraggingPhotoId,
    setDraggedOverCellId,
  };
};

// ============ usePhotoTransforms ============

export const usePhotoTransforms = () => {
  const [photoTransforms, setPhotoTransforms] = useState<PhotoTransform[]>([]);

  const getPhotoTransform = (photoId: string): PhotoTransform | undefined => {
    return photoTransforms.find(t => t.photoId === photoId);
  };

  const updatePhotoTransform = (photoId: string, updates: Partial<PhotoTransform>) => {
    setPhotoTransforms(prev => {
      const existing = prev.find(t => t.photoId === photoId);
      if (existing) {
        return prev.map(t => t.photoId === photoId ? { ...t, ...updates } : t);
      } else {
        return [...prev, { photoId, x: 0, y: 0, scale: 1, rotation: 0, ...updates }];
      }
    });
  };

  const deletePhotoTransform = (photoId: string) => {
    setPhotoTransforms(prev => prev.filter(t => t.photoId !== photoId));
  };

  return {
    photoTransforms,
    getPhotoTransform,
    updatePhotoTransform,
    deletePhotoTransform,
  };
};

// ============ useStickerManagement ============

export const useStickerManagement = (CANVAS_WIDTH: number, CANVAS_HEIGHT: number) => {
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

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

  return {
    stickers,
    activeStickerId,
    addSticker,
    deleteSticker,
    setStickers,
    setActiveStickerId,
  };
};

// ============ useFrameManagement ============

export const useFrameManagement = () => {
  const [selectedFrame, setSelectedFrame] = useState<any>(null);

  const addFrame = (frame: any) => {
    setSelectedFrame(frame);
  };

  return {
    selectedFrame,
    addFrame,
    setSelectedFrame,
  };
};
