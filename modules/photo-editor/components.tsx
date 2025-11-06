/**
 * Reusable components untuk Photo Editor
 */

import { PhotoTransaction } from '@/services/photoService';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SvgUri } from 'react-native-svg';
import { getFrameUrl } from '@/services/frameService';
import { PhotoTransform, StickerData } from './types';

// ============ FRAME COMPONENTS ============

// Base Frame Component that loads URL dynamically
const FrameComponent = ({
  frameId,
  size,
  color
}: {
  frameId: string;
  size: number;
  color: string
}) => {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFrameUrl = async () => {
      try {
        setLoading(true);
        const url = await getFrameUrl(frameId);
        setFrameUrl(url);
        setError(null);
      } catch (err) {
        console.error(`Failed to load frame ${frameId}:`, err);
        setError('Failed to load frame');
      } finally {
        setLoading(false);
      }
    };

    loadFrameUrl();
  }, [frameId]);

  if (loading) {
    return (
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: color, fontSize: 12 }}>Loading...</Text>
      </View>
    );
  }

  if (error || !frameUrl) {
    return (
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: color, fontSize: 12 }}>Frame unavailable</Text>
      </View>
    );
  }

  return (
    <SvgUri
      uri={frameUrl}
      width={size}
      height={size}
      style={StyleSheet.absoluteFillObject}
      color={color}
    />
  );
};

export const SimpleBorderFrame = ({ size, color }: { size: number; color: string }) => (
  <FrameComponent frameId="simple" size={size} color={color} />
);

export const DoubleBorderFrame = ({ size, color }: { size: number; color: string }) => (
  <FrameComponent frameId="double" size={size} color={color} />
);

export const DecorativeFrame = ({ size, color }: { size: number; color: string }) => (
  <FrameComponent frameId="decorative" size={size} color={color} />
);

export const RoundedFrame = ({ size, color }: { size: number; color: string }) => (
  <FrameComponent frameId="rounded" size={size} color={color} />
);

// ============ STICKER ITEM COMPONENT ============

interface StickerItemProps {
    sticker: StickerData;
    isActive: boolean;
    onDelete: (id: string) => void;
    onSetActive: (id: string) => void;
    setStickers: (stickers: StickerData[]) => void;
}

