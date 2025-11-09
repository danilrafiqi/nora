/**
 * Reusable components untuk Photo Editor
 */

import { PhotoTransaction } from '@/services/photoService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SvgUri } from 'react-native-svg';
import { getFrameUrl } from '@/services/frameService';
import { PhotoTransform, StickerData } from './types';

// Image loading concurrency limiter - removed for better UX
// let activeImageLoads = 0;
// const MAX_CONCURRENT_LOADS = 5;

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
      height={size * 1.5}
      style={StyleSheet.absoluteFillObject}
      color={color}
      preserveAspectRatio="xMidYMid slice"
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

// ============ DRAGGABLE PHOTO FROM LIST ============

interface DraggablePhotoListItemProps {
    photo: PhotoTransaction;
    isDragging: boolean;
    onDragStart: (photoId: string) => void;
    onDragEnd: () => void;
    onDrop: (photoId: string, x: number, y: number) => void;
}

export const DraggablePhotoListItem: React.FC<DraggablePhotoListItemProps> = React.memo(({
    photo,
    isDragging,
    onDragStart,
    onDragEnd,
    onDrop,
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

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

    // Memoize animated style to prevent unnecessary recalculations
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: isDragging ? 1.05 : 1 },
        ],
        opacity: isDragging ? 0.8 : 1,
    }), [isDragging]); // Only recalculate when isDragging changes

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
                        resizeMode="cover"
                    />
                </View>
            </Animated.View>
        </GestureDetector>
    );
});

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
    // Photo list item styles
    photoGridItemWrapper: {
        position: 'relative',
    },
    photoGridItem: {
        width: 80,
        height: 80,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    photoGridItemDragging: {
        borderWidth: 3,
        borderColor: '#F7931A',
        backgroundColor: '#FFE5CC',
    },
    photoGridItemImage: {
        width: '100%',
        height: '100%',
    },
});