export const StickerItem: React.FC<StickerItemProps> = ({
    sticker,
    isActive,
    onDelete,
    onSetActive,
    setStickers,
}) => {
    const translateX = useSharedValue(sticker.x);
    const translateY = useSharedValue(sticker.y);
    const scale = useSharedValue(sticker.scale);
    const rotation = useSharedValue(sticker.rotation);

    React.useEffect(() => {
        translateX.value = sticker.x;
        translateY.value = sticker.y;
        scale.value = sticker.scale;
        rotation.value = sticker.rotation;
    }, [sticker.id]);

    const panGestureWithTap = Gesture.Pan()
        .minDistance(5)
        .onStart(() => {
            translateX.value = sticker.x;
            translateY.value = sticker.y;
            onSetActive(sticker.id);
        })
        .onUpdate((e) => {
            translateX.value = sticker.x + e.translationX;
            translateY.value = sticker.y + e.translationY;
        })
        .onEnd((e) => {
            const newX = sticker.x + e.translationX;
            const newY = sticker.y + e.translationY;
            runOnJS(setStickers)(prev => prev.map(s =>
                s.id === sticker.id ? { ...s, x: newX, y: newY } : s
            ) as any);
        });

    const tapGesture = Gesture.Tap()
        .numberOfTaps(1)
        .maxDuration(250)
        .onEnd(() => onSetActive(sticker.id));

    const pinchWithActivate = Gesture.Pinch()
        .onStart(() => {
            scale.value = sticker.scale;
            onSetActive(sticker.id);
        })
        .onUpdate((e) => {
            scale.value = sticker.scale * e.scale;
        })
        .onEnd((e) => {
            const newScale = sticker.scale * e.scale;
            runOnJS(setStickers)(prev => prev.map(s =>
                s.id === sticker.id ? { ...s, scale: newScale } : s
            ) as any);
        });

    const rotateWithActivate = Gesture.Rotation()
        .onStart(() => {
            rotation.value = sticker.rotation;
            onSetActive(sticker.id);
        })
        .onUpdate((e) => {
            rotation.value = sticker.rotation + e.rotation;
        })
        .onEnd((e) => {
            const newRotation = sticker.rotation + e.rotation;
            runOnJS(setStickers)(prev => prev.map(s =>
                s.id === sticker.id ? { ...s, rotation: newRotation } : s
            ) as any);
        });

    const composedGesture = Gesture.Race(
        tapGesture,
        Gesture.Simultaneous(
            panGestureWithTap,
            Gesture.Simultaneous(pinchWithActivate, rotateWithActivate)
        )
    );

    const animatedStyle = useAnimatedStyle(() => ({
        left: translateX.value,
        top: translateY.value,
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}rad` },
        ],
    }));

    return (
        <Animated.View style={[styles.stickerWrapper, animatedStyle]}>
            <GestureDetector gesture={composedGesture}>
                <Pressable onPress={() => onSetActive(sticker.id)} style={styles.stickerPressable}>
                    <Animated.View style={[styles.stickerContainer, isActive && styles.activeSticker]}>
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
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(sticker.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

// ============ DRAGGABLE PHOTO FROM LIST ============

interface DraggablePhotoListItemProps {
    photo: PhotoTransaction;
    isDragging: boolean;
    onDragStart: (photoId: string) => void;
    onDragEnd: () => void;
    onDrop: (photoId: string, x: number, y: number) => void;
}

export const DraggablePhotoListItem: React.FC<DraggablePhotoListItemProps> = ({
    photo,
    isDragging,
    onDragStart,
    onDragEnd,
    onDrop,
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    // Reset position when dragging ends
    React.useEffect(() => {
        if (!isDragging) {
            translateX.value = 0;
            translateY.value = 0;
        }
    }, [isDragging]);

    const panGesture = Gesture.Pan()
        .minDistance(10) // Require some movement to start
        .onStart(() => {
            runOnJS(onDragStart)(photo.id);
        })
        .onUpdate((e) => {
            translateX.value = e.translationX;
            translateY.value = e.translationY;
        })
        .onEnd((e) => {
            // Check if dropped on grid cell area
            const dropX = e.absoluteX;
            const dropY = e.absoluteY;

            // Reset position and end drag
            translateX.value = 0;
            translateY.value = 0;
            runOnJS(onDragEnd)();

            // Pass drop position to parent
            runOnJS(onDrop)(photo.id, dropX, dropY);
        });

    const composedGesture = panGesture;

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: isDragging ? 1.05 : 1 },
        ],
        opacity: isDragging ? 0.8 : 1,
    }));

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View
                style={[
                    styles.photoGridItemWrapper,
                    animatedStyle,
                    isDragging && {
                        elevation: 10,
                        zIndex: 1000,
                    },
                ]}
            >
                <View
                    style={[
                        styles.photoGridItem,
                        isDragging && styles.photoGridItemDragging,
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
                        {isDragging && (
                            <Text style={{ fontSize: 10, color: '#FFE5CC', fontWeight: 'bold', marginTop: 4 }}>
                                🎯 Drag to any grid cell (replace existing photos)
                            </Text>
                        )}
                    </View>
                </View>
            </Animated.View>
        </GestureDetector>
    );
};

// ============ DRAGGABLE PHOTO IN CANVAS ============

interface DraggablePhotoProps {
    photo: PhotoTransaction;
    cellWidth: number;
    cellHeight: number;
    getPhotoTransform: (id: string) => PhotoTransform | undefined;
    updatePhotoTransform: (id: string, updates: Partial<PhotoTransform>) => void;
}

export const DraggablePhoto: React.FC<DraggablePhotoProps> = ({
    photo,
    cellWidth,
    cellHeight,
    getPhotoTransform,
    updatePhotoTransform,
}) => {
    const transform = getPhotoTransform(photo.id);
    const translateX = useSharedValue(transform?.x ?? 0);
    const translateY = useSharedValue(transform?.y ?? 0);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = (transform?.x ?? 0) + e.translationX;
            translateY.value = (transform?.y ?? 0) + e.translationY;
        })
        .onEnd(() => {
            runOnJS(updatePhotoTransform)(photo.id, {
                x: translateX.value,
                y: translateY.value,
            });
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

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
                <Image source={{ uri: photo.link }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </Animated.View>
        </GestureDetector>
    );
};

// ============ STYLES ============

const styles = StyleSheet.create({
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
    stickerImage: {
        width: '100%',
        height: '100%',
    },
    stickerEmoji: {
        fontSize: 60,
    },
    // Photo list item styles
    photoGridItemWrapper: {
        position: 'relative',
    },
    photoGridItem: {
        flexDirection: 'row',
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
    },
    photoGridItemDragging: {
        borderWidth: 3,
        borderColor: '#F7931A',
        backgroundColor: '#FFE5CC',
    },
    photoGridItemImage: {
        width: 80,
        height: 80,
    },
    photoGridItemOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 12,
        justifyContent: 'center',
    },
    photoGridItemName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    photoGridItemPackage: {
        fontSize: 11,
        color: '#ddd',
    },
});
